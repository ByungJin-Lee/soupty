/// 후원 이벤트와 채팅 메시지 간 상관관계 분석을 위한 시간 윈도우 (밀리초)
pub const DONATION_CHAT_CORRELATION_WINDOW_MS: i64 = 500;

/// 만료된 후원 이벤트를 확인하는 타이머 간격 (밀리초)
pub const DONATION_FLUSH_INTERVAL_MS: u64 = 50;
