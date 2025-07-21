use std::{future::Future, sync::Arc};

use anyhow::Result;
use chrono::Utc;
use soup_sdk::SoopHttpClient;
use tokio::sync::Mutex;

use crate::services::addons::interface::BroadcastMetadata;

#[derive(Clone)]
pub struct MetadataManager {
    broadcast_metadata: Arc<Mutex<Option<BroadcastMetadata>>>,
}

impl MetadataManager {
    pub fn new() -> Self {
        Self {
            broadcast_metadata: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn initialize(&mut self, streamer_id: &str) -> Result<()> {
        // 초기 메타데이터를 가져와서 broadcast_metadata에 저장
        let metadata = Self::fetch_metadata(streamer_id).await?;
        let mut mut_ref = self.broadcast_metadata.lock().await;
        *mut_ref = Some(metadata);
        Ok(())
    }

    async fn fetch_metadata(streamer_id: &str) -> Result<BroadcastMetadata> {
        let soop_client = SoopHttpClient::new();

        // Station 데이터에서 broad_start, viewer_count 가져오기
        let station = soop_client.get_station(streamer_id).await?;

        // Live 데이터에서 title 가져오기
        let (_, live) = soop_client.get_live_detail_state(streamer_id).await?;

        // broad_start를 DateTime<Utc>로 파싱 (YYYY-MM-DD HH:MM:SS 형식)
        let mut started_at =
            chrono::NaiveDateTime::parse_from_str(&station.broad_start, "%Y-%m-%d %H:%M:%S")
                .map_err(|e| anyhow::anyhow!("Failed to parse broad_start: {}", e))?
                .and_utc();

        // started_at에서 9시간을 빼기
        started_at = started_at - chrono::Duration::hours(9);

        Ok(BroadcastMetadata {
            channel_id: streamer_id.to_string(),
            title: live.unwrap().title,
            started_at,
            viewer_count: station.viewer_count,
            timestamp: Utc::now(),
        })
    }

    pub async fn update_metadata<F, Fut>(&mut self, notifier: F) -> Result<()>
    where
        F: Fn(&BroadcastMetadata) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = ()> + Send,
    {
        let streamer_id = {
            let guard = self.broadcast_metadata.lock().await;
            guard.as_ref().unwrap().channel_id.clone()
        };

        let fresh_metadata = Self::fetch_metadata(&streamer_id).await?;
        notifier(&fresh_metadata).await;

        let mut guard = self.broadcast_metadata.lock().await;
        *guard = Some(fresh_metadata);

        Ok(())
    }

    pub async fn notify_initial_metadata<F, Fut>(&self, notifier: F)
    where
        F: Fn(&BroadcastMetadata) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = ()> + Send,
    {
        let guard = self.broadcast_metadata.lock().await;
        if let Some(ref metadata) = *guard {
            notifier(metadata).await;
        }
    }

    pub async fn get_metadata(&self) -> Result<Option<BroadcastMetadata>> {
        let guard = self.broadcast_metadata.lock().await;

        Ok(guard.clone())
    }

    pub async fn stop(&mut self) {
        let mut guard = self.broadcast_metadata.lock().await;
        *guard = None;
    }
}
