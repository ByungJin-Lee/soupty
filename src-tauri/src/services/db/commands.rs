#[derive(Debug)]
pub enum DBCommand {
    Initialize, // 마이그레이션 등 초기화 작업을 위한 커맨드
                // 예시: GetCachedReport { date: String, reply_to: oneshot::Sender<Option<(String, i32)>> },
}
