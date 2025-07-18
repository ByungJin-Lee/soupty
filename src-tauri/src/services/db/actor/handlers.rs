use chrono::{DateTime, Utc};
use rusqlite::{Connection};
use tokio::sync::oneshot;

use crate::services::db::commands::{
    ChannelData, ChatLogData, EventLogData, UserData, ChatSearchFilters, EventSearchFilters,
    PaginationParams, ChatSearchResult, EventSearchResult, ChatLogResult, EventLogResult
};

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

        if let Some(broadcast_id) = &filters.broadcast_id {
            where_conditions.push("cl.broadcast_id = ?");
            param_values.push(broadcast_id.to_string());
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
        
        if let Some(channel_id) = &filters.channel_id {
            where_conditions.push("c.channel_id = ?");
            param_values.push(channel_id.clone());
        }

        if let Some(user_id) = &filters.user_id {
            where_conditions.push("el.user_id = ?");
            param_values.push(user_id.clone());
        }

        if let Some(event_type) = &filters.event_type {
            where_conditions.push("el.event_type = ?");
            param_values.push(event_type.clone());
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
        let message_contains = filters.message_contains.as_ref().unwrap();
        
        let additional_where = if where_clause.is_empty() { 
            String::new() 
        } else { 
            format!("AND {}", &where_clause[6..]) 
        };
        
        let fts_query = format!(
            "SELECT cl.id, cl.broadcast_id, cl.user_id, u.username, cl.message_type, 
                    cl.message, cl.metadata, cl.timestamp, c.channel_id, c.channel_name, bs.title
             FROM chat_logs_fts fts
             JOIN chat_logs cl ON fts.chat_log_id = cl.id
             JOIN users u ON cl.user_id = u.user_id
             JOIN broadcast_sessions bs ON cl.broadcast_id = bs.id
             JOIN channels c ON bs.channel_id = c.channel_id
             WHERE fts.message_morph MATCH ?1 {}
             ORDER BY cl.timestamp DESC
             LIMIT ? OFFSET ?",
            additional_where
        );

        let mut stmt = self.conn.prepare_cached(&fts_query).map_err(|e| e.to_string())?;
        
        let limit_str = limit.to_string();
        let offset_str = offset.to_string();
        let mut all_params = vec![message_contains.as_str()];
        all_params.extend(params);
        all_params.push(&limit_str);
        all_params.push(&offset_str);

        let rows = stmt.query_map(rusqlite::params_from_iter(all_params.iter()), |row| {
            Ok(ChatLogResult {
                id: row.get(0)?,
                broadcast_id: row.get(1)?,
                user_id: row.get(2)?,
                username: row.get(3)?,
                message_type: row.get(4)?,
                message: row.get(5)?,
                metadata: row.get(6)?,
                timestamp: DateTime::parse_from_rfc3339(&row.get::<_, String>(7)?)
                    .unwrap()
                    .with_timezone(&Utc),
                channel_id: row.get(8)?,
                channel_name: row.get(9)?,
                broadcast_title: row.get(10)?,
            })
        }).map_err(|e| e.to_string())?;

        rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
    }

    fn search_chat_logs_without_fts(
        &self,
        where_clause: &str,
        params: &[&str],
        limit: i64,
        offset: i64,
    ) -> Result<Vec<ChatLogResult>, String> {
        let query = format!(
            "SELECT cl.id, cl.broadcast_id, cl.user_id, u.username, cl.message_type, 
                    cl.message, cl.metadata, cl.timestamp, c.channel_id, c.channel_name, bs.title
             FROM chat_logs cl
             JOIN users u ON cl.user_id = u.user_id
             JOIN broadcast_sessions bs ON cl.broadcast_id = bs.id
             JOIN channels c ON bs.channel_id = c.channel_id
             {}
             ORDER BY cl.timestamp DESC
             LIMIT ? OFFSET ?",
            where_clause
        );

        let mut stmt = self.conn.prepare_cached(&query).map_err(|e| e.to_string())?;
        
        let limit_str = limit.to_string();
        let offset_str = offset.to_string();
        let mut all_params = params.to_vec();
        all_params.push(&limit_str);
        all_params.push(&offset_str);

        let rows = stmt.query_map(rusqlite::params_from_iter(all_params.iter()), |row| {
            Ok(ChatLogResult {
                id: row.get(0)?,
                broadcast_id: row.get(1)?,
                user_id: row.get(2)?,
                username: row.get(3)?,
                message_type: row.get(4)?,
                message: row.get(5)?,
                metadata: row.get(6)?,
                timestamp: DateTime::parse_from_rfc3339(&row.get::<_, String>(7)?)
                    .unwrap()
                    .with_timezone(&Utc),
                channel_id: row.get(8)?,
                channel_name: row.get(9)?,
                broadcast_title: row.get(10)?,
            })
        }).map_err(|e| e.to_string())?;

        rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
    }

    fn search_event_logs_only(
        &self,
        where_clause: &str,
        params: &[&str],
        limit: i64,
        offset: i64,
    ) -> Result<Vec<EventLogResult>, String> {
        let query = format!(
            "SELECT el.id, el.broadcast_id, el.user_id, u.username, el.event_type, 
                    el.payload, el.timestamp, c.channel_id, c.channel_name, bs.title
             FROM event_logs el
             LEFT JOIN users u ON el.user_id = u.user_id
             JOIN broadcast_sessions bs ON el.broadcast_id = bs.id
             JOIN channels c ON bs.channel_id = c.channel_id
             {}
             ORDER BY el.timestamp DESC
             LIMIT ? OFFSET ?",
            where_clause
        );

        let mut stmt = self.conn.prepare_cached(&query).map_err(|e| e.to_string())?;
        
        let limit_str = limit.to_string();
        let offset_str = offset.to_string();
        let mut all_params = params.to_vec();
        all_params.push(&limit_str);
        all_params.push(&offset_str);

        let rows = stmt.query_map(rusqlite::params_from_iter(all_params.iter()), |row| {
            Ok(EventLogResult {
                id: row.get(0)?,
                broadcast_id: row.get(1)?,
                user_id: row.get(2)?,
                username: row.get(3)?,
                event_type: row.get(4)?,
                payload: row.get(5)?,
                timestamp: DateTime::parse_from_rfc3339(&row.get::<_, String>(6)?)
                    .unwrap()
                    .with_timezone(&Utc),
                channel_id: row.get(7)?,
                channel_name: row.get(8)?,
                broadcast_title: row.get(9)?,
            })
        }).map_err(|e| e.to_string())?;

        rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
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
                 WHERE fts.message_morph MATCH ?1 {}",
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

        let mut stmt = self.conn.prepare_cached(&query).map_err(|e| e.to_string())?;
        
        let count = if filters.message_contains.is_some() {
            let message_contains = filters.message_contains.as_ref().unwrap();
            let mut all_params = vec![message_contains.as_str()];
            all_params.extend(params);
            stmt.query_row(rusqlite::params_from_iter(all_params.iter()), |row| row.get::<_, i64>(0))
        } else {
            stmt.query_row(rusqlite::params_from_iter(params.iter()), |row| row.get::<_, i64>(0))
        }.map_err(|e| e.to_string())?;

        Ok(count)
    }
    
    fn get_event_total_count(
        &self,
        where_clause: &str,
        params: &[&str],
    ) -> Result<i64, String> {
        let query = format!(
            "SELECT COUNT(*) FROM event_logs el
             JOIN broadcast_sessions bs ON el.broadcast_id = bs.id
             JOIN channels c ON bs.channel_id = c.channel_id
             {}",
            where_clause
        );

        let mut stmt = self.conn.prepare_cached(&query).map_err(|e| e.to_string())?;
        
        let count = stmt.query_row(rusqlite::params_from_iter(params.iter()), |row| row.get::<_, i64>(0))
            .map_err(|e| e.to_string())?;

        Ok(count)
    }
}