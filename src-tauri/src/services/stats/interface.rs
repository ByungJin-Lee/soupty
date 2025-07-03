use chrono::{DateTime, Utc};
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatPerMinuteData {
    pub timestamp: DateTime<Utc>,
    pub count: u32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LOLData {
    pub timestamp: DateTime<Utc>,
    pub count: u32,
}

// 전처리 과정을 거친 이벤트입니다.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", content = "payload")]
pub enum StatsMatrix {
    ChatPerMinute(ChatPerMinuteData),
    LOL(LOLData),
    ActiveViewer(ActiveViewerData),
}

// 전처리 과정을 거친 이벤트입니다.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActiveViewerData {
    pub timestamp: DateTime<Utc>,
    /**
     * 합산한 결과입니다. 전체 활성 유저를 의미합니다.
     */
    pub total: u32,
    /**
     * 활성 유저 중, 구독자 수를 말합니다.(만약 구독과 팬이 경합하는 경우, 구독으로 포함됩니다.)
     */
    pub subscriber: u32,
    /**
     * 활성 유저 중, 팬 수(서포터 포함)를 말합니다.
     */
    pub fan: u32,
    /**
     * 어떠한 그룹에도 속하지 않는 경우입니다.
     */
    pub normal: u32,
}
