# API 명세 (프론트엔드 참고용)

백엔드(FastAPI) API 명세 중 프론트엔드에 필요한 부분이다.
백엔드는 별도 팀이 개발하며, 이 문서는 API 함수, Query hook, 화면 흐름, 폼 검증, 에러 처리를 만들 때 참고 기준으로 사용한다.
프론트 기술 스택과 폴더 구조, 컨벤션은 [AGENTS.md](AGENTS.md)를 따른다.

## 0. 서비스 한 줄 요약

**생각법정**: 사용자가 괴로운 생각을 "사건"으로 접수하면 AI(검사·변호인·판사 역할)가 근거를 정리하고 질문한다.
사용자는 그 과정을 거쳐 자신이 받아들일 수 있는 문장으로 사건을 마무리한다.

- 흐름: **사건 접수 → 기소·증거 확인 → 변론 → 판결·최종 확정 → 사건파일 보관함**
- 추가 기능: 판결 이후 작은 행동, 비슷한 사건 게시판, 공유용 사건 카드(PNG)

## 1. 공통

- Base URL: `https://<render-service>.onrender.com/api/v1` → `import.meta.env.VITE_API_BASE_URL`
- `/health`, `/health/live`를 제외한 모든 경로 앞에 `/api/v1`이 붙는다.
- JSON과 HTTPS를 사용한다.
- ID는 UUID다. 사건번호(`case_number`, 예: `2026-000031`)는 화면 표시용이다.
- 시간은 UTC ISO 8601로 오며, 화면에는 사용자 시간대(Asia/Seoul)로 표시한다.
- **[전시용] 로그인이 없다.**
  - 앱을 처음 실행할 때 `crypto.randomUUID()`로 **체험 ID(UUID v4)**를 만들어 기기(localStorage)에 저장한다.
  - 모든 `/api/v1` 요청에 `X-Demo-Id: <체험ID>` 헤더를 붙인다. `apiClient` request interceptor에서 처리한다.
  - "새 방문자 시작" 시 체험 ID를 새로 만들고, 이전 임시 입력과 Query 캐시를 비운다.
  - 체험 ID를 URL에 넣거나 화면에 노출하지 않는다.

## 2. 사건 상태 흐름 (화면 라우팅 기준)

```text
received → evidence_review → defense → decision_review → closed
               (진행 중 언제든) → support_required (지원 안내 화면)
```

| status             | 보여줄 화면                         | 다음으로 가는 API                              |
| ------------------ | ----------------------------------- | ---------------------------------------------- |
| `received`         | 기소 준비/로딩                      | `POST /cases/{id}/prosecution`                 |
| `evidence_review`  | 증거 확인·수정                      | `PUT /cases/{id}/evidence`                     |
| `defense`          | 변론 질문                           | `POST .../defense/questions`, `PUT .../answer` |
| `decision_review`  | 판결 초안 검토                      | `PUT /cases/{id}/decision/final`               |
| `closed`           | 사건파일 상세 (작은 행동·게시·카드) | —                                              |
| `support_required` | 지원 안내 화면 (법정 흐름 중단)     | —                                              |

- **휴정·이어하기**: 서버가 상태를 유지한다. 다시 열면 `GET /cases/{id}`의 `status`, `version`, 미응답 질문을 기준으로 화면을 복원한다.
- **임시 저장**: 제출하지 않은 입력은 사용자가 선택했을 때만 기기에 저장한다. 같은 체험 ID와 같은 입력 단계(접수 후에는 사건 ID까지)에서만 복원한다. 사건 삭제, 입력 제출, 체험 초기화 시 지운다.

## 3. 엔드포인트 목록

| 메서드·경로                                         | 요청                                                            | 응답                                                                        |
| --------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `POST /cases`                                       | `{ thought, emotion? }` + 헤더 `Idempotency-Key`                | `201` 사건 생성 / `200` 지원 안내                                           |
| `POST /cases/{id}/prosecution`                      | —                                                               | `200` `title, claim, pattern_candidates, evidence` (재시도 시 저장된 초안)  |
| `PUT /cases/{id}/evidence`                          | `{ claim, pattern_tags[], evidence[{type,text}] }`              | `200` → status `defense`                                                    |
| `POST /cases/{id}/defense/questions`                | —                                                               | `201` 새 질문 / `200` 기존 미응답 질문 `{ id, sequence, prompt, revision }` |
| `PUT /cases/{id}/defense/questions/{qid}/answer`    | `{ action: "answer" \| "skip" \| "not_sure", text?, revision }` | `200`                                                                       |
| `POST /cases/{id}/defense/questions/{qid}/simplify` | `{ revision }`                                                  | `200` 새 `prompt` + 증가한 `revision`                                       |
| `POST /cases/{id}/decision`                         | —                                                               | `200` 판결 초안 → status `decision_review`                                  |
| `POST /cases/{id}/decision/rephrase`                | `{ style: "neutral" \| "shorter" \| "gentler", version }`       | `200` 새 제안 문장 + 새 `version`                                           |
| `PUT /cases/{id}/decision/final`                    | `{ decision_type, final_statement?, emotion_after? }`           | `200` 종결된 사건                                                           |
| `PUT /cases/{id}/follow-up`                         | `{ choice: "action" \| "rest", action_text? }`                  | `200`                                                                       |
| `GET /cases`                                        | `?status&pattern&limit&cursor`                                  | `200` `{ items, next_cursor }`                                              |
| `GET /cases/{id}`                                   | —                                                               | `200` 사건·근거·질문·판결·작은 행동 전체                                    |
| `GET /cases/stats`                                  | `?from=YYYY-MM-DD&to=YYYY-MM-DD&timezone=Asia/Seoul`            | `200` `{ closed_count, pattern_counts, emotion_change }`                    |
| `DELETE /cases/{id}`                                | —                                                               | `204`                                                                       |
| `POST /cases/{id}/posts`                            | `{ visibility, title, body, tags?, password? }`                 | `201` 글 ID + 검토 상태                                                     |
| `GET /board/posts`                                  | `?tag&q&limit&cursor`                                           | `200` 공개·게시된 글 목록                                                   |
| `GET /board/posts/mine`                             | `?limit&cursor`                                                 | `200` 내 글 ID·제목·공개범위·검토상태                                       |
| `GET /board/posts/{pid}`                            | —                                                               | `200` 글 본문                                                               |
| `POST /board/posts/{pid}/unlock`                    | `{ password }`                                                  | `200` 본문 / `404`                                                          |
| `POST /board/posts/{pid}/reports`                   | `{ reason }`                                                    | `201` / 기존 신고면 `200`                                                   |
| `DELETE /board/posts/{pid}`                         | —                                                               | `204`                                                                       |
| `GET /health`, `GET /health/live`                   | —                                                               | 서버·DB 상태 (`/api/v1` 없음, 헤더 불필요)                                  |

### 응답 예시

사건 접수 `201`

```json
{
  "outcome": "case_created",
  "case": {
    "id": "uuid",
    "case_number": "2026-000031",
    "status": "received",
    "created_at": "2026-11-04T12:00:00Z"
  }
}
```

판결 초안

```json
{
  "status": "decision_review",
  "decision": {
    "type": "deferred",
    "reported_facts": ["..."],
    "unsupported_claims": ["..."],
    "suggested_statement": "...",
    "next_action": null
  }
}
```

지원 안내 (HTTP 200)

```json
{
  "outcome": "support_required",
  "support": { "message": "...", "contacts": ["자살예방상담전화 109"] }
}
```

에러

```json
{ "error": { "code": "INVALID_CASE_STATE", "message": "...", "request_id": "req_01" } }
```

## 4. Enum 상수 (`src/constants/`에 정의)

| 구분                 | 값                                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 감정 `type`          | `anxiety` 불안, `sadness` 슬픔, `anger` 분노, `shame` 수치심, `guilt` 죄책감, `other` 기타                                                                          |
| 감정 `intensity`     | 0~100 정수. **type과 intensity는 둘 다 입력하거나 둘 다 생략한다.**                                                                                                 |
| 사고 패턴 (0개 이상) | `all_or_nothing` 흑백논리, `overgeneralization` 과잉일반화, `mind_reading` 독심술, `catastrophizing` 파국화, `labeling` 낙인찍기, `discounting_positives` 긍정 격하 |
| 근거 유형            | `observed` 직접 경험, `reported` 전해 들음, `interpretation` 추측·해석, `unknown` 미확인                                                                            |
| 변론 action          | `answer` 답변, `not_sure` "떠오르지 않아요", `skip` "건너뛰기"                                                                                                      |
| 판결 유형            | `reframed` 생각 재구성, `deferred` 판단 보류, `action_needed` 대응 필요                                                                                             |
| 재표현 style         | `neutral`, `shorter`, `gentler`                                                                                                                                     |
| 작은 행동 choice     | `action`, `rest` ("오늘은 쉬기")                                                                                                                                    |
| 게시글 visibility    | `public`, `password_protected`                                                                                                                                      |
| 게시글 status        | `pending_review`, `published`, `hidden`                                                                                                                             |
| 신고 reason          | `personal_information`, `harmful_content`, `other`                                                                                                                  |

## 5. 프론트 입력 검증 규칙 (앞뒤 공백 제거 후 기준)

| 필드                                | 제한                                                |
| ----------------------------------- | --------------------------------------------------- |
| 생각(thought)·주장(claim)·근거 text | 1~2,000자                                           |
| 사건명                              | 1~120자                                             |
| 근거 개수                           | 사건당 최대 20개                                    |
| 변론 답변·최종 진술문               | 1~1,000자                                           |
| 작은 행동 `action_text`             | 1~500자 (`choice=action`일 때만 필수)               |
| 게시글 제목 / 본문                  | 1~120자 / 1~2,000자                                 |
| 태그                                | 최대 5개, 개당 1~24자                               |
| 검색어 `q`                          | 1~100자                                             |
| 게시글 비밀번호                     | 8~64자, `password_protected`일 때만 필수            |
| 목록 `limit`                        | 기본 20, 최대 50 (cursor 기반 → `useInfiniteQuery`) |

- `final_statement`는 `decision_type=deferred`일 때만 생략할 수 있다.
- 변론 `text`는 `action=answer`일 때만 보낸다.

## 6. 프론트가 꼭 지켜야 할 동작

1. **Idempotency-Key**: 사건 접수 화면에 들어올 때 UUID를 한 번 만들고, 같은 제출을 재시도할 때는 같은 키를 재사용한다. 성공하거나 입력이 바뀌면 새 키를 만든다.
2. **응답 분기**: `POST /cases`처럼 자유 입력을 보내는 요청은 HTTP 200이어도 `outcome === "support_required"`인지 먼저 확인한다. 맞으면 법정 흐름을 멈추고 지원 안내 화면으로 이동한다.
   - 최초 접수에서 전환되면 사건이 만들어지지 않는다.
   - 종결 후(작은 행동·게시글)에서 전환되면 그 요청만 중단되고 사건 기록은 남는다.
3. **변론 규칙**
   - 질문은 사건당 최대 3개이고 한 번에 하나씩 나온다. 미응답 질문이 있으면 질문 생성 API가 그 질문을 다시 준다.
   - "질문을 쉽게 바꿔주세요"는 순번이 아니라 `revision`만 올린다(질문당 최대 2회). 답변할 때는 **최신 `revision`**을 보내야 하며, 오래된 값이면 `409`가 온다.
   - 질문을 1개 이상 처리했고 미응답 질문이 없으면 "판결 받기" 버튼을 활성화한다.
4. **판결 재표현**은 `version`을 함께 보낸다(충돌 시 `409`). 사용자는 제안 문장을 그대로 고르거나 직접 수정해서 확정한다.
5. **감정 변화 비교**: 접수와 종결에 같은 감정 type을 기록했을 때만 강도 비교를 보여준다.
6. **게시판**
   - 게시 직전에 실제로 공개될 제목·본문·태그 미리보기를 보여주고, 사용자가 이름·회사명 같은 식별 정보를 지울 수 있게 한다.
   - 제출한 글은 `pending_review`로 시작해 운영자가 승인하면 `published`가 된다. "내 게시글"에서 검토 상태를 보여준다.
   - 비밀번호 보호 글은 목록에 나오지 않는다. 공유 링크(글 ID 포함) → 비밀번호 입력 → `unlock` 순서로 연다. **비밀번호를 URL·캐시·전역 상태에 저장하지 않는다.** `404`면 "글을 찾을 수 없거나 비밀번호가 틀렸어요"처럼 하나의 문구로 처리한다.
7. **사건 카드(PNG)**: API가 없고 클라이언트에서만 만든다.
   - 사건 상세의 문장 중 사용자가 고른 것과 직접 쓴 메시지로 카드를 구성한다.
   - 사건번호·원문·근거·감정 수치는 기본으로 넣지 않는다.
   - 미리보기 → PNG 저장 / Web Share API(`navigator.share`) 순서로 진행한다.
   - PNG 생성 라이브러리가 필요하면 추가하기 전에 먼저 제안하고 확인을 받는다.
8. **삭제**: 사건을 삭제하면 그 사건의 게시글도 함께 삭제된다. 관련 Query 캐시(사건 목록, 통계, 내 게시글, 게시판)를 invalidate한다.

## 7. HTTP 에러 → 화면 처리

| 상태  | 의미                                                   | 프론트 처리                                             |
| ----- | ------------------------------------------------------ | ------------------------------------------------------- |
| `404` | 없음 또는 내 체험 ID 소유가 아님                       | "찾을 수 없음" 화면/토스트                              |
| `409` | 단계 불일치, 버전·revision 충돌, Idempotency 키 불일치 | `GET /cases/{id}` 다시 조회 → 현재 status 화면으로 이동 |
| `422` | 입력 형식·길이 위반, 체험 ID 누락                      | 필드 에러 표시 (프론트 검증으로 사전 차단)              |
| `429` | 요청·비밀번호 시도 횟수 초과                           | "잠시 후 다시 시도" 안내                                |
| `502` | AI 응답 형식 오류                                      | 입력 유지 + 재시도 버튼                                 |
| `503` | AI·DB 일시 장애                                        | 입력 유지 + 재시도 버튼                                 |

- 네트워크 오류가 나도 **작성 중인 입력은 절대 지우지 않는다.**
- 에러의 `message`를 화면에 표시할 수 있고, 문의용으로 `request_id`를 콘솔에 남긴다.
- Mutation은 자동 재시도하지 않는다(사용자가 직접 재시도). AI 생성 API(prosecution, decision)는 재시도해도 서버가 저장된 결과를 돌려주므로 안전하다.

## 8. 참고: 회원 버전(제출용)과의 차이

나중에 회원 버전으로 바뀔 수 있으니 **헤더 주입은 `apiClient` interceptor 한 곳에서만** 처리해 쉽게 교체할 수 있게 둔다.

| 항목                | 전시용(현재)          | 회원 버전                                                     |
| ------------------- | --------------------- | ------------------------------------------------------------- |
| 식별                | `X-Demo-Id` 헤더      | Supabase Auth 로그인 → `Authorization: Bearer <access_token>` |
| 추가 에러           | —                     | `401` → 로그인 화면 / 토큰 갱신                               |
| 추가 API            | —                     | `GET /me`, `PATCH /admin/board/posts/{pid}/status`(운영자)    |
| 게시판 열람         | 전시 앱 방문자 누구나 | 로그인 회원만                                                 |
| 임시 저장 삭제 시점 | 체험 초기화           | 로그아웃                                                      |
| 프론트 env          | `VITE_API_BASE_URL`   | + `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`        |

## 9. 이 명세로 작업할 때 기준

- API 함수는 `features/{domain}/api/`에 둔다. 도메인 예: `case`, `prosecution`, `defense`, `decision`, `archive`, `board`, `card`
- Query key는 도메인별 factory로 관리한다. 예: `caseKeys.detail(id)`, `boardKeys.list({ tag, q })`
- 서버 데이터는 TanStack Query에 두고, Zustand에는 체험 ID, 모달, 게시판 필터 같은 UI 상태만 둔다.
- 명세에 없는 필드나 동작은 추측해서 만들지 말고 `// TODO(API 확인 필요)` 주석을 남긴 뒤 팀에 확인한다.

## 10. 미확정 사항 (백엔드 확인 필요)

명세에 아직 없는 내용이다. 구현할 때 이 부분은 `// TODO(API 확인 필요)`로 표시한다.

- `emotion`, `emotion_after`의 요청 형태 (`{ type, intensity }` 객체로 추정)
- `GET /cases/{id}`, `GET /cases` 목록 item, `GET /cases/stats`의 `emotion_change` 응답 필드 구조
- 판결 `version`과 질문 `revision`의 초깃값을 받는 응답
- `PUT /cases/{id}/evidence`가 근거 전체를 교체하는지, 사건명(1~120자)을 수정하는 필드
