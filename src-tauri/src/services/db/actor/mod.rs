mod handlers;
mod initialization;

use rusqlite::Connection;
use std::path::PathBuf;
use tokio::sync::mpsc;

use crate::services::db::commands::DBCommand;
use handlers::CommandHandlers;
use initialization::DBInitializer;

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
            return;
        }

        while let Some(cmd) = self.receiver.blocking_recv() {
            self.handle_command(cmd);
        }
    }

    /// DB 초기화: 마이그레이션, 커스텀 함수 등록 등
    fn initialize_db(&mut self) -> anyhow::Result<()> {
        let initializer = DBInitializer::new(&self.conn);
        initializer.initialize()
    }

    fn handle_command(&mut self, cmd: DBCommand) {
        let mut handlers = CommandHandlers::new(&self.conn);

        match cmd {
            DBCommand::Initialize => handlers.handle_initialize(),
            DBCommand::CreateBroadcastSession {
                channel_id,
                title,
                started_at,
                reply_to,
            } => handlers.handle_create_broadcast_session(channel_id, title, started_at, reply_to),
            DBCommand::EndBroadcastSession {
                broadcast_id,
                ended_at,
                reply_to,
            } => handlers.handle_end_broadcast_session(broadcast_id, ended_at, reply_to),
            DBCommand::UpsertChannels { channels, reply_to } => {
                handlers.handle_upsert_channels(channels, reply_to)
            }
            DBCommand::DeleteChannel {
                channel_id,
                reply_to,
            } => handlers.handle_delete_channel(channel_id, reply_to),
            DBCommand::InsertChatLogs { logs, reply_to } => {
                handlers.handle_insert_chat_logs(logs, reply_to)
            }
            DBCommand::InsertEventLogs { logs, reply_to } => {
                handlers.handle_insert_event_logs(logs, reply_to)
            }
            DBCommand::GetChannels { reply_to } => handlers.handle_get_channels(reply_to),
            DBCommand::GetTargetUsers { reply_to } => handlers.handle_get_target_users(reply_to),
            DBCommand::AddTargetUser {
                user_id,
                description,
                reply_to,
            } => handlers.handle_add_target_user(user_id, description, reply_to),
            DBCommand::RemoveTargetUser { user_id, reply_to } => {
                handlers.handle_remove_target_user(user_id, reply_to)
            }
            DBCommand::SearchChatLogs {
                filters,
                pagination,
                reply_to,
            } => handlers.handle_search_chat_logs(filters, pagination, reply_to),
            DBCommand::SearchEventLogs {
                filters,
                pagination,
                reply_to,
            } => handlers.handle_search_event_logs(filters, pagination, reply_to),
            DBCommand::DeleteBroadcastSession {
                broadcast_id,
                reply_to,
            } => handlers.handle_delete_broadcast_session(broadcast_id, reply_to),
            DBCommand::SearchBroadcastSessions {
                filters,
                pagination,
                reply_to,
            } => handlers.handle_search_broadcast_sessions(filters, pagination, reply_to),
            DBCommand::GetBroadcastSession {
                broadcast_id,
                reply_to,
            } => handlers.handle_get_broadcast_session(broadcast_id, reply_to),
            DBCommand::UpdateBroadcastSessionEndTime {
                broadcast_id,
                ended_at,
                reply_to,
            } => {
                handlers.handle_update_broadcast_session_end_time(broadcast_id, ended_at, reply_to)
            }
            DBCommand::CreateReport {
                broadcast_id,
                reply_to,
            } => handlers.handle_create_report(broadcast_id, reply_to),
            DBCommand::UpdateReportStatus {
                broadcast_id,
                status,
                progress_percentage,
                error_message,
                reply_to,
            } => handlers.handle_update_report_status(
                broadcast_id,
                status,
                progress_percentage,
                error_message,
                reply_to,
            ),
            DBCommand::UpdateReportData {
                broadcast_id,
                report_data,
                reply_to,
            } => handlers.handle_update_report_data(broadcast_id, report_data, reply_to),
            DBCommand::GetReport {
                broadcast_id,
                reply_to,
            } => handlers.handle_get_report(broadcast_id, reply_to),
            DBCommand::DeleteReport {
                broadcast_id,
                reply_to,
            } => handlers.handle_delete_report(broadcast_id, reply_to),
            DBCommand::GetReportStatus {
                broadcast_id,
                reply_to,
            } => handlers.handle_get_report_status(broadcast_id, reply_to),
            DBCommand::GetChatLogsForReport {
                broadcast_id,
                start_time,
                end_time,
                reply_to,
            } => handlers.handle_get_chat_logs_for_report(
                broadcast_id,
                start_time,
                end_time,
                reply_to,
            ),
            DBCommand::GetEventLogsForReport {
                broadcast_id,
                start_time,
                end_time,
                reply_to,
            } => handlers.handle_get_event_logs_for_report(
                broadcast_id,
                start_time,
                end_time,
                reply_to,
            ),
        }
    }
}
