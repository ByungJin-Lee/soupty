use anyhow::Result;
use chrono::Utc;
use soup_sdk::SoopHttpClient;

use crate::services::addons::interface::BroadcastMetadata;

pub struct MetadataManager;

impl MetadataManager {
    pub async fn fetch_initial_metadata(streamer_id: &str) -> Result<BroadcastMetadata> {
        let soop_client = SoopHttpClient::new();

        // Station 데이터에서 broad_start, viewer_count 가져오기
        let station = soop_client.get_station(streamer_id).await?;

        // Live 데이터에서 title 가져오기
        let (_, live) = soop_client.get_live_detail_state(streamer_id).await?;

        // broad_start를 DateTime<Utc>로 파싱 (YYYY-MM-DD HH:MM:SS 형식)
        let started_at =
            chrono::NaiveDateTime::parse_from_str(&station.broad_start, "%Y-%m-%d %H:%M:%S")
                .map_err(|e| anyhow::anyhow!("Failed to parse broad_start: {}", e))?
                .and_utc();

        Ok(BroadcastMetadata {
            channel_id: streamer_id.to_string(),
            title: live.unwrap().title,
            started_at,
            viewer_count: station.viewer_count,
            timestamp: Utc::now(),
        })
    }

    pub async fn update_viewer_count(channel_id: &str) -> Result<u64> {
        let soop_client = SoopHttpClient::new();
        let station = soop_client.get_station(channel_id).await?;
        Ok(station.viewer_count)
    }
}
