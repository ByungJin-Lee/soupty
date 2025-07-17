use chrono::{DateTime, Utc};
use std::path::Path;
use tokio::sync::{mpsc, oneshot};

use crate::services::db::{
    actor::DBActor,
    commands::{ChannelData, ChatLogData, DBCommand, EventLogData, UserData},
};

#[derive(Clone, Debug)]
pub struct DBService {
    sender: mpsc::Sender<DBCommand>,
}

impl DBService {
    pub async fn new(db_path: &Path) -> Result<Self, String> {
        let (sender, receiver) = mpsc::channel(128);
        let path = db_path.to_path_buf();

        // 전용 동기 스레드에서 Actor를 실행합니다.
        std::thread::spawn(move || {
            let mut actor = DBActor::new(path, receiver).expect("Failed to create DBActor");
            actor.run();
        });

        // 초기화 명령을 보냅니다.
        let _ = sender
            .send(DBCommand::Initialize)
            .await
            .map_err(|_| "Initialization DB Command error!".to_string())?;

        Ok(Self { sender })
    }

    pub async fn create_broadcast_session(
        &self,
        channel_id: String,
        title: String,
        started_at: DateTime<Utc>,
    ) -> Result<i64, String> {
        let (tx, rx) = oneshot::channel();
        self.sender
            .send(DBCommand::CreateBroadcastSession {
                channel_id,
                title,
                started_at,
                reply_to: tx,
            })
            .await
            .map_err(|_| "Failed to send command".to_string())?;

        rx.await
            .map_err(|_| "Failed to receive response".to_string())?
    }

    pub async fn end_broadcast_session(
        &self,
        broadcast_id: i64,
        ended_at: DateTime<Utc>,
    ) -> Result<(), String> {
        let (tx, rx) = oneshot::channel();
        self.sender
            .send(DBCommand::EndBroadcastSession {
                broadcast_id,
                ended_at,
                reply_to: tx,
            })
            .await
            .map_err(|_| "Failed to send command".to_string())?;

        rx.await
            .map_err(|_| "Failed to receive response".to_string())?
    }

    pub async fn get_channels(&self) -> Result<Vec<ChannelData>, String> {
        let (tx, rx) = oneshot::channel::<Result<Vec<ChannelData>, String>>();
        self.sender
            .send(DBCommand::GetChannels { reply_to: tx })
            .await
            .map_err(|_| "Failed to send command".to_string())?;

        rx.await
            .map_err(|_| "Failed to receive response".to_string())?
    }

    pub async fn upsert_users(&self, users: Vec<UserData>) -> Result<(), String> {
        let (tx, rx) = oneshot::channel();
        self.sender
            .send(DBCommand::UpsertUsers {
                users,
                reply_to: tx,
            })
            .await
            .map_err(|_| "Failed to send command".to_string())?;

        rx.await
            .map_err(|_| "Failed to receive response".to_string())?
    }

    pub async fn upsert_channels(&self, channels: Vec<ChannelData>) -> Result<(), String> {
        let (tx, rx) = oneshot::channel();
        self.sender
            .send(DBCommand::UpsertChannels {
                channels,
                reply_to: tx,
            })
            .await
            .map_err(|_| "Failed to send command".to_string())?;

        rx.await
            .map_err(|_| "Failed to receive response".to_string())?
    }

    pub async fn delete_channel(&self, channel_id: &str) -> Result<(), String> {
        let (tx, rx) = oneshot::channel();
        self.sender
            .send(DBCommand::DeleteChannel {
                channel_id: channel_id.to_string(),
                reply_to: tx,
            })
            .await
            .map_err(|_| "Failed to send command".to_string())?;

        rx.await
            .map_err(|_| "Failed to receive response".to_string())?
    }

    pub async fn insert_chat_logs(&self, logs: Vec<ChatLogData>) -> Result<(), String> {
        let (tx, rx) = oneshot::channel();
        self.sender
            .send(DBCommand::InsertChatLogs { logs, reply_to: tx })
            .await
            .map_err(|_| "Failed to send command".to_string())?;

        rx.await
            .map_err(|_| "Failed to receive response".to_string())?
    }

    pub async fn insert_event_logs(&self, logs: Vec<EventLogData>) -> Result<(), String> {
        let (tx, rx) = oneshot::channel();
        self.sender
            .send(DBCommand::InsertEventLogs { logs, reply_to: tx })
            .await
            .map_err(|_| "Failed to send command".to_string())?;

        rx.await
            .map_err(|_| "Failed to receive response".to_string())?
    }

    pub async fn get_target_users(&self) -> Result<Vec<String>, String> {
        let (tx, rx) = oneshot::channel();
        self.sender
            .send(DBCommand::GetTargetUsers { reply_to: tx })
            .await
            .map_err(|_| "Failed to send command".to_string())?;

        rx.await
            .map_err(|_| "Failed to receive response".to_string())?
    }

    pub async fn add_target_user(&self, user_id: String, description: Option<String>) -> Result<(), String> {
        let (tx, rx) = oneshot::channel();
        self.sender
            .send(DBCommand::AddTargetUser {
                user_id,
                description,
                reply_to: tx,
            })
            .await
            .map_err(|_| "Failed to send command".to_string())?;

        rx.await
            .map_err(|_| "Failed to receive response".to_string())?
    }

    pub async fn remove_target_user(&self, user_id: String) -> Result<(), String> {
        let (tx, rx) = oneshot::channel();
        self.sender
            .send(DBCommand::RemoveTargetUser {
                user_id,
                reply_to: tx,
            })
            .await
            .map_err(|_| "Failed to send command".to_string())?;

        rx.await
            .map_err(|_| "Failed to receive response".to_string())?
    }
}
