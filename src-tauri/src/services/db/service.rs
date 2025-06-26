use std::path::Path;

use tokio::sync::mpsc;

use crate::services::db::{actor::DBActor, commands::DBCommand};

#[derive(Clone)]
pub struct DBService {
    sender: mpsc::Sender<DBCommand>,
}

impl DBService {
    pub fn new(db_path: &Path) -> Self {
        let (sender, receiver) = mpsc::channel(128);
        let path = db_path.to_path_buf();

        // 전용 동기 스레드에서 Actor를 실행합니다.
        std::thread::spawn(move || {
            let mut actor = DBActor::new(path, receiver).expect("Failed to create DBActor");
            actor.run();
        });

        // 초기화 명령을 보냅니다.
        let _ = sender
            .blocking_send(DBCommand::Initialize)
            .map_err(|_| eprintln!("Initialization error!"));

        Self { sender }
    }
}
