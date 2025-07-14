use chrono::{DateTime, Utc};
use rusqlite::{Connection};
use tokio::sync::oneshot;

use crate::services::db::commands::{ChannelData, ChatLogData, EventLogData, UserData};

pub struct CommandHandlers<'a> {
    conn: &'a Connection,
}

impl<'a> CommandHandlers<'a> {
    pub fn new(conn: &'a Connection) -> Self {
        Self { conn }
    }

    pub fn handle_initialize(&self) {
        println!("DBCommand::Initialize 수신됨. 이미 초기화 완료됨.");
    }

    pub fn handle_create_broadcast_session(
        &self,
        channel_id: String,
        title: String,
        started_at: DateTime<Utc>,
        reply_to: oneshot::Sender<Result<i64, String>>,
    ) {
        // First try to insert new session
        let result = self.conn.prepare_cached(
            "INSERT INTO broadcast_sessions (channel_id, title, started_at) VALUES (?1, ?2, ?3) RETURNING id"
        )
        .and_then(|mut stmt| {
            stmt.query_row([&channel_id, &title, &started_at.to_rfc3339()], |row| {
                row.get::<_, i64>(0)
            })
        });

        // If insert fails due to unique constraint, find existing session
        let final_result = match result {
            Ok(id) => Ok(id),
            Err(rusqlite::Error::SqliteFailure(error, _)) 
                if error.code == rusqlite::ErrorCode::ConstraintViolation => {
                // Find existing session with same channel_id and started_at
                self.conn.prepare_cached(
                    "SELECT id FROM broadcast_sessions WHERE channel_id = ?1 AND started_at = ?2"
                )
                .and_then(|mut stmt| {
                    stmt.query_row([&channel_id, &started_at.to_rfc3339()], |row| {
                        row.get::<_, i64>(0)
                    })
                })
                .map_err(|e| e.to_string())
            },
            Err(e) => Err(e.to_string()),
        };

        let _ = reply_to.send(final_result);
    }

    pub fn handle_end_broadcast_session(
        &self,
        broadcast_id: i64,
        ended_at: DateTime<Utc>,
        reply_to: oneshot::Sender<Result<(), String>>,
    ) {
        let result = self
            .conn
            .prepare_cached("UPDATE broadcast_sessions SET ended_at = ?1 WHERE id = ?2")
            .and_then(|mut stmt| {
                stmt.execute([&ended_at.to_rfc3339(), &broadcast_id.to_string()])?;
                Ok(())
            })
            .map_err(|e| e.to_string());

        let _ = reply_to.send(result);
    }

    pub fn handle_upsert_users(
        &self,
        users: Vec<UserData>,
        reply_to: oneshot::Sender<Result<(), String>>,
    ) {
        let result = self
            .conn
            .prepare_cached(
                "INSERT INTO users (user_id, username, last_seen) VALUES (?1, ?2, ?3) ON CONFLICT(user_id) DO UPDATE SET username = excluded.username, last_seen = excluded.last_seen",
            )
            .and_then(|mut stmt| {
                for user in users {
                    stmt.execute([&user.user_id, &user.username, &user.last_seen.to_rfc3339()])?;
                }
                Ok(())
            })
            .map_err(|e| e.to_string());

        let _ = reply_to.send(result);
    }

    pub fn handle_upsert_channels(
        &self,
        channels: Vec<ChannelData>,
        reply_to: oneshot::Sender<Result<(), String>>,
    ) {
        let result = self
            .conn
            .prepare_cached(
                "INSERT INTO channels (channel_id, channel_name, last_updated) VALUES (?1, ?2, ?3) ON CONFLICT(channel_id) DO UPDATE SET channel_name = excluded.channel_name, last_updated = excluded.last_updated",
            )
            .and_then(|mut stmt| {
                for channel in channels {
                    stmt.execute([&channel.channel_id, &channel.channel_name, &channel.last_updated.to_rfc3339()])?;
                }
                Ok(())
            })
            .map_err(|e| e.to_string());

        let _ = reply_to.send(result);
    }

    
    pub fn handle_delete_channel(
        &self,
        channel_id: String,
        reply_to: oneshot::Sender<Result<(), String>>,
    ) {
        let result = self
            .conn
            .prepare_cached(
                "DELETE FROM channels where channel_id = ?1",
            )
            .and_then(|mut stmt| {
                stmt.execute([channel_id])?;
                Ok(())
            })
            .map_err(|e| e.to_string());

        let _ = reply_to.send(result);
    }

    pub fn handle_get_channels(
        &self,
        reply_to: oneshot::Sender<Result<Vec<ChannelData>, String>>,
    ) {
        let result = (|| {
            let mut stmt = self.conn.prepare("SELECT channel_id, channel_name, last_updated FROM channels")
                .map_err(|_| "구문 오류".to_string())?;
            let mut rows = stmt.query([])
                .map_err(|_| "Transaction 오류".to_string())?;

            let mut channels: Vec<ChannelData> = Vec::new();

            while let Some(row) = rows.next().map_err(|_| "파싱 에러".to_string())? {
                let channel_id: String = row.get(0).unwrap_or_default();
                let channel_name: String = row.get(1).unwrap_or_default();
                let last_updated_str: String = row.get(2).unwrap_or_default();
                let last_updated = DateTime::parse_from_rfc3339(&last_updated_str)
                    .map(|dt| dt.with_timezone(&Utc))
                    .unwrap_or_else(|_| Utc::now());
                channels.push(ChannelData { channel_id, channel_name, last_updated });
            }
            Ok(channels)
        })();

        let _ = reply_to.send(result);
    }

    pub fn handle_insert_chat_logs(
        &self,
        logs: Vec<ChatLogData>,
        reply_to: oneshot::Sender<Result<(), String>>,
    ) {
        let result = self.conn.execute("BEGIN TRANSACTION", [])
            .and_then(|_| {
                let mut stmt = self.conn.prepare_cached(
                    "INSERT INTO chat_logs (broadcast_id, user_id, message_type, message, metadata, timestamp) VALUES (?1, ?2, ?3, ?4, ?5, ?6)"
                )?;
                
                for log in logs {
                    stmt.execute([
                        &log.broadcast_id.to_string(),
                        &log.user_id,
                        &log.message_type,
                        &log.message,
                        &log.metadata.unwrap_or_default(),
                        &log.timestamp.to_rfc3339()
                    ])?;
                }
                
                self.conn.execute("COMMIT", [])?;
                Ok(())
            })
            .or_else(|e| {
                let _ = self.conn.execute("ROLLBACK", []);
                Err(e)
            })
            .map_err(|e| e.to_string());

        let _ = reply_to.send(result);
    }

    pub fn handle_insert_event_logs(
        &self,
        logs: Vec<EventLogData>,
        reply_to: oneshot::Sender<Result<(), String>>,
    ) {
        let result = self.conn.execute("BEGIN TRANSACTION", [])
            .and_then(|_| {
                let mut stmt = self.conn.prepare_cached(
                    "INSERT INTO event_logs (broadcast_id, user_id, event_type, payload, timestamp) VALUES (?1, ?2, ?3, ?4, ?5)"
                )?;
                
                for log in logs {
                    match &log.user_id {
                        Some(user_id) => {
                            stmt.execute([
                                &log.broadcast_id.to_string(),
                                user_id,
                                &log.event_type,
                                &log.payload,
                                &log.timestamp.to_rfc3339()
                            ])?;
                        },
                        None => {
                            let mut stmt_null = self.conn.prepare_cached(
                                "INSERT INTO event_logs (broadcast_id, user_id, event_type, payload, timestamp) VALUES (?1, NULL, ?2, ?3, ?4)"
                            )?;
                            stmt_null.execute([
                                &log.broadcast_id.to_string(),
                                &log.event_type,
                                &log.payload,
                                &log.timestamp.to_rfc3339()
                            ])?;
                        }
                    }
                }
                
                self.conn.execute("COMMIT", [])?;
                Ok(())
            })
            .or_else(|e| {
                let _ = self.conn.execute("ROLLBACK", []);
                Err(e)
            })
            .map_err(|e| e.to_string());

        let _ = reply_to.send(result);
    }

    pub fn handle_get_target_users(
        &self,
        reply_to: oneshot::Sender<Result<Vec<String>, String>>,
    ) {
        let result = (|| {
            let mut stmt = self.conn.prepare("SELECT user_id FROM target_users ORDER BY added_at")
                .map_err(|e| e.to_string())?;
            let mut rows = stmt.query([])
                .map_err(|e| e.to_string())?;

            let mut user_ids: Vec<String> = Vec::new();
            while let Some(row) = rows.next().map_err(|e| e.to_string())? {
                let user_id: String = row.get(0).map_err(|e| e.to_string())?;
                user_ids.push(user_id);
            }
            Ok(user_ids)
        })();

        let _ = reply_to.send(result);
    }

    pub fn handle_add_target_user(
        &self,
        user_id: String,
        description: Option<String>,
        reply_to: oneshot::Sender<Result<(), String>>,
    ) {
        let result = self
            .conn
            .prepare_cached(
                "INSERT INTO target_users (user_id, description) VALUES (?1, ?2) ON CONFLICT(user_id) DO UPDATE SET description = excluded.description"
            )
            .and_then(|mut stmt| {
                stmt.execute([&user_id, &description.unwrap_or_default()])?;
                Ok(())
            })
            .map_err(|e| e.to_string());

        let _ = reply_to.send(result);
    }

    pub fn handle_remove_target_user(
        &self,
        user_id: String,
        reply_to: oneshot::Sender<Result<(), String>>,
    ) {
        let result = self
            .conn
            .prepare_cached("DELETE FROM target_users WHERE user_id = ?1")
            .and_then(|mut stmt| {
                stmt.execute([&user_id])?;
                Ok(())
            })
            .map_err(|e| e.to_string());

        let _ = reply_to.send(result);
    }
}