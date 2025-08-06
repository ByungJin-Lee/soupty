# history user page 작업 지시서

page: app/(webview)/history/user/page.tsx

사용자의 기록을 보는 용도(userId, channelId가 주어짐)
해당 채널에서 사용자가 발생시킨 기록을 확인

아래와 같이 동작한다.

# 구현 방식

전체적으로 무한스크롤 형태로 동작함. (단 역방향이다).

위로 스크롤할 때, 위가 확장되는 형태

| 화면 적층 구조                              |
| ------------------------------------------- |
| 위로 스크롤 시, 더 이전 기록 추가           |
| 더 이전(past-block) (2025.07.04)            |
| 이전(past-block) (2025.07.05)               |
| 최신(live-block) (2025.07.06 + 최신 데이터) |

각각 기록은 block으로 이루어짐. (features/history-user)

services/ipc/chat-history.ts의 searchUserLogs를 이용해서 구현
