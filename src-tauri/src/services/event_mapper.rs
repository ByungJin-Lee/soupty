use soup_sdk::chat::Event as SdkEvent;

use crate::models::events::{ChatEvent, DomainEvent}; // SDK 이벤트를 별칭으로 가져옴

/// SDK 이벤트를 우리 시스템의 도메인 이벤트로 변환합니다.
/// 우리 시스템이 관심 없는 이벤트는 None을 반환하여 필터링할 수 있습니다.
pub fn map_sdk_to_domain(sdk_event: &SdkEvent) -> Option<DomainEvent> {
    match sdk_event {
        SdkEvent::Chat(sdk_chat) => {
            // SDK의 복잡한 구조에서 우리에게 필요한 데이터만 추출하고 정제합니다.
            Some(DomainEvent::Chat(ChatEvent {
                timestamp: sdk_chat.meta.received_time,
                comment: sdk_chat.comment.clone(),
                chat_type: sdk_chat.chat_type.clone(),
                user: sdk_chat.user.clone(),
                is_admin: sdk_chat.is_admin,
                ogq: sdk_chat.emoticon.clone(),
            }))
        }
        // ... 다른 이벤트 매핑 ...
        _ => None, // 기본적으로 처리하지 않는 이벤트는 무시
    }
}
