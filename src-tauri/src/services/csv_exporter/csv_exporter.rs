use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::models::events::{
    ChatEvent, DonationEvent, MetadataEvent, MuteEvent, UserEvent, EVENT_TYPE_CHAT,
    EVENT_TYPE_DONATION, EVENT_TYPE_KICK, EVENT_TYPE_METADATA_UPDATE, EVENT_TYPE_MUTE,
};
use crate::services::csv_exporter::csv_schemas::{
    ChatCsvRow, DonationCsvRow, KickCsvRow, MetadataUpdateCsvRow, MuteCsvRow,
};
use crate::services::db::{
    commands::{ChatSearchFilters, EventSearchFilters, PaginationParams},
    service::DBService,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CsvExportOptions {
    pub event_type: String,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub channel_id: Option<String>,
    pub broadcast_id: Option<i64>,
    pub output_path: String,
}

#[derive(Debug)]
pub struct CSVExporter {
    db_service: DBService,
}

impl CSVExporter {
    pub fn new(db_service: DBService) -> Self {
        Self { db_service }
    }

    pub async fn export_events_to_csv(&self, options: CsvExportOptions) -> Result<String, String> {
        if options.broadcast_id.is_none() && options.channel_id.is_none() {
            let error = "Either broadcast_id or channel_id must be provided".to_string();
            println!("CSVExporter: Validation failed: {}", error);
            return Err(error);
        }

        // Chat과 다른 이벤트를 구분해서 처리
        if options.event_type == EVENT_TYPE_CHAT {
            return self.export_chat_logs_to_csv(options).await;
        } else {
            return self.export_event_logs_to_csv(options).await;
        }
    }

    async fn export_chat_logs_to_csv(&self, options: CsvExportOptions) -> Result<String, String> {
        let filters = ChatSearchFilters {
            channel_id: options.channel_id.clone(),
            user_id: None,
            username: None,
            message_contains: None,
            message_type: None,
            start_date: options.start_date,
            end_date: options.end_date,
            broadcast_id: options.broadcast_id,
        };

        // 대용량 데이터를 처리하기 위해 페이지 단위로 처리
        let mut page = 1;
        let page_size = 1000;

        let mut writer = csv::Writer::from_path(&options.output_path).map_err(|e| {
            let error = format!("Failed to create CSV writer: {}", e);
            println!("CSVExporter: {}", error);
            error
        })?;

        loop {
            let pagination = PaginationParams { page, page_size };

            let result = self
                .db_service
                .search_chat_logs(filters.clone(), pagination)
                .await
                .map_err(|e| {
                    let error = format!("Failed to search chat logs: {}", e);
                    println!("CSVExporter: {}", error);
                    error
                })?;

            if result.chat_logs.is_empty() {
                break;
            }

            // 마지막 페이지인지 확인
            let is_last_page = result.chat_logs.len() < page_size as usize;

            // 채팅 로그를 CSV 행으로 변환
            for chat_log in result.chat_logs {
                let chat_type = match chat_log.message_type.as_str() {
                    "TEXT" => soup_sdk::chat::types::ChatType::Common,
                    "EMOTICON" => soup_sdk::chat::types::ChatType::Emoticon,
                    "MANAGER" => soup_sdk::chat::types::ChatType::Manager,
                    _ => soup_sdk::chat::types::ChatType::Common,
                };

                let row = ChatCsvRow::from_chat_event(
                    chat_log.timestamp,
                    chat_log.channel_id.clone(),
                    chat_log.message,
                    chat_type,
                    chat_log.user,
                    false,
                );
                writer
                    .serialize(&row)
                    .map_err(|e| format!("Failed to write CSV row: {}", e))?;
            }

            if is_last_page {
                break;
            }

            page += 1;
        }

        writer
            .flush()
            .map_err(|e| format!("Failed to flush CSV writer: {}", e))?;

        Ok(options.output_path)
    }

    async fn export_event_logs_to_csv(&self, options: CsvExportOptions) -> Result<String, String> {
        let filters = EventSearchFilters {
            channel_id: options.channel_id.clone(),
            user_id: None,
            username: None,
            event_type: Some(options.event_type.clone()),
            exclude_event_types: Vec::new(),
            start_date: options.start_date,
            end_date: options.end_date,
            broadcast_id: options.broadcast_id,
        };

        println!("CSVExporter: Created event filters: {:?}", filters);

        // 대용량 데이터를 처리하기 위해 페이지 단위로 처리
        let mut page = 1;
        let page_size = 1000;

        println!(
            "CSVExporter: Creating CSV writer for path: {}",
            options.output_path
        );
        let mut writer = csv::Writer::from_path(&options.output_path).map_err(|e| {
            let error = format!("Failed to create CSV writer: {}", e);
            println!("CSVExporter: {}", error);
            error
        })?;

        loop {
            let pagination = PaginationParams { page, page_size };

            let result = self
                .db_service
                .search_event_logs(filters.clone(), pagination)
                .await
                .map_err(|e| {
                    let error = format!("Failed to search event logs: {}", e);
                    println!("CSVExporter: {}", error);
                    error
                })?;

            if result.event_logs.is_empty() {
                println!("CSVExporter: No more events, breaking loop");
                break;
            }

            // 마지막 페이지인지 확인
            let is_last_page = result.event_logs.len() < page_size as usize;

            // 이벤트 타입별로 CSV 행 작성
            for event_log in result.event_logs {
                self.write_csv_row(&mut writer, &options.event_type, &event_log.payload)?;
            }

            if is_last_page {
                break;
            }

            page += 1;
        }

        writer
            .flush()
            .map_err(|e| format!("Failed to flush CSV writer: {}", e))?;

        println!("CSVExporter: Event logs export completed");
        Ok(options.output_path)
    }

    fn write_csv_row(
        &self,
        writer: &mut csv::Writer<std::fs::File>,
        event_type: &str,
        payload: &str,
    ) -> Result<(), String> {
        match event_type {
            EVENT_TYPE_CHAT => {
                let event: ChatEvent = serde_json::from_str(payload)
                    .map_err(|e| format!("Failed to parse chat event: {}", e))?;
                let row = ChatCsvRow::from_chat_event(
                    event.timestamp,
                    event.channel_id,
                    event.comment,
                    event.chat_type,
                    event.user,
                    event.is_admin,
                );
                writer
                    .serialize(&row)
                    .map_err(|e| format!("Failed to write CSV row: {}", e))?;
            }
            EVENT_TYPE_DONATION => {
                let event: DonationEvent = serde_json::from_str(payload)
                    .map_err(|e| format!("Failed to parse donation event: {}", e))?;
                let row = DonationCsvRow::from_donation_event(
                    event.timestamp,
                    event.channel_id,
                    event.from,
                    event.from_label,
                    event.amount,
                    event.donation_type,
                    event.message,
                    event.become_top_fan,
                    event.fan_club_ordinal,
                );
                writer
                    .serialize(&row)
                    .map_err(|e| format!("Failed to write CSV row: {}", e))?;
            }
            EVENT_TYPE_MUTE => {
                let event: MuteEvent = serde_json::from_str(payload)
                    .map_err(|e| format!("Failed to parse mute event: {}", e))?;
                let row = MuteCsvRow::from_mute_event(
                    event.timestamp,
                    event.channel_id,
                    event.user,
                    event.seconds,
                    event.message,
                    event.by,
                    event.counts,
                    event.superuser_type,
                );
                writer
                    .serialize(&row)
                    .map_err(|e| format!("Failed to write CSV row: {}", e))?;
            }
            EVENT_TYPE_KICK => {
                let event: UserEvent = serde_json::from_str(payload)
                    .map_err(|e| format!("Failed to parse kick event: {}", e))?;
                let row =
                    KickCsvRow::from_kick_event(event.timestamp, event.channel_id, event.user);
                writer
                    .serialize(&row)
                    .map_err(|e| format!("Failed to write CSV row: {}", e))?;
            }
            EVENT_TYPE_METADATA_UPDATE => {
                let event: MetadataEvent = serde_json::from_str(payload)
                    .map_err(|e| format!("Failed to parse metadata event: {}", e))?;
                let row = MetadataUpdateCsvRow::from_metadata_event(
                    event.timestamp,
                    event.channel_id,
                    event.title,
                    event.started_at,
                    event.viewer_count,
                );
                writer
                    .serialize(&row)
                    .map_err(|e| format!("Failed to write CSV row: {}", e))?;
            }
            _ => return Err(format!("Unsupported event type: {}", event_type)),
        }

        Ok(())
    }
}
