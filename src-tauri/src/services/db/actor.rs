use std::path::PathBuf;

use rusqlite::{functions::FunctionFlags, Connection};
use tokio::sync::mpsc;

use crate::{services::db::commands::DBCommand, util::hangul::decompose_hangul_to_string};

// --- 3. 일꾼: DbActor (모듈 외부로 노출되지 않음) ---
pub struct DBActor {
    conn: Connection,
    receiver: mpsc::Receiver<DBCommand>,
}

impl DBActor {
    pub fn new(path: PathBuf, receiver: mpsc::Receiver<DBCommand>) -> anyhow::Result<Self> {
        let conn = Connection::open(path)?;
        Ok(Self { conn, receiver })
    }

    /// 메시지 루프 실행
    pub fn run(&mut self) {
        // run이 호출된 직후 초기화 로직 실행
        if let Err(e) = self.initialize_db() {
            eprintln!("DB 초기화 실패: {}", e);
            // 초기화 실패 시 스레드 종료
            return;
        }

        while let Some(cmd) = self.receiver.blocking_recv() {
            self.handle_command(cmd);
        }
    }

    /// DB 초기화: 마이그레이션, 커스텀 함수 등록 등
    fn initialize_db(&mut self) -> anyhow::Result<()> {
        // 성능 최적화 PRAGMA
        self.conn.execute_batch("PRAGMA journal_mode = WAL;")?;

        // 스키마 생성
        self.run_migrations()?;

        // 커스텀 SQL 함수 등록
        self.register_custom_functions()?;

        // FTS 트리거 생성
        self.create_fts_triggers()?;

        println!("데이터베이스가 성공적으로 초기화되었습니다.");
        Ok(())
    }

    fn handle_command(&mut self, cmd: DBCommand) {
        match cmd {
            DBCommand::Initialize => {
                // 이미 new() -> run() -> initialize_db() 흐름에서 처리되었으므로
                // 이 커맨드는 사실상 초기화가 잘 되었는지 확인하는 용도로 사용될 수 있습니다.
                println!("DBCommand::Initialize 수신됨. 이미 초기화 완료됨.");
            } // 다른 커맨드 핸들러를 여기에 추가...
        }
    }

    // --- 세부 구현 ---

    fn run_migrations(&self) -> rusqlite::Result<()> {
        let scheme = include_str!("../../../migrations/schema.sql");

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
                INSERT INTO chat_logs_fts(rowid, message_morph, message_jamo, chat_log_id)
                VALUES (new.id, new.message, DECOMPOSE_HANGUL(new.message), new.id);
            END;

            CREATE TRIGGER IF NOT EXISTS t_chat_logs_delete AFTER DELETE ON chat_logs
            BEGIN
                INSERT INTO chat_logs_fts(chat_logs_fts, rowid) VALUES ('delete', old.id);
            END;

            CREATE TRIGGER IF NOT EXISTS t_chat_logs_update AFTER UPDATE ON chat_logs
            BEGIN
                INSERT INTO chat_logs_fts(chat_logs_fts, rowid, message_morph, message_jamo, chat_log_id)
                VALUES ('delete', old.id, old.message, DECOMPOSE_HANGUL(old.message), old.id);
                INSERT INTO chat_logs_fts(rowid, message_morph, message_jamo, chat_log_id)
                VALUES (new.id, new.message, DECOMPOSE_HANGUL(new.message), new.id);
            END;
            "
        )?;
        Ok(())
    }
}
