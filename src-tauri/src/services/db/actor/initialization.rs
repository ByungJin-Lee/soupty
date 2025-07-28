use crate::util::hangul::decompose_hangul_to_string;
use rusqlite::{functions::FunctionFlags, Connection};

pub struct DBInitializer<'a> {
    conn: &'a Connection,
}

impl<'a> DBInitializer<'a> {
    pub fn new(conn: &'a Connection) -> Self {
        Self { conn }
    }

    /// DB 초기화: 마이그레이션, 커스텀 함수 등록 등
    pub fn initialize(&self) -> anyhow::Result<()> {
        // 성능 최적화 PRAGMA
        self.conn.execute_batch("PRAGMA journal_mode = WAL;")?;

        // 외래 키 제약 조건 활성화
        self.conn.execute_batch("PRAGMA foreign_keys = ON;")?;

        // 스키마 생성
        self.run_migrations()?;

        // 커스텀 SQL 함수 등록
        self.register_custom_functions()?;

        // FTS 트리거 생성
        self.create_fts_triggers()?;

        println!("데이터베이스가 성공적으로 초기화되었습니다.");
        Ok(())
    }

    fn run_migrations(&self) -> rusqlite::Result<()> {
        let scheme = include_str!("../../../../migrations/schema.sql");
        self.conn.execute_batch(scheme)?;
        Ok(())
    }

    fn register_custom_functions(&self) -> rusqlite::Result<()> {
        self.conn.create_scalar_function(
            "DECOMPOSE_HANGUL",
            1,
            FunctionFlags::SQLITE_UTF8 | FunctionFlags::SQLITE_DETERMINISTIC,
            |ctx| {
                let text = ctx.get::<String>(0)?;
                Ok(decompose_hangul_to_string(&text))
            },
        )
    }

    fn create_fts_triggers(&self) -> rusqlite::Result<()> {
        self.conn.execute_batch(
            "
            CREATE TRIGGER IF NOT EXISTS t_chat_logs_insert AFTER INSERT ON chat_logs
            BEGIN
                INSERT INTO chat_logs_fts(rowid, message_jamo, chat_log_id)
                VALUES (new.id, DECOMPOSE_HANGUL(new.message), new.id);
            END;

            CREATE TRIGGER IF NOT EXISTS t_chat_logs_delete AFTER DELETE ON chat_logs
            BEGIN
                INSERT INTO chat_logs_fts(chat_logs_fts, rowid) VALUES ('delete', old.id);
            END;

            CREATE TRIGGER IF NOT EXISTS t_chat_logs_update AFTER UPDATE ON chat_logs
            BEGIN
                INSERT INTO chat_logs_fts(chat_logs_fts, rowid, message_jamo, chat_log_id)
                VALUES ('delete', old.id, DECOMPOSE_HANGUL(old.message), old.id);
                INSERT INTO chat_logs_fts(rowid, message_jamo, chat_log_id)
                VALUES (new.id, DECOMPOSE_HANGUL(new.message), new.id);
            END;
            ",
        )?;
        Ok(())
    }
}
