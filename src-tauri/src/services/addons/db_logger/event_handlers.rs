use chrono::{DateTime, Utc};

use crate::{
    models::events::*,
    services::{
        addons::interface::AddonContext,
        db::commands::{ChatLogData, EventLogData, ChatMetadata, EmoticonMetadata},
    },
};

use super::user_flag::create_user_flag;

use super::{
    constants::*,
    buffer::LogBuffer,
    session_manager::SessionManager,
};

pub struct EventProcessor {
    session_manager: SessionManager,
}

impl EventProcessor {
    pub fn new(session_manager: SessionManager) -> Self {
        Self { session_manager }
    }

    pub async fn process_chat_event(
        &self,
        ctx: &AddonContext,
        event: &ChatEvent,
        buffer: &mut LogBuffer,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let broadcast_id = self
            .session_manager
            .ensure_broadcast_session(ctx, &event.channel_id)
            .await
            .map_err(|e| {
                eprintln!(
                    "[EventProcessor] Failed to ensure broadcast session for channel {}: {}",
                    event.channel_id, e
                );
                e
            })?;

        // 사용자 플래그 계산
        let user_flag = create_user_flag(&event.user);


        // 채팅 로그 추가
        let message_type = match event.chat_type {
            soup_sdk::chat::types::ChatType::Emoticon => MESSAGE_TYPE_EMOTICON,
            _ => MESSAGE_TYPE_TEXT,
        };

        let metadata = if let Some(ref emoticon) = event.ogq {
            Some(ChatMetadata {
                emoticon: Some(EmoticonMetadata {
                    id: emoticon.id.clone(),
                    number: emoticon.number.clone(),
                    ext: emoticon.ext.clone(),
                    version: emoticon.version.clone(),
                }),
            })
        } else {
            None
        };

        buffer.chat_logs.push(ChatLogData {
            broadcast_id,
            user_id: event.user.id.clone(),
            username: event.user.label.clone(),
            user_flag,
            message_type: message_type.to_string(),
            message: event.comment.clone(),
            metadata,
            timestamp: event.timestamp,
        });

        Ok(())
    }

    pub async fn process_event_log<T: serde::Serialize>(
        &self,
        ctx: &AddonContext,
        channel_id: &str,
        user_id: Option<&str>,
        username: Option<&str>,
        user_flag: Option<u32>,
        event_type: &str,
        event_data: &T,
        timestamp: DateTime<Utc>,
        buffer: &mut LogBuffer,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let broadcast_id = self
            .session_manager
            .ensure_broadcast_session(ctx, channel_id)
            .await?;


        buffer.event_logs.push(EventLogData {
            broadcast_id,
            user_id: user_id.map(|s| s.to_string()),
            username: username.map(|s| s.to_string()),
            user_flag,
            event_type: event_type.to_string(),
            payload: serde_json::to_string(event_data)?,
            timestamp,
        });

        Ok(())
    }

    pub async fn flush_buffer(
        &self,
        ctx: &AddonContext,
        buffer: &mut LogBuffer,
    ) -> Result<(), Box<dyn std::error::Error>> {
        if buffer.chat_logs.is_empty() && buffer.event_logs.is_empty() {
            return Ok(());
        }

        let chat_logs = buffer.chat_logs.clone();
        let event_logs = buffer.event_logs.clone();

        let chat_count = chat_logs.len();
        let event_count = event_logs.len();

        // 버퍼 클리어
        buffer.clear();

        // 방송 세션이 존재하는지 먼저 확인
        let has_broadcast_session = self.session_manager.get_current_session().await.is_some();

        if !has_broadcast_session {
            eprintln!("[EventProcessor] Skipping logs - no broadcast session");
            return Ok(());
        }


        // 채팅 로그 저장
        if !chat_logs.is_empty() {
            ctx.db.insert_chat_logs(chat_logs).await.map_err(|e| {
                eprintln!("[EventProcessor] Failed to insert chat logs: {}", e);
                Box::new(std::io::Error::new(std::io::ErrorKind::Other, e))
                    as Box<dyn std::error::Error>
            })?;
        }

        // 이벤트 로그 저장
        if !event_logs.is_empty() {
            ctx.db.insert_event_logs(event_logs).await.map_err(|e| {
                eprintln!("[EventProcessor] Failed to insert event logs: {}", e);
                Box::new(std::io::Error::new(std::io::ErrorKind::Other, e))
                    as Box<dyn std::error::Error>
            })?;
        }

        if chat_count > 0 || event_count > 0 {
            println!(
                "[EventProcessor] Successfully flushed {} chat logs and {} event logs",
                chat_count, event_count
            );
        }

        Ok(())
    }
}