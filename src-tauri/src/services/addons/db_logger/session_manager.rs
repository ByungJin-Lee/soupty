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

        // 새 방송 세션 생성
        let now = chrono::Utc::now();
        let broadcast_id = ctx
            .db
            .create_broadcast_session(
                channel_id.to_string(),
                format!("Live Stream - {}", now.format("%Y-%m-%d %H:%M:%S")),
                now,
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
            "[SessionManager] New broadcast session created: {}",
            broadcast_id
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