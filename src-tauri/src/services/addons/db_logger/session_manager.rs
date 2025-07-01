use std::sync::Arc;
use tokio::sync::Mutex;
use chrono::{DateTime, Utc};

use crate::services::addons::interface::AddonContext;

pub struct SessionManager {
    current_broadcast_id: Arc<Mutex<Option<i64>>>,
}

impl SessionManager {
    pub fn new() -> Self {
        Self {
            current_broadcast_id: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn ensure_broadcast_session(
        &self,
        ctx: &AddonContext,
        channel_id: &str,
    ) -> Result<i64, Box<dyn std::error::Error>> {
        // 먼저 읽기 전용으로 확인
        {
            let broadcast_id_guard = self.current_broadcast_id.lock().await;
            if let Some(broadcast_id) = *broadcast_id_guard {
                return Ok(broadcast_id);
            }
        }

        // broadcast_metadata에서 실제 방송 시작 시간과 제목 사용
        let (title, started_at) = if let Some(metadata) = &ctx.broadcast_metadata {
            (metadata.title.clone(), metadata.started_at)
        } else {
            // fallback: 현재 시간 사용
            let now = chrono::Utc::now();
            (format!("Live Stream - {}", now.format("%Y-%m-%d %H:%M:%S")), now)
        };

        let broadcast_id = ctx
            .db
            .create_broadcast_session(
                channel_id.to_string(),
                title,
                started_at,
            )
            .await
            .map_err(|e| {
                eprintln!("[SessionManager] Failed to create broadcast session: {}", e);
                Box::new(std::io::Error::new(std::io::ErrorKind::Other, e))
                    as Box<dyn std::error::Error>
            })?;

        // 락 해제 후 업데이트
        {
            let mut broadcast_id_guard = self.current_broadcast_id.lock().await;
            *broadcast_id_guard = Some(broadcast_id);
        }

        println!(
            "[SessionManager] Broadcast session created/retrieved: {} (started: {})",
            broadcast_id, started_at
        );

        Ok(broadcast_id)
    }

    pub async fn get_current_session(&self) -> Option<i64> {
        let broadcast_id_guard = self.current_broadcast_id.lock().await;
        *broadcast_id_guard
    }

    pub async fn end_session(&self, ctx: &AddonContext, ended_at: DateTime<Utc>) -> Result<(), String> {
        let broadcast_id = {
            let broadcast_id_guard = self.current_broadcast_id.lock().await;
            *broadcast_id_guard
        };

        if let Some(broadcast_id) = broadcast_id {
            ctx.db.end_broadcast_session(broadcast_id, ended_at).await?;
            let mut broadcast_id_guard = self.current_broadcast_id.lock().await;
            *broadcast_id_guard = None;
        }

        Ok(())
    }
}