-- 데이터 무결성을 위해 외래 키 제약 조건을 활성화합니다. (필수)
PRAGMA foreign_keys = ON;

--------------------------------------------------------------------
-- Table: channels
-- 역할: 방송 채널의 고유 정보를 저장합니다.
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS channels (
    channel_id      TEXT PRIMARY KEY NOT NULL,
    channel_name    TEXT NOT NULL,
    last_updated    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


--------------------------------------------------------------------
-- Table: target_users
-- 역할: other-event-store로 전달할 대상 사용자들을 관리합니다.
--       특정 사용자의 채팅 이벤트를 별도로 추적하기 위한 설정 테이블입니다.
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS target_users (
    user_id         TEXT PRIMARY KEY NOT NULL,
    added_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description     TEXT -- 추가된 이유나 설명 (선택사항)
);

--------------------------------------------------------------------
-- Table: broadcast_sessions
-- 역할: 개별 방송 세션을 식별하고 관리합니다.
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS broadcast_sessions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id      TEXT NOT NULL,
    vod_id          INTEGER NOT NULL Default 0, -- vod와 연결합니다.
    title           TEXT NOT NULL,
    started_at      DATETIME NOT NULL,
    ended_at        DATETIME, -- 방송 종료 시 기록
    UNIQUE(channel_id, started_at), -- 중복 세션 방지
    FOREIGN KEY(channel_id) REFERENCES channels(channel_id) ON DELETE CASCADE
);

--------------------------------------------------------------------
-- Table: chat_logs
-- 역할: 모든 채팅 기록을 저장하는 가장 핵심적인 테이블입니다.
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    broadcast_id    INTEGER NOT NULL,
    user_id         TEXT NOT NULL,
    username        TEXT NOT NULL,
    user_flag       INTEGER UNSIGNED, -- 사용자 플래그(BJ: 1<<0, SUB_TIER_1: 1<<1, SUB_TIER_2: 1<<2)
    message_type    TEXT NOT NULL, -- 'TEXT', 'EMOTICON', 'STICKER'
    message         TEXT NOT NULL, -- 타입에 따른 본문 (텍스트, 이모티콘 ID 등)
    metadata        TEXT,          -- 추가 정보 (JSON)
    timestamp       DATETIME NOT NULL,
    FOREIGN KEY(broadcast_id) REFERENCES broadcast_sessions(id) ON DELETE CASCADE
);

--------------------------------------------------------------------
-- Table: event_logs
-- 역할: 후원, 구독 등 채팅 외의 모든 이벤트를 기록합니다.
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    broadcast_id    INTEGER NOT NULL,
    user_id         TEXT,          -- 이벤트 주체 (NULL 가능)
    username        TEXT,          -- 이벤트 주체 (NULL 가능)
    user_flag       INTEGER UNSIGNED, -- 사용자 플래그(BJ: 1<<0, SUB_TIER_1: 1<<1, SUB_TIER_2: 1<<2)
    event_type      TEXT NOT NULL, -- 'DONATION', 'SUBSCRIBE' 등
    payload         TEXT NOT NULL, -- 이벤트 고유 데이터 (JSON)
    timestamp       DATETIME NOT NULL,
    FOREIGN KEY(broadcast_id) REFERENCES broadcast_sessions(id) ON DELETE CASCADE
);

--------------------------------------------------------------------
-- Table: reports
-- 역할: 생성된 분석 리포트를 캐싱하여 재계산 비용을 절약합니다.
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    broadcast_id        INTEGER PRIMARY KEY,
    status              TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, GENERATING, COMPLETED, FAILED
    report_data         TEXT, -- 리포트 결과 (JSON)
    version             INTEGER NOT NULL DEFAULT 1, -- 리포트 구조 버전
    error_message       TEXT, -- 에러 메시지 (실패시)
    progress_percentage REAL, -- 진행률 (0.0 ~ 100.0)
    FOREIGN KEY(broadcast_id) REFERENCES broadcast_sessions(id) ON DELETE CASCADE
);

--------------------------------------------------------------------
-- Virtual Table: chat_logs_fts
-- 역할: 채팅 메시지의 빠른 전문 검색(Full-Text Search)을 위한
--       FTS5 가상 테이블입니다.
--------------------------------------------------------------------
CREATE VIRTUAL TABLE IF NOT EXISTS chat_logs_fts USING fts5(
    -- 자모 분리 및 초성 검색을 위한 컬럼 (한국어 검색 최적화)
    message_jamo,
    -- 원본 chat_logs 테이블의 ID (조인용, 인덱싱 제외)
    chat_log_id UNINDEXED,
    -- FTS5 기본 토크나이저. 한국어 처리를 위해 추후 커스텀 토크나이저 연동 필요
    tokenize = 'unicode61 remove_diacritics 2'
);