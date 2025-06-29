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
-- Table: users
-- 역할: 채팅 및 이벤트를 발생시킨 사용자의 정보를 저장합니다.
--       채팅 로그에서 사용자 이름 중복을 방지합니다.
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id         TEXT PRIMARY KEY NOT NULL,
    username        TEXT NOT NULL,
    last_seen       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------------------
-- Table: broadcast_sessions
-- 역할: 개별 방송 세션을 식별하고 관리합니다.
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS broadcast_sessions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id      TEXT NOT NULL,
    title           TEXT NOT NULL,
    started_at      DATETIME NOT NULL,
    ended_at        DATETIME, -- 방송 종료 시 기록
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
    message_type    TEXT NOT NULL, -- 'TEXT', 'EMOTICON', 'STICKER'
    message         TEXT NOT NULL, -- 타입에 따른 본문 (텍스트, 이모티콘 ID 등)
    metadata        TEXT,          -- 추가 정보 (JSON)
    timestamp       DATETIME NOT NULL,
    FOREIGN KEY(broadcast_id) REFERENCES broadcast_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

--------------------------------------------------------------------
-- Table: event_logs
-- 역할: 후원, 구독 등 채팅 외의 모든 이벤트를 기록합니다.
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    broadcast_id    INTEGER NOT NULL,
    user_id         TEXT,          -- 이벤트 주체 (NULL 가능)
    event_type      TEXT NOT NULL, -- 'DONATION', 'SUBSCRIBE' 등
    payload         TEXT NOT NULL, -- 이벤트 고유 데이터 (JSON)
    timestamp       DATETIME NOT NULL,
    FOREIGN KEY(broadcast_id) REFERENCES broadcast_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

--------------------------------------------------------------------
-- Table: reports
-- 역할: 생성된 분석 리포트를 캐싱하여 재계산 비용을 절약합니다.
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    broadcast_id    INTEGER NOT NULL UNIQUE,
    report_data     TEXT NOT NULL, -- 리포트 결과 (JSON)
    version         INTEGER NOT NULL, -- 리포트 구조 버전
    generated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(broadcast_id) REFERENCES broadcast_sessions(id) ON DELETE CASCADE
);

--------------------------------------------------------------------
-- Virtual Table: chat_logs_fts
-- 역할: 채팅 메시지의 빠른 전문 검색(Full-Text Search)을 위한
--       FTS5 가상 테이블입니다.
--------------------------------------------------------------------
CREATE VIRTUAL TABLE IF NOT EXISTS chat_logs_fts USING fts5(
    -- 의미 기반 검색을 위한 컬럼 (일반 텍스트)
    message_morph,
    -- 자모 분리 및 초성 검색을 위한 컬럼
    message_jamo,
    -- 원본 chat_logs 테이블의 ID (조인용, 인덱싱 제외)
    chat_log_id UNINDEXED,
    -- FTS5 기본 토크나이저. 한국어 처리를 위해 추후 커스텀 토크나이저 연동 필요
    tokenize = 'unicode61 remove_diacritics 2'
);