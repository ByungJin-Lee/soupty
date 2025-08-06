use chrono::{DateTime, Utc};
use rusqlite::Connection;
use tokio::sync::oneshot;

use crate::services::addons::db_logger::user_flag::parse_user_from_flag;
use crate::services::db::commands::{
    BroadcastSessionResult, BroadcastSessionSearchFilters, BroadcastSessionSearchResult, ChannelData, ChatLogData, ChatLogResult,  ChatSearchFilters, ChatSearchResult, EventLogData, EventLogResult, EventSearchFilters, EventSearchResult, PaginationParams, ReportInfo, ReportStatusInfo, TargetUser, UserLogEntry, UserSearchFilters, UserSearchResult
};
use crate::util::hangul::decompose_hangul_to_string;

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
                if error.code == rusqlite::ErrorCode::ConstraintViolation =>
            {
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
            }
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

        pub fn handle_vod_broadcast_session(
        &self,
        broadcast_id: i64,
        vod_id: u64,
        reply_to: oneshot::Sender<Result<(), String>>,
    ) {
        let result = self
            .conn
            .prepare_cached("UPDATE broadcast_sessions SET vod_id = ?1 WHERE id = ?2")
            .and_then(|mut stmt| {
                stmt.execute([vod_id.to_string(), broadcast_id.to_string()])?;
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
        let result = self.delete_channel_impl(channel_id);
        let _ = reply_to.send(result);
    }

    pub fn handle_get_channels(&self, reply_to: oneshot::Sender<Result<Vec<ChannelData>, String>>) {
        let result = (|| {
            let mut stmt = self
                .conn
                .prepare("SELECT channel_id, channel_name, last_updated FROM channels")
                .map_err(|_| "구문 오류".to_string())?;
            let mut rows = stmt.query([]).map_err(|_| "Transaction 오류".to_string())?;

            let mut channels: Vec<ChannelData> = Vec::new();

            while let Some(row) = rows.next().map_err(|_| "파싱 에러".to_string())? {
                let channel_id: String = row.get(0).unwrap_or_default();
                let channel_name: String = row.get(1).unwrap_or_default();
                let last_updated_str: String = row.get(2).unwrap_or_default();
                let last_updated = DateTime::parse_from_rfc3339(&last_updated_str)
                    .map(|dt| dt.with_timezone(&Utc))
                    .unwrap_or_else(|_| Utc::now());
                channels.push(ChannelData {
                    channel_id,
                    channel_name,
                    last_updated,
                });
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
                    "INSERT INTO chat_logs (broadcast_id, user_id, username, user_flag, message_type, message, metadata, timestamp, id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)"
                )?;
                
                for log in logs {
                    stmt.execute([
                        &log.broadcast_id.to_string(),
                        &log.user_id,
                        &log.username,
                        &log.user_flag.to_string(),
                        &log.message_type,
                        &log.message,
                        &serde_json::to_string(&log.metadata).unwrap_or_default(),
                        &log.timestamp.to_rfc3339(),
                        &log.id
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
                    "INSERT INTO event_logs (broadcast_id, user_id, username, user_flag, event_type, payload, timestamp, id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)"
                )?;
                
                for log in logs {
                    match (&log.user_id, &log.username, &log.user_flag) {
                        (Some(user_id), Some(username), Some(user_flag)) => {
                            stmt.execute([
                                &log.broadcast_id.to_string(),
                                user_id,
                                username,
                                &user_flag.to_string(),
                                &log.event_type,
                                &log.payload,
                                &log.timestamp.to_rfc3339(),
                                &log.id
                            ])?;
                        },
                        (Some(user_id), Some(username), None) => {
                            let mut stmt_null_flag = self.conn.prepare_cached(
                                "INSERT INTO event_logs (broadcast_id, user_id, username, user_flag, event_type, payload, timestamp, id) VALUES (?1, ?2, ?3, NULL, ?4, ?5, ?6, ?7)"
                            )?;
                            stmt_null_flag.execute([
                                &log.broadcast_id.to_string(),
                                user_id,
                                username,
                                &log.event_type,
                                &log.payload,
                                &log.timestamp.to_rfc3339(),
                                &log.id
                            ])?;
                        },
                        (Some(user_id), None, user_flag) => {
                            let mut stmt_null_username = self.conn.prepare_cached(
                                "INSERT INTO event_logs (broadcast_id, user_id, username, user_flag, event_type, payload, timestamp, id) VALUES (?1, ?2, NULL, ?3, ?4, ?5, ?6, ?7)"
                            )?;
                            stmt_null_username.execute([
                                &log.broadcast_id.to_string(),
                                user_id,
                                &user_flag.as_ref().map(|f| f.to_string()).unwrap_or_default(),
                                &log.event_type,
                                &log.payload,
                                &log.timestamp.to_rfc3339(),
                                &log.id
                            ])?;
                        },
                        (None, _, _) => {
                            let mut stmt_null_all = self.conn.prepare_cached(
                                "INSERT INTO event_logs (broadcast_id, user_id, username, user_flag, event_type, payload, timestamp, id) VALUES (?1, NULL, NULL, NULL, ?2, ?3, ?4, ?5)"
                            )?;
                            stmt_null_all.execute([
                                &log.broadcast_id.to_string(),
                                &log.event_type,
                                &log.payload,
                                &log.timestamp.to_rfc3339(),
                                &log.id
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

    pub fn handle_get_target_users(&self, reply_to: oneshot::Sender<Result<Vec<TargetUser>, String>>) {
        let result = (|| {
            let mut stmt = self
                .conn
                .prepare("SELECT user_id, username FROM target_users ORDER BY added_at")
                .map_err(|e| e.to_string())?;
            let mut rows = stmt.query([]).map_err(|e| e.to_string())?;

            let mut users: Vec<TargetUser> = Vec::new();
            while let Some(row) = rows.next().map_err(|e| e.to_string())? {
                let user_id: String = row.get(0).map_err(|e| e.to_string())?;
                let username: String = row.get(1).map_err(|e| e.to_string())?;
                users.push(TargetUser { user_id,  username  });
            }
            Ok(users)
        })();

        let _ = reply_to.send(result);
    }

    pub fn handle_add_target_user(
        &self,
        user: TargetUser,
        description: Option<String>,
        reply_to: oneshot::Sender<Result<(), String>>,
    ) {
        let result = self
            .conn
            .prepare_cached(
                "INSERT INTO target_users (user_id, username, description) VALUES (?1, ?2, ?3) ON CONFLICT(user_id) DO UPDATE SET description = excluded.description, username = excluded.username"
            )
            .and_then(|mut stmt| {
                stmt.execute([&user.user_id, &user.username, &description.unwrap_or_default()])?;
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

    pub fn handle_search_chat_logs(
        &self,
        filters: ChatSearchFilters,
        pagination: PaginationParams,
        reply_to: oneshot::Sender<Result<ChatSearchResult, String>>,
    ) {
        let result = self.search_chat_logs_impl(filters, pagination);
        let _ = reply_to.send(result);
    }

    pub fn handle_search_event_logs(
        &self,
        filters: EventSearchFilters,
        pagination: PaginationParams,
        reply_to: oneshot::Sender<Result<EventSearchResult, String>>,
    ) {
        let result = self.search_event_logs_impl(filters, pagination);
        let _ = reply_to.send(result);
    }

    pub fn handle_search_user_logs(
        &self,
        filters: UserSearchFilters,
        pagination: PaginationParams,
        reply_to: oneshot::Sender<Result<UserSearchResult, String>>,
    ) {
        let result = self.search_user_logs_impl(filters, pagination);
        let _ = reply_to.send(result);
    }

    fn search_chat_logs_impl(
        &self,
        filters: ChatSearchFilters,
        pagination: PaginationParams,
    ) -> Result<ChatSearchResult, String> {
        let offset = (pagination.page - 1) * pagination.page_size;
        let limit = pagination.page_size;

        // Build WHERE conditions and collect string values
        let mut where_conditions = Vec::new();
        let mut param_values = Vec::new();

        if let Some(channel_id) = &filters.channel_id {
            where_conditions.push("c.channel_id = ?");
            param_values.push(channel_id.clone());
        }

        if let Some(user_id) = &filters.user_id {
            where_conditions.push("cl.user_id = ?");
            param_values.push(user_id.clone());
        }

        if let Some(username) = &filters.username {
            where_conditions.push("cl.username = ?");
            param_values.push(username.clone());
        }

        if let Some(broadcast_id) = &filters.broadcast_id {
            where_conditions.push("cl.broadcast_id = ?");
            param_values.push(broadcast_id.to_string());
        }

        if let Some(message_type) = &filters.message_type {
            where_conditions.push("cl.message_type = ?");
            param_values.push(message_type.to_string());
        }

        if let Some(start_date) = &filters.start_date {
            where_conditions.push("cl.timestamp >= ?");
            param_values.push(start_date.to_rfc3339());
        }

        if let Some(end_date) = &filters.end_date {
            where_conditions.push("cl.timestamp <= ?");
            param_values.push(end_date.to_rfc3339());
        }

        // Convert to &str for rusqlite
        let params: Vec<&str> = param_values.iter().map(String::as_str).collect();

        let where_clause = if where_conditions.is_empty() {
            String::new()
        } else {
            format!("WHERE {}", where_conditions.join(" AND "))
        };

        // Search chat logs
        let chat_logs = if filters.message_contains.is_some() {
            self.search_chat_logs_with_fts(&filters, &where_clause, &params, limit, offset)?
        } else {
            self.search_chat_logs_without_fts(&where_clause, &params, limit, offset)?
        };

        // Get total count
        let total_count = self.get_chat_total_count(&filters, &where_clause, &params)?;
        let total_pages = (total_count + pagination.page_size - 1) / pagination.page_size;

        Ok(ChatSearchResult {
            chat_logs,
            total_count,
            page: pagination.page,
            page_size: pagination.page_size,
            total_pages,
        })
    }

    fn search_event_logs_impl(
        &self,
        filters: EventSearchFilters,
        pagination: PaginationParams,
    ) -> Result<EventSearchResult, String> {
        let offset = (pagination.page - 1) * pagination.page_size;
        let limit = pagination.page_size;

        let mut where_conditions = Vec::new();
        let mut param_values = Vec::new();
        let mut exclude_condition = String::new();

        if let Some(channel_id) = &filters.channel_id {
            where_conditions.push("c.channel_id = ?");
            param_values.push(channel_id.clone());
        }

        if let Some(user_id) = &filters.user_id {
            where_conditions.push("el.user_id = ?");
            param_values.push(user_id.clone());
        }

        if let Some(username) = &filters.username {
            where_conditions.push("el.username = ?");
            param_values.push(username.clone());
        }

        if let Some(event_type) = &filters.event_type {
            where_conditions.push("el.event_type = ?");
            param_values.push(event_type.clone());
        }

        if !filters.exclude_event_types.is_empty() {
            let placeholders = filters.exclude_event_types.iter()
                .map(|_| "?")
                .collect::<Vec<_>>()
                .join(", ");
            exclude_condition = format!("el.event_type NOT IN ({})", placeholders);
            where_conditions.push(&exclude_condition);
            param_values.extend(filters.exclude_event_types.iter().cloned());
        }

        if let Some(broadcast_id) = &filters.broadcast_id {
            where_conditions.push("el.broadcast_id = ?");
            param_values.push(broadcast_id.to_string());
        }

        if let Some(start_date) = &filters.start_date {
            where_conditions.push("el.timestamp >= ?");
            param_values.push(start_date.to_rfc3339());
        }

        if let Some(end_date) = &filters.end_date {
            where_conditions.push("el.timestamp <= ?");
            param_values.push(end_date.to_rfc3339());
        }

        let params: Vec<&str> = param_values.iter().map(String::as_str).collect();

        let where_clause = if where_conditions.is_empty() {
            String::new()
        } else {
            format!("WHERE {}", where_conditions.join(" AND "))
        };

        // Search event logs
        let event_logs = self.search_event_logs_only(&where_clause, &params, limit, offset)?;

        // Get total count
        let total_count = self.get_event_total_count(&where_clause, &params)?;
        let total_pages = (total_count + pagination.page_size - 1) / pagination.page_size;

        Ok(EventSearchResult {
            event_logs,
            total_count,
            page: pagination.page,
            page_size: pagination.page_size,
            total_pages,
        })
    }

    fn search_chat_logs_with_fts(
        &self,
        filters: &ChatSearchFilters,
        where_clause: &str,
        params: &[&str],
        limit: i64,
        offset: i64,
    ) -> Result<Vec<ChatLogResult>, String> {
        let search_term = filters.message_contains.as_ref().unwrap();
        // FTS에서 prefix 검색을 위한 와일드카드 패턴 사용
        let message_contains = format!("{}*", decompose_hangul_to_string(search_term));

        let additional_where = if where_clause.is_empty() {
            String::new()
        } else {
            format!("AND {}", &where_clause[6..])
        };

        let fts_query = format!(
            "SELECT cl.id, cl.broadcast_id, cl.user_id, cl.username, cl.user_flag, cl.message_type, 
                    cl.message, cl.metadata, cl.timestamp, c.channel_id, c.channel_name, bs.title
             FROM chat_logs_fts fts
             JOIN chat_logs cl ON fts.chat_log_id = cl.id
             JOIN broadcast_sessions bs ON cl.broadcast_id = bs.id
             JOIN channels c ON bs.channel_id = c.channel_id
             WHERE fts.message_jamo MATCH ?1 {}
             ORDER BY cl.timestamp DESC
             LIMIT ? OFFSET ?",
            additional_where
        );

        let mut stmt = self
            .conn
            .prepare_cached(&fts_query)
            .map_err(|e| e.to_string())?;

        let limit_str = limit.to_string();
        let offset_str = offset.to_string();
        let mut all_params = vec![message_contains.as_str()];
        all_params.extend(params);
        all_params.push(&limit_str);
        all_params.push(&offset_str);

        let rows = stmt
            .query_map(rusqlite::params_from_iter(all_params.iter()), |row| {
                let user_id: String = row.get(2)?;
                let username: String = row.get(3)?;
                let user_flag: u32 = row.get(4)?;

                Ok(ChatLogResult {
                    id: row.get(0)?,
                    broadcast_id: row.get(1)?,
                    user: parse_user_from_flag(user_flag, user_id, username),
                    message_type: row.get(5)?,
                    message: row.get(6)?,
                    metadata: {
                        let metadata_str: String = row.get(7)?;
                        if metadata_str.is_empty() {
                            None
                        } else {
                            serde_json::from_str(&metadata_str).ok()
                        }
                    },
                    timestamp: DateTime::parse_from_rfc3339(&row.get::<_, String>(8)?)
                        .unwrap()
                        .with_timezone(&Utc),
                    channel_id: row.get(9)?,
                    channel_name: row.get(10)?,
                    broadcast_title: row.get(11)?,
                })
            })
            .map_err(|e| e.to_string())?;

        rows.collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())
    }

    fn search_chat_logs_without_fts(
        &self,
        where_clause: &str,
        params: &[&str],
        limit: i64,
        offset: i64,
    ) -> Result<Vec<ChatLogResult>, String> {
        let query = format!(
            "SELECT cl.id, cl.broadcast_id, cl.user_id, cl.username, cl.user_flag, cl.message_type, 
                    cl.message, cl.metadata, cl.timestamp, c.channel_id, c.channel_name, bs.title
             FROM chat_logs cl
             JOIN broadcast_sessions bs ON cl.broadcast_id = bs.id
             JOIN channels c ON bs.channel_id = c.channel_id
             {}
             ORDER BY cl.timestamp DESC
             LIMIT ? OFFSET ?",
            where_clause
        );

        let mut stmt = self
            .conn
            .prepare_cached(&query)
            .map_err(|e| e.to_string())?;

        let limit_str = limit.to_string();
        let offset_str = offset.to_string();
        let mut all_params = params.to_vec();
        all_params.push(&limit_str);
        all_params.push(&offset_str);

        let rows = stmt
            .query_map(rusqlite::params_from_iter(all_params.iter()), |row| {
                let user_id: String = row.get(2)?;
                let username: String = row.get(3)?;
                let user_flag: u32 = row.get(4)?;

                Ok(ChatLogResult {
                    id: row.get(0)?,
                    broadcast_id: row.get(1)?,
                    user: parse_user_from_flag(user_flag, user_id, username),
                    message_type: row.get(5)?,
                    message: row.get(6)?,
                    metadata: {
                        let metadata_str: String = row.get(7)?;
                        if metadata_str.is_empty() {
                            None
                        } else {
                            serde_json::from_str(&metadata_str).ok()
                        }
                    },
                    timestamp: DateTime::parse_from_rfc3339(&row.get::<_, String>(8)?)
                        .unwrap()
                        .with_timezone(&Utc),
                    channel_id: row.get(9)?,
                    channel_name: row.get(10)?,
                    broadcast_title: row.get(11)?,
                })
            })
            .map_err(|e| e.to_string())?;

        rows.collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())
    }

    fn search_event_logs_only(
        &self,
        where_clause: &str,
        params: &[&str],
        limit: i64,
        offset: i64,
    ) -> Result<Vec<EventLogResult>, String> {
        let query = format!(
            "SELECT el.id, el.broadcast_id, el.user_id, el.username, el.user_flag, el.event_type, 
                    el.payload, el.timestamp, c.channel_id, c.channel_name, bs.title
             FROM event_logs el
             JOIN broadcast_sessions bs ON el.broadcast_id = bs.id
             JOIN channels c ON bs.channel_id = c.channel_id
             {}
             ORDER BY el.timestamp DESC
             LIMIT ? OFFSET ?",
            where_clause
        );

        let mut stmt = self
            .conn
            .prepare_cached(&query)
            .map_err(|e| e.to_string())?;

        let limit_str = limit.to_string();
        let offset_str = offset.to_string();
        let mut all_params = params.to_vec();
        all_params.push(&limit_str);
        all_params.push(&offset_str);

        let rows = stmt
            .query_map(rusqlite::params_from_iter(all_params.iter()), |row| {
                let user_id: Option<String> = row.get(2)?;
                let username: Option<String> = row.get(3)?;
                let user_flag: Option<u32> = row.get(4)?;

                let user = match (user_id, username, user_flag) {
                    (Some(id), Some(name), Some(flag)) => {
                        Some(parse_user_from_flag(flag, id, name))
                    }
                    _ => None,
                };

                Ok(EventLogResult {
                    id: row.get(0)?,
                    broadcast_id: row.get(1)?,
                    user,
                    event_type: row.get(5)?,
                    payload: row.get(6)?,
                    timestamp: DateTime::parse_from_rfc3339(&row.get::<_, String>(7)?)
                        .unwrap()
                        .with_timezone(&Utc),
                    channel_id: row.get(8)?,
                    channel_name: row.get(9)?,
                    broadcast_title: row.get(10)?,
                })
            })
            .map_err(|e| e.to_string())?;

        rows.collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())
    }

    fn get_chat_total_count(
        &self,
        filters: &ChatSearchFilters,
        where_clause: &str,
        params: &[&str],
    ) -> Result<i64, String> {
        let query = if filters.message_contains.is_some() {
            let additional_where = if where_clause.is_empty() {
                String::new()
            } else {
                format!("AND {}", &where_clause[6..])
            };
            format!(
                "SELECT COUNT(*) FROM chat_logs_fts fts
                JOIN chat_logs cl ON fts.chat_log_id = cl.id
                JOIN broadcast_sessions bs ON cl.broadcast_id = bs.id
                JOIN channels c ON bs.channel_id = c.channel_id
                WHERE fts.message_jamo MATCH ?1 {}",
                additional_where
            )
        } else {
            format!(
                "SELECT COUNT(*) FROM chat_logs cl
                JOIN broadcast_sessions bs ON cl.broadcast_id = bs.id
                JOIN channels c ON bs.channel_id = c.channel_id
                {}",
                where_clause
            )
        };

        let mut stmt = self
            .conn
            .prepare_cached(&query)
            .map_err(|e| e.to_string())?;

        let count = if filters.message_contains.is_some() {
            let search_term = filters.message_contains.as_ref().unwrap();
            // FTS에서 prefix 검색을 위한 와일드카드 패턴 사용
            let message_contains = format!("{}*", decompose_hangul_to_string(search_term));
            let mut all_params = vec![message_contains.as_str()];
            all_params.extend(params);
            stmt.query_row(rusqlite::params_from_iter(all_params.iter()), |row| {
                row.get::<_, i64>(0)
            })
        } else {
            stmt.query_row(rusqlite::params_from_iter(params.iter()), |row| {
                row.get::<_, i64>(0)
            })
        }
        .map_err(|e| e.to_string())?;

        Ok(count)
    }

    fn get_event_total_count(&self, where_clause: &str, params: &[&str]) -> Result<i64, String> {
        let query = format!(
            "SELECT COUNT(*) FROM event_logs el
             JOIN broadcast_sessions bs ON el.broadcast_id = bs.id
             JOIN channels c ON bs.channel_id = c.channel_id
             {}",
            where_clause
        );

        let mut stmt = self
            .conn
            .prepare_cached(&query)
            .map_err(|e| e.to_string())?;

        let count = stmt
            .query_row(rusqlite::params_from_iter(params.iter()), |row| {
                row.get::<_, i64>(0)
            })
            .map_err(|e| e.to_string())?;

        Ok(count)
    }

    fn search_user_logs_impl(
        &self,
        filters: UserSearchFilters,
        pagination: PaginationParams,
    ) -> Result<UserSearchResult, String> {
        let offset = (pagination.page - 1) * pagination.page_size;
        let limit = pagination.page_size;

        // Build WHERE conditions for both chat and event logs
        let mut where_conditions = Vec::new();
        let mut param_values = Vec::new();

        // user_id is required
        where_conditions.push("user_id = ?");
        param_values.push(filters.user_id.clone());

        // channel_id filter (optional)
        if let Some(channel_id) = &filters.channel_id {
            where_conditions.push("c.channel_id = ?");
            param_values.push(channel_id.clone());
        }

        // session_id filter (optional) - filters by broadcast_id
        if let Some(session_id) = &filters.session_id {
            where_conditions.push("broadcast_id = ?");
            param_values.push(session_id.to_string());
        }

        // Date range filters (optional)
        if let Some(start_date) = &filters.start_date {
            where_conditions.push("timestamp >= ?");
            param_values.push(start_date.to_rfc3339());
        }

        if let Some(end_date) = &filters.end_date {
            where_conditions.push("timestamp <= ?");
            param_values.push(end_date.to_rfc3339());
        }

        let where_clause = if where_conditions.is_empty() {
            String::new()
        } else {
            format!("WHERE {}", where_conditions.join(" AND "))
        };

        // Convert to &str for rusqlite
        let params: Vec<&str> = param_values.iter().map(String::as_str).collect();

        // Get combined user logs (chat + event)
        let logs = self.search_user_logs_combined(&where_clause, &params, limit, offset)?;

        // Get total count
        let total_count = self.get_user_logs_total_count(&where_clause, &params)?;
        let total_pages = (total_count + pagination.page_size - 1) / pagination.page_size;

        Ok(UserSearchResult {
            logs,
            total_count,
            page: pagination.page,
            page_size: pagination.page_size,
            total_pages,
        })
    }

    fn search_user_logs_combined(
        &self,
        where_clause: &str,
        params: &[&str],
        limit: i64,
        offset: i64,
    ) -> Result<Vec<UserLogEntry>, String> {
        // Query combines both chat_logs and event_logs using UNION ALL
        let query = format!(
            "SELECT 
                id, broadcast_id, user_id, username, timestamp,
                channel_id, channel_name, title as broadcast_title, log_type,
                message_type, message, metadata, event_type, payload
             FROM (
                 SELECT 
                     cl.id, cl.broadcast_id, cl.user_id, cl.username, cl.timestamp,
                     c.channel_id, c.channel_name, bs.title,
                     'CHAT' as log_type,
                     cl.message_type, cl.message, cl.metadata,
                     NULL as event_type, NULL as payload
                 FROM chat_logs cl
                 JOIN broadcast_sessions bs ON cl.broadcast_id = bs.id
                 JOIN channels c ON bs.channel_id = c.channel_id
                 {}
                 
                 UNION ALL
                 
                 SELECT 
                     el.id, el.broadcast_id, el.user_id, el.username, el.timestamp,
                     c.channel_id, c.channel_name, bs.title,
                     'EVENT' as log_type,
                     NULL as message_type, NULL as message, NULL as metadata,
                     el.event_type, el.payload
                 FROM event_logs el
                 JOIN broadcast_sessions bs ON el.broadcast_id = bs.id
                 JOIN channels c ON bs.channel_id = c.channel_id
                 {}
             ) AS combined_logs
             ORDER BY timestamp DESC
             LIMIT ? OFFSET ?",
            where_clause, where_clause
        );

        let mut stmt = self
            .conn
            .prepare_cached(&query)
            .map_err(|e| e.to_string())?;

        let limit_str = limit.to_string();
        let offset_str = offset.to_string();
        
        // Duplicate params for both UNION queries
        let mut all_params = params.to_vec();
        all_params.extend(params.iter());
        all_params.push(&limit_str);
        all_params.push(&offset_str);

        let rows = stmt
            .query_map(rusqlite::params_from_iter(all_params.iter()), |row| {
                let user_id: String = row.get(2)?;
                let username: String = row.get(3)?;
                // disable user flag
                // let user_flag: u32 = row.get(4)?;
                let log_type: String = row.get(8)?;

                Ok(UserLogEntry {
                    id: row.get(0)?,
                    broadcast_id: row.get(1)?,
                    user: parse_user_from_flag(0, user_id, username),
                    log_type,
                    timestamp: DateTime::parse_from_rfc3339(&row.get::<_, String>(4)?)
                        .unwrap()
                        .with_timezone(&Utc),
                    channel_id: row.get(5)?,
                    channel_name: row.get(6)?,
                    broadcast_title: row.get(7)?,
                    // Chat log fields
                    message_type: row.get(9)?,
                    message: row.get(10)?,
                    metadata: {
                        let metadata_str: Option<String> = row.get(11)?;
                        match metadata_str {
                            Some(s) if !s.is_empty() => serde_json::from_str(&s).ok(),
                            _ => None,
                        }
                    },
                    // Event log fields
                    event_type: row.get(12)?,
                    payload: row.get(13)?,
                })
            })
            .map_err(|e| e.to_string())?;

        rows.collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())
    }

    fn get_user_logs_total_count(
        &self,
        where_clause: &str,
        params: &[&str],
    ) -> Result<i64, String> {
        let query = format!(
            "SELECT COUNT(*) FROM (
                 SELECT cl.id FROM chat_logs cl
                 JOIN broadcast_sessions bs ON cl.broadcast_id = bs.id
                 JOIN channels c ON bs.channel_id = c.channel_id
                 {}
                 
                 UNION ALL
                 
                 SELECT el.id FROM event_logs el
                 JOIN broadcast_sessions bs ON el.broadcast_id = bs.id
                 JOIN channels c ON bs.channel_id = c.channel_id
                 {}
             ) AS combined_logs",
            where_clause, where_clause
        );

        let mut stmt = self
            .conn
            .prepare_cached(&query)
            .map_err(|e| e.to_string())?;

        // Duplicate params for both UNION queries
        let mut all_params = params.to_vec();
        all_params.extend(params.iter());

        let count = stmt
            .query_row(rusqlite::params_from_iter(all_params.iter()), |row| {
                row.get::<_, i64>(0)
            })
            .map_err(|e| e.to_string())?;

        Ok(count)
    }

    // 방송 세션 삭제 핸들러
    pub fn handle_delete_broadcast_session(
        &self,
        broadcast_id: i64,
        reply_to: oneshot::Sender<Result<(), String>>,
    ) {
        let result = self.delete_broadcast_session_impl(broadcast_id);
        let _ = reply_to.send(result);
    }

    // 방송 세션 검색 핸들러
    pub fn handle_search_broadcast_sessions(
        &self,
        filters: BroadcastSessionSearchFilters,
        pagination: PaginationParams,
        reply_to: oneshot::Sender<Result<BroadcastSessionSearchResult, String>>,
    ) {
        let result = self.search_broadcast_sessions_impl(filters, pagination);
        let _ = reply_to.send(result);
    }

    pub fn handle_get_broadcast_session(
        &self,
        broadcast_id: i64,
        reply_to: oneshot::Sender<Result<Option<BroadcastSessionResult>, String>>,
    ) {
        let result = self.get_broadcast_session_impl(broadcast_id);
        let _ = reply_to.send(result);
    }

    pub fn handle_update_broadcast_session_end_time(
        &self,
        broadcast_id: i64,
        ended_at: DateTime<Utc>,
        reply_to: oneshot::Sender<Result<(), String>>,
    ) {
        let result = self.update_broadcast_session_end_time_impl(broadcast_id, ended_at);
        let _ = reply_to.send(result);
    }

    // 방송 세션 삭제 구현
    fn delete_broadcast_session_impl(&self, broadcast_id: i64) -> Result<(), String> {
        // 먼저 CASCADE DELETE 시도
        match self.try_cascade_delete(broadcast_id) {
            Ok(()) => Ok(()),
            Err(_) => {
                // CASCADE 실패 시 수동 삭제로 폴백
                self.manual_cascade_delete(broadcast_id)
            }
        }
    }

    // CASCADE DELETE 시도
    fn try_cascade_delete(&self, broadcast_id: i64) -> Result<(), String> {
        // 외래 키 무결성 검사
        let has_violations = self.check_foreign_key_violations()?;

        if has_violations {
            return Err("Foreign key violations detected".to_string());
        }

        // 정상적인 CASCADE DELETE 시도
        let rows_affected = self
            .conn
            .execute(
                "DELETE FROM broadcast_sessions WHERE id = ?1",
                [broadcast_id],
            )
            .map_err(|e| format!("CASCADE DELETE failed: {}", e))?;

        if rows_affected == 0 {
            return Err(format!(
                "Broadcast session with id {} not found",
                broadcast_id
            ));
        }

        Ok(())
    }

    // 외래 키 무결성 검사
    fn check_foreign_key_violations(&self) -> Result<bool, String> {
        let mut stmt = self
            .conn
            .prepare("PRAGMA foreign_key_check")
            .map_err(|e| e.to_string())?;

        let violations = stmt.query_map([], |_| Ok(())).map_err(|e| e.to_string())?;

        // 하나라도 위반이 있으면 true 반환
        for _ in violations {
            return Ok(true);
        }

        Ok(false)
    }

    // 수동 CASCADE 삭제 (FTS 트리거 문제 해결)
    fn manual_cascade_delete(&self, broadcast_id: i64) -> Result<(), String> {
        // 트랜잭션으로 안전하게 처리
        self.conn
            .execute("BEGIN IMMEDIATE", [])
            .map_err(|e| format!("Transaction start failed: {}", e))?;

        let result = self.execute_manual_cascade(broadcast_id);

        match result {
            Ok(()) => {
                self.conn
                    .execute("COMMIT", [])
                    .map_err(|e| format!("Commit failed: {}", e))?;
                self.recreate_fts_triggers()?;
                Ok(())
            }
            Err(e) => {
                let _ = self.conn.execute("ROLLBACK", []);
                let _ = self.recreate_fts_triggers();
                Err(e)
            }
        }
    }

    // 실제 수동 삭제 작업
    fn execute_manual_cascade(&self, broadcast_id: i64) -> Result<(), String> {
        // 1. FTS 트리거 임시 비활성화
        self.disable_fts_triggers()?;

        // 2. FTS 레코드 삭제
        self.conn.execute(
            "DELETE FROM chat_logs_fts WHERE chat_log_id IN (SELECT id FROM chat_logs WHERE broadcast_id = ?1)",
            [broadcast_id]
        ).map_err(|e| format!("FTS deletion failed: {}", e))?;

        // 3. 관련 테이블 순차 삭제
        self.conn
            .execute(
                "DELETE FROM chat_logs WHERE broadcast_id = ?1",
                [broadcast_id],
            )
            .map_err(|e| format!("Chat logs deletion failed: {}", e))?;

        self.conn
            .execute(
                "DELETE FROM event_logs WHERE broadcast_id = ?1",
                [broadcast_id],
            )
            .map_err(|e| format!("Event logs deletion failed: {}", e))?;

        self.conn
            .execute(
                "DELETE FROM reports WHERE broadcast_id = ?1",
                [broadcast_id],
            )
            .map_err(|e| format!("Reports deletion failed: {}", e))?;

        // 4. 방송 세션 삭제
        let rows_affected = self
            .conn
            .execute(
                "DELETE FROM broadcast_sessions WHERE id = ?1",
                [broadcast_id],
            )
            .map_err(|e| format!("Broadcast session deletion failed: {}", e))?;

        if rows_affected == 0 {
            return Err(format!(
                "Broadcast session with id {} not found",
                broadcast_id
            ));
        }

        Ok(())
    }

    // FTS 트리거 비활성화
    fn disable_fts_triggers(&self) -> Result<(), String> {
        self.conn
            .execute("DROP TRIGGER IF EXISTS t_chat_logs_delete", [])
            .map_err(|e| format!("Failed to drop delete trigger: {}", e))?;
        self.conn
            .execute("DROP TRIGGER IF EXISTS t_chat_logs_update", [])
            .map_err(|e| format!("Failed to drop update trigger: {}", e))?;
        Ok(())
    }

    // FTS 트리거 재생성
    fn recreate_fts_triggers(&self) -> Result<(), String> {
        self.conn
            .execute_batch(
                "
            CREATE TRIGGER IF NOT EXISTS t_chat_logs_delete AFTER DELETE ON chat_logs
            BEGIN
                DELETE FROM chat_logs_fts WHERE chat_log_id = old.id;
            END;

            CREATE TRIGGER IF NOT EXISTS t_chat_logs_update AFTER UPDATE ON chat_logs
            BEGIN
                DELETE FROM chat_logs_fts WHERE chat_log_id = old.id;
                INSERT INTO chat_logs_fts(message_jamo, chat_log_id)
                VALUES (DECOMPOSE_HANGUL(new.message), new.id);
            END;
            ",
            )
            .map_err(|e| format!("Failed to recreate triggers: {}", e))?;
        Ok(())
    }

    // 방송 세션 검색 구현
    fn search_broadcast_sessions_impl(
        &self,
        filters: BroadcastSessionSearchFilters,
        pagination: PaginationParams,
    ) -> Result<BroadcastSessionSearchResult, String> {
        let offset = (pagination.page - 1) * pagination.page_size;
        let limit = pagination.page_size;

        let mut where_conditions = Vec::new();
        let mut param_values = Vec::new();

        if let Some(channel_id) = &filters.channel_id {
            where_conditions.push("bs.channel_id = ?");
            param_values.push(channel_id.clone());
        }

        if let Some(start_date) = &filters.start_date {
            where_conditions.push("bs.started_at >= ?");
            param_values.push(start_date.to_rfc3339());
        }

        if let Some(end_date) = &filters.end_date {
            where_conditions.push("bs.started_at <= ?");
            param_values.push(end_date.to_rfc3339());
        }

        let params: Vec<&str> = param_values.iter().map(String::as_str).collect();

        let where_clause = if where_conditions.is_empty() {
            String::new()
        } else {
            format!("WHERE {}", where_conditions.join(" AND "))
        };

        // 방송 세션 검색
        let broadcast_sessions =
            self.search_broadcast_sessions_only(&where_clause, &params, limit, offset)?;

        // 총 개수 조회
        let total_count = self.get_broadcast_sessions_total_count(&where_clause, &params)?;
        let total_pages = (total_count + pagination.page_size - 1) / pagination.page_size;

        Ok(BroadcastSessionSearchResult {
            broadcast_sessions,
            total_count,
            page: pagination.page,
            page_size: pagination.page_size,
            total_pages,
        })
    }

    // 방송 세션 검색 쿼리
    fn search_broadcast_sessions_only(
        &self,
        where_clause: &str,
        params: &[&str],
        limit: i64,
        offset: i64,
    ) -> Result<Vec<BroadcastSessionResult>, String> {
        let query = format!(
            "SELECT bs.id, bs.channel_id, c.channel_name, bs.title, bs.started_at, bs.ended_at, bs.vod_id
             FROM broadcast_sessions bs
             JOIN channels c ON bs.channel_id = c.channel_id
             {}
             ORDER BY bs.started_at DESC
             LIMIT {} OFFSET {}",
            where_clause, limit, offset
        );

        let mut stmt = self
            .conn
            .prepare_cached(&query)
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map(rusqlite::params_from_iter(params.iter()), |row| {
                let started_at_str: String = row.get(4)?;
                let ended_at_opt: Option<String> = row.get(5)?;

                let started_at = DateTime::parse_from_rfc3339(&started_at_str)
                    .map_err(|_| {
                        rusqlite::Error::InvalidColumnType(
                            4,
                            "started_at".to_string(),
                            rusqlite::types::Type::Text,
                        )
                    })?
                    .with_timezone(&Utc);

                let ended_at = if let Some(ended_at_str) = ended_at_opt {
                    Some(
                        DateTime::parse_from_rfc3339(&ended_at_str)
                            .map_err(|_| {
                                rusqlite::Error::InvalidColumnType(
                                    5,
                                    "ended_at".to_string(),
                                    rusqlite::types::Type::Text,
                                )
                            })?
                            .with_timezone(&Utc),
                    )
                } else {
                    None
                };

                Ok(BroadcastSessionResult {
                    id: row.get(0)?,
                    channel_id: row.get(1)?,
                    channel_name: row.get(2)?,
                    title: row.get(3)?,
                    started_at,
                    ended_at,
                    vod_id: row.get(6)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let mut broadcast_sessions = Vec::new();
        for row in rows {
            broadcast_sessions.push(row.map_err(|e| e.to_string())?);
        }

        Ok(broadcast_sessions)
    }

    // 방송 세션 총 개수 조회
    fn get_broadcast_sessions_total_count(
        &self,
        where_clause: &str,
        params: &[&str],
    ) -> Result<i64, String> {
        let query = format!(
            "SELECT COUNT(*) FROM broadcast_sessions bs
             JOIN channels c ON bs.channel_id = c.channel_id
             {}",
            where_clause
        );

        let mut stmt = self
            .conn
            .prepare_cached(&query)
            .map_err(|e| e.to_string())?;

        let count = stmt
            .query_row(rusqlite::params_from_iter(params.iter()), |row| {
                row.get::<_, i64>(0)
            })
            .map_err(|e| e.to_string())?;

        Ok(count)
    }

    // 단일 방송 세션 조회 구현
    fn get_broadcast_session_impl(
        &self,
        broadcast_id: i64,
    ) -> Result<Option<BroadcastSessionResult>, String> {
        let query = r#"
            SELECT 
                bs.id,
                bs.channel_id,
                c.channel_name,
                bs.title,
                bs.started_at,
                bs.ended_at,
                bs.vod_id
            FROM broadcast_sessions bs
            JOIN channels c ON bs.channel_id = c.channel_id
            WHERE bs.id = ?1
        "#;

        let mut stmt = self.conn.prepare_cached(query).map_err(|e| e.to_string())?;

        let result = stmt.query_row([broadcast_id], |row| {
            Ok(BroadcastSessionResult {
                id: row.get(0)?,
                channel_id: row.get(1)?,
                channel_name: row.get(2)?,
                title: row.get(3)?,
                vod_id: row.get(6)?,
                started_at: row.get::<_, String>(4)?.parse().map_err(|_e| {
                    rusqlite::Error::InvalidColumnType(
                        4,
                        "started_at".to_string(),
                        rusqlite::types::Type::Text,
                    )
                })?,
                ended_at: {
                    let ended_at_str: Option<String> = row.get(5)?;
                    match ended_at_str {
                        Some(s) => Some(s.parse().map_err(|_e| {
                            rusqlite::Error::InvalidColumnType(
                                5,
                                "ended_at".to_string(),
                                rusqlite::types::Type::Text,
                            )
                        })?),
                        None => None,
                    }
                },
            })
        });

        match result {
            Ok(session) => Ok(Some(session)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e.to_string()),
        }
    }

    fn update_broadcast_session_end_time_impl(
        &self,
        broadcast_id: i64,
        ended_at: DateTime<Utc>,
    ) -> Result<(), String> {
        let query = "UPDATE broadcast_sessions SET ended_at = ?1 WHERE id = ?2";

        let mut stmt = self.conn.prepare_cached(query).map_err(|e| e.to_string())?;

        let rows_affected = stmt
            .execute([ended_at.to_rfc3339(), broadcast_id.to_string()])
            .map_err(|e| e.to_string())?;

        if rows_affected == 0 {
            return Err(format!(
                "No broadcast session found with id: {}",
                broadcast_id
            ));
        }

        Ok(())
    }

    // 리포트 관련 핸들러들
    pub fn handle_create_report(
        &mut self,
        broadcast_id: i64,
        reply_to: oneshot::Sender<Result<(), String>>,
    ) {
        let result = self.create_report(broadcast_id);
        let _ = reply_to.send(result);
    }

    pub fn handle_update_report_status(
        &mut self,
        broadcast_id: i64,
        status: String,
        progress_percentage: Option<f64>,
        error_message: Option<String>,
        reply_to: oneshot::Sender<Result<(), String>>,
    ) {
        let result =
            self.update_report_status(broadcast_id, status, progress_percentage, error_message);
        let _ = reply_to.send(result);
    }

    pub fn handle_update_report_data(
        &mut self,
        broadcast_id: i64,
        report_data: String,
        reply_to: oneshot::Sender<Result<(), String>>,
    ) {
        let result = self.update_report_data(broadcast_id, report_data);
        let _ = reply_to.send(result);
    }

    pub fn handle_get_report(
        &mut self,
        broadcast_id: i64,
        reply_to: oneshot::Sender<Result<Option<ReportInfo>, String>>,
    ) {
        let result = self.get_report(broadcast_id);
        let _ = reply_to.send(result);
    }

    pub fn handle_delete_report(
        &mut self,
        broadcast_id: i64,
        reply_to: oneshot::Sender<Result<(), String>>,
    ) {
        let result = self.delete_report(broadcast_id);
        let _ = reply_to.send(result);
    }

    pub fn handle_get_report_status(
        &mut self,
        broadcast_id: i64,
        reply_to: oneshot::Sender<Result<Option<ReportStatusInfo>, String>>,
    ) {
        let result = self.get_report_status(broadcast_id);
        let _ = reply_to.send(result);
    }

    pub fn handle_get_chat_logs_for_report(
        &mut self,
        broadcast_id: i64,
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
        reply_to: oneshot::Sender<Result<Vec<ChatLogResult>, String>>,
    ) {
        let result = self.get_chat_logs_for_report(broadcast_id, start_time, end_time);
        let _ = reply_to.send(result);
    }

    pub fn handle_get_event_logs_for_report(
        &mut self,
        broadcast_id: i64,
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
        reply_to: oneshot::Sender<Result<Vec<EventLogResult>, String>>,
    ) {
        let result = self.get_event_logs_for_report(broadcast_id, start_time, end_time);
        let _ = reply_to.send(result);
    }

    // 실제 DB 작업 메서드들
    fn create_report(&mut self, broadcast_id: i64) -> Result<(), String> {
        let query = r#"
            INSERT INTO reports (broadcast_id, status, version)
            VALUES (?1, 'PENDING', 1)
        "#;

        self.conn
            .execute(query, [broadcast_id])
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    fn update_report_status(
        &mut self,
        broadcast_id: i64,
        status: String,
        progress_percentage: Option<f64>,
        error_message: Option<String>,
    ) -> Result<(), String> {
        let query = r#"
            UPDATE reports 
            SET status = ?1, progress_percentage = ?2, error_message = ?3
            WHERE broadcast_id = ?4
        "#;

        self.conn
            .execute(
                query,
                (status, progress_percentage, error_message, broadcast_id),
            )
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    fn update_report_data(&mut self, broadcast_id: i64, report_data: String) -> Result<(), String> {
        let query = r#"
            UPDATE reports 
            SET report_data = ?1, status = 'COMPLETED'
            WHERE broadcast_id = ?2
        "#;

        self.conn
            .execute(query, (report_data, broadcast_id))
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    fn get_report(&mut self, broadcast_id: i64) -> Result<Option<ReportInfo>, String> {
        let query = r#"
            SELECT broadcast_id, status, report_data, version, error_message, 
                   progress_percentage
            FROM reports 
            WHERE broadcast_id = ?1
            LIMIT 1
        "#;

        let mut stmt = self.conn.prepare_cached(query).map_err(|e| e.to_string())?;

        let result = stmt.query_row([broadcast_id], |row| {
            Ok(ReportInfo {
                broadcast_id: row.get(0)?,
                status: row.get(1)?,
                report_data: {
                    let data: String = row.get(2)?;
                    if data.is_empty() {
                        None
                    } else {
                        serde_json::from_str(&data).ok()
                    }
                },
                version: row.get(3)?,
                error_message: row.get(4)?,
                progress_percentage: row.get(5)?,
            })
        });

        match result {
            Ok(report) => Ok(Some(report)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e.to_string()),
        }
    }

    fn delete_report(&mut self, broadcast_id: i64) -> Result<(), String> {
        let query = "DELETE FROM reports WHERE broadcast_id = ?1";

        self.conn
            .execute(query, [broadcast_id])
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    fn get_report_status(&mut self, broadcast_id: i64) -> Result<Option<ReportStatusInfo>, String> {
        let query = r#"
            SELECT broadcast_id, status, progress_percentage, error_message
            FROM reports 
            WHERE broadcast_id = ?1
            LIMIT 1
        "#;

        let mut stmt = self.conn.prepare_cached(query).map_err(|e| e.to_string())?;

        let result = stmt.query_row([broadcast_id], |row| {
            Ok(ReportStatusInfo {
                broadcast_id: row.get(0)?,
                status: row.get(1)?,
                progress_percentage: row.get(2)?,
                error_message: row.get(3)?,
            })
        });

        match result {
            Ok(status) => Ok(Some(status)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e.to_string()),
        }
    }

    fn get_chat_logs_for_report(
        &mut self,
        broadcast_id: i64,
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
    ) -> Result<Vec<ChatLogResult>, String> {
        let query = r#"
            SELECT cl.id, cl.broadcast_id, cl.user_id, cl.username, cl.user_flag, cl.message_type, 
                    cl.message, cl.metadata, cl.timestamp, c.channel_id, c.channel_name, bs.title
            FROM chat_logs cl
            JOIN broadcast_sessions bs ON cl.broadcast_id = bs.id
            JOIN channels c ON bs.channel_id = c.channel_id
            WHERE cl.broadcast_id = ?1 AND cl.timestamp >= ?2 AND cl.timestamp < ?3
            ORDER BY cl.timestamp ASC
        "#;

        let mut stmt = self.conn.prepare_cached(query).map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map(
                (broadcast_id, start_time.to_rfc3339(), end_time.to_rfc3339()),
                |row| {
                    let user_id: String = row.get(2)?;
                    let username: String = row.get(3)?;
                    let user_flag: u32 = row.get(4)?;

                    Ok(ChatLogResult {
                        id: row.get(0)?,
                        broadcast_id: row.get(1)?,
                        user: parse_user_from_flag(user_flag, user_id, username),
                        message_type: row.get(5)?,
                        message: row.get(6)?,
                        metadata: {
                            let metadata_str: String = row.get(7)?;
                            if metadata_str.is_empty() {
                                None
                            } else {
                                serde_json::from_str(&metadata_str).ok()
                            }
                        },
                        timestamp: DateTime::parse_from_rfc3339(&row.get::<_, String>(8)?)
                            .unwrap()
                            .with_timezone(&Utc),
                        channel_id: row.get(9)?,
                        channel_name: row.get(10)?,
                        broadcast_title: row.get(11)?,
                    })
                },
            )
            .map_err(|e| e.to_string())?;

        rows.collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())
    }

    fn get_event_logs_for_report(
        &mut self,
        broadcast_id: i64,
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
    ) -> Result<Vec<EventLogResult>, String> {
        let query = r#"
            SELECT el.id, el.broadcast_id, el.user_id, el.username, el.user_flag, el.event_type, 
                    el.payload, el.timestamp, c.channel_id, c.channel_name, bs.title
            FROM event_logs el
            JOIN broadcast_sessions bs ON el.broadcast_id = bs.id
            JOIN channels c ON bs.channel_id = c.channel_id
            WHERE el.broadcast_id = ?1 AND el.timestamp >= ?2 AND el.timestamp < ?3
            ORDER BY el.timestamp ASC
        "#;

        let mut stmt = self.conn.prepare_cached(query).map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map(
                (broadcast_id, start_time.to_rfc3339(), end_time.to_rfc3339()),
                |row| {
                    let user_id: Option<String> = row.get(2)?;
                    let username: Option<String> = row.get(3)?;
                    let user_flag: Option<u32> = row.get(4)?;

                    let user = match (user_id, username, user_flag) {
                        (Some(id), Some(name), Some(flag)) => {
                            Some(parse_user_from_flag(flag, id, name))
                        }
                        _ => None,
                    };

                    Ok(EventLogResult {
                        id: row.get(0)?,
                        broadcast_id: row.get(1)?,
                        user,
                        event_type: row.get(5)?,
                        payload: row.get(6)?,
                        timestamp: DateTime::parse_from_rfc3339(&row.get::<_, String>(7)?)
                            .unwrap()
                            .with_timezone(&Utc),
                        channel_id: row.get(8)?,
                        channel_name: row.get(9)?,
                        broadcast_title: row.get(10)?,
                    })
                },
            )
            .map_err(|e| e.to_string())?;

        rows.collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())
    }

    pub fn handle_reset_all_data(&self, reply_to: oneshot::Sender<Result<(), String>>) {
        let result = self.reset_all_tables();
        let _ = reply_to.send(result);
    }

    fn reset_all_tables(&self) -> Result<(), String> {
        // 외래 키 제약 조건을 일시적으로 비활성화
        self.conn
            .execute("PRAGMA foreign_keys = OFF", [])
            .map_err(|e| format!("Failed to disable foreign keys: {}", e))?;

        // 모든 테이블의 데이터 삭제
        let tables = [
            "chat_logs",
            "event_logs", 
            "target_users",
            "reports",
            "broadcast_sessions",
            "channels",
        ];

        for table in &tables {
            self.conn
                .execute(&format!("DELETE FROM {}", table), [])
                .map_err(|e| format!("Failed to clear table {}: {}", table, e))?;
        }

        // 외래 키 제약 조건을 다시 활성화
        self.conn
            .execute("PRAGMA foreign_keys = ON", [])
            .map_err(|e| format!("Failed to re-enable foreign keys: {}", e))?;

        Ok(())
    }

    // 채널 삭제 구현
    fn delete_channel_impl(&self, channel_id: String) -> Result<(), String> {
        // 1. 채널과 연관된 모든 broadcast_session을 조회
        let broadcast_sessions = self.get_broadcast_sessions_by_channel(&channel_id)?;
        
        // 2. 각 broadcast_session을 삭제 (연관된 데이터도 함께 삭제됨)
        for session_id in broadcast_sessions {
            self.delete_broadcast_session_impl(session_id)?;
        }
        
        // 3. 마지막으로 채널 삭제
        let rows_affected = self
            .conn
            .execute("DELETE FROM channels WHERE channel_id = ?1", [&channel_id])
            .map_err(|e| format!("Channel deletion failed: {}", e))?;

        if rows_affected == 0 {
            return Err(format!("Channel with id {} not found", channel_id));
        }

        Ok(())
    }

    // 채널의 모든 broadcast_session ID 조회
    fn get_broadcast_sessions_by_channel(&self, channel_id: &str) -> Result<Vec<i64>, String> {
        let mut stmt = self
            .conn
            .prepare_cached("SELECT id FROM broadcast_sessions WHERE channel_id = ?1")
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map([channel_id], |row| {
                row.get::<_, i64>(0)
            })
            .map_err(|e| e.to_string())?;

        let mut session_ids = Vec::new();
        for row in rows {
            session_ids.push(row.map_err(|e| e.to_string())?);
        }

        Ok(session_ids)
    }

    pub fn handle_get_user_log_dates(
        &self,
        user_id: String,
        channel_id: String,
        reply_to: oneshot::Sender<Result<Vec<String>, String>>,
    ) {
        let result = self.get_user_log_dates_impl(user_id, channel_id);
        let _ = reply_to.send(result);
    }

    fn get_user_log_dates_impl(
        &self,
        user_id: String,
        channel_id: String,
    ) -> Result<Vec<String>, String> {
        let query = r#"
            SELECT DISTINCT date(timestamp) as log_date
            FROM (
                SELECT cl.timestamp
                FROM chat_logs cl
                JOIN broadcast_sessions bs ON cl.broadcast_id = bs.id
                JOIN channels c ON bs.channel_id = c.channel_id
                WHERE cl.user_id = ?1 AND c.channel_id = ?2
                
                UNION ALL
                
                SELECT el.timestamp
                FROM event_logs el
                JOIN broadcast_sessions bs ON el.broadcast_id = bs.id
                JOIN channels c ON bs.channel_id = c.channel_id
                WHERE el.user_id = ?1 AND c.channel_id = ?2
            ) AS combined_logs
            ORDER BY log_date DESC
        "#;

        let mut stmt = self
            .conn
            .prepare_cached(query)
            .map_err(|e| format!("Failed to prepare query: {}", e))?;

        let rows = stmt
            .query_map([&user_id, &channel_id], |row| {
                row.get::<_, String>(0)
            })
            .map_err(|e| format!("Query execution failed: {}", e))?;

        let mut dates = Vec::new();
        for row in rows {
            dates.push(row.map_err(|e| format!("Row processing failed: {}", e))?);
        }

        Ok(dates)
    }
}
