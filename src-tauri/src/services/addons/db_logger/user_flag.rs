use soup_sdk::chat::types::{User, UserStatus, UserSubscribe};

/// 사용자 플래그를 비트 연산으로 관리하기 위한 상수들
pub struct UserFlags;

impl UserFlags {
    /// BJ 플래그 (비트 0)
    pub const BJ: u32 = 1 << 0;
    
    /// 매니저 플래그 (비트 1)
    pub const MANAGER: u32 = 1 << 1;
    
    /// 탑팬 플래그 (비트 2)
    pub const TOP_FAN: u32 = 1 << 2;
    
    /// 팬 플래그 (비트 3)
    pub const FAN: u32 = 1 << 3;
    
    /// 서포터 플래그 (비트 4)
    pub const SUPPORTER: u32 = 1 << 4;
    
    /// 구독 티어 1 플래그 (비트 5)
    pub const SUB_TIER_1: u32 = 1 << 5;
    
    /// 구독 티어 2 플래그 (비트 6)
    pub const SUB_TIER_2: u32 = 1 << 6;
}

/// User 구조체로부터 user_flag를 생성하는 함수
pub fn create_user_flag(user: &User) -> u32 {
    let mut flag = 0u32;
    
    // UserStatus 기반 플래그 설정
    if user.status.is_bj {
        flag |= UserFlags::BJ;
    }
    
    if user.status.is_manager {
        flag |= UserFlags::MANAGER;
    }
    
    if user.status.is_top_fan {
        flag |= UserFlags::TOP_FAN;
    }
    
    if user.status.is_fan {
        flag |= UserFlags::FAN;
    }
    
    if user.status.is_supporter {
        flag |= UserFlags::SUPPORTER;
    }
    
    // 구독 티어 설정 (follow 필드와 subscribe 정보 모두 사용)
    // UserStatus의 follow 필드를 우선 사용
    let subscribe_tier = if user.status.follow > 0 {
        user.status.follow as u32
    } else if let Some(ref subscribe) = user.subscribe {
        // follow가 0이면 subscribe 정보 사용
        subscribe.current
    } else {
        0
    };
    
    match subscribe_tier {
        1 => flag |= UserFlags::SUB_TIER_1,
        2 => flag |= UserFlags::SUB_TIER_2,
        _ => {} // 0이거나 다른 값일 경우 구독 플래그 없음
    }
    
    flag
}

/// UserStatus와 UserSubscribe로부터 user_flag를 생성하는 함수
pub fn create_user_flag_from_status(status: &UserStatus, subscribe: Option<&UserSubscribe>) -> u32 {
    let mut flag = 0u32;
    
    // UserStatus 기반 플래그 설정
    if status.is_bj {
        flag |= UserFlags::BJ;
    }
    
    if status.is_manager {
        flag |= UserFlags::MANAGER;
    }
    
    if status.is_top_fan {
        flag |= UserFlags::TOP_FAN;
    }
    
    if status.is_fan {
        flag |= UserFlags::FAN;
    }
    
    if status.is_supporter {
        flag |= UserFlags::SUPPORTER;
    }
    
    // 구독 티어 설정 (follow 필드와 subscribe 정보 모두 사용)
    // UserStatus의 follow 필드를 우선 사용
    let subscribe_tier = if status.follow > 0 {
        status.follow as u32
    } else if let Some(sub) = subscribe {
        // follow가 0이면 subscribe 정보 사용
        sub.current
    } else {
        0
    };
    
    match subscribe_tier {
        1 => flag |= UserFlags::SUB_TIER_1,
        2 => flag |= UserFlags::SUB_TIER_2,
        _ => {} // 0이거나 다른 값일 경우 구독 플래그 없음
    }
    
    flag
}

/// user_flag로부터 UserStatus를 파싱하는 함수
pub fn parse_user_status_from_flag(flag: u32) -> UserStatus {
    UserStatus {
        follow: if flag & UserFlags::SUB_TIER_2 != 0 {
            2
        } else if flag & UserFlags::SUB_TIER_1 != 0 {
            1
        } else {
            0
        },
        is_bj: flag & UserFlags::BJ != 0,
        is_manager: flag & UserFlags::MANAGER != 0,
        is_top_fan: flag & UserFlags::TOP_FAN != 0,
        is_fan: flag & UserFlags::FAN != 0,
        is_supporter: flag & UserFlags::SUPPORTER != 0,
    }
}

/// user_flag로부터 UserSubscribe를 파싱하는 함수
pub fn parse_user_subscribe_from_flag(flag: u32) -> Option<UserSubscribe> {
    let current = if flag & UserFlags::SUB_TIER_2 != 0 {
        2
    } else if flag & UserFlags::SUB_TIER_1 != 0 {
        1
    } else {
        0
    };
    
    if current > 0 {
        Some(UserSubscribe {
            acc: 0, // 누적 정보는 플래그에서 복원할 수 없으므로 0으로 설정
            current,
        })
    } else {
        None
    }
}

/// user_flag로부터 User 구조체를 복원하는 함수 (id, label은 별도로 제공)
pub fn parse_user_from_flag(flag: u32, id: String, label: String) -> User {
    User {
        id,
        label,
        status: parse_user_status_from_flag(flag),
        subscribe: parse_user_subscribe_from_flag(flag),
    }
}

/// user_flag를 사람이 읽을 수 있는 문자열로 변환하는 함수
pub fn flag_to_string(flag: u32) -> String {
    let mut parts = Vec::new();
    
    if flag & UserFlags::BJ != 0 {
        parts.push("BJ");
    }
    
    if flag & UserFlags::MANAGER != 0 {
        parts.push("MANAGER");
    }
    
    if flag & UserFlags::TOP_FAN != 0 {
        parts.push("TOP_FAN");
    }
    
    if flag & UserFlags::FAN != 0 {
        parts.push("FAN");
    }
    
    if flag & UserFlags::SUPPORTER != 0 {
        parts.push("SUPPORTER");
    }
    
    if flag & UserFlags::SUB_TIER_2 != 0 {
        parts.push("SUB_TIER_2");
    } else if flag & UserFlags::SUB_TIER_1 != 0 {
        parts.push("SUB_TIER_1");
    }
    
    if parts.is_empty() {
        "NONE".to_string()
    } else {
        parts.join(" | ")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_create_user_flag() {
        let user = User {
            id: "test_id".to_string(),
            label: "test_label".to_string(),
            status: UserStatus {
                follow: 1,
                is_bj: true,
                is_manager: false,
                is_top_fan: true,
                is_fan: false,
                is_supporter: false,
            },
            subscribe: Some(UserSubscribe {
                acc: 10,
                current: 2,
            }),
        };
        
        let flag = create_user_flag(&user);
        
        // BJ, TOP_FAN, SUB_TIER_2 플래그가 설정되어야 함
        // (follow=1, subscribe.current=2이므로 subscribe.current=2가 우선)
        assert_eq!(flag & UserFlags::BJ, UserFlags::BJ);
        assert_eq!(flag & UserFlags::TOP_FAN, UserFlags::TOP_FAN);
        assert_eq!(flag & UserFlags::SUB_TIER_2, UserFlags::SUB_TIER_2);
        
        // 설정되지 않은 플래그들은 0이어야 함
        assert_eq!(flag & UserFlags::MANAGER, 0);
        assert_eq!(flag & UserFlags::FAN, 0);
        assert_eq!(flag & UserFlags::SUPPORTER, 0);
        assert_eq!(flag & UserFlags::SUB_TIER_1, 0);
    }
    
    #[test]
    fn test_parse_user_status_from_flag() {
        let flag = UserFlags::BJ | UserFlags::TOP_FAN | UserFlags::SUB_TIER_1;
        let status = parse_user_status_from_flag(flag);
        
        assert_eq!(status.follow, 1);
        assert_eq!(status.is_bj, true);
        assert_eq!(status.is_manager, false);
        assert_eq!(status.is_top_fan, true);
        assert_eq!(status.is_fan, false);
        assert_eq!(status.is_supporter, false);
    }
    
    #[test]
    fn test_parse_user_subscribe_from_flag() {
        let flag = UserFlags::SUB_TIER_2;
        let subscribe = parse_user_subscribe_from_flag(flag);
        
        assert!(subscribe.is_some());
        let sub = subscribe.unwrap();
        assert_eq!(sub.current, 2);
        assert_eq!(sub.acc, 0); // 누적 정보는 복원할 수 없음
    }
    
    #[test]
    fn test_flag_to_string() {
        let flag = UserFlags::BJ | UserFlags::SUB_TIER_1 | UserFlags::TOP_FAN;
        let result = flag_to_string(flag);
        
        assert!(result.contains("BJ"));
        assert!(result.contains("SUB_TIER_1"));
        assert!(result.contains("TOP_FAN"));
    }
}