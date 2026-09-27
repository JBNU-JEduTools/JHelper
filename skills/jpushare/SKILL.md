---
name: jpushare
description: JPUShare(share.jedutools.io) 연구실 GPU 플랫폼을 사용자 대신 부르는 절차. 사용자가 "JPUShare에 작업 올려줘", "GPU 작업 결과 받아줘", "JPUShare 저장 공간에 업로드해 줘", "GPU 서버 상황 알려줘"처럼 JPUShare 작업 제출·상태·로그·결과 받기, 연구실 저장 공간 업로드·다운로드·목록, GPU 서버·대기열 조회를 부탁할 때 쓴다. 인증은 사용자가 웹에서 발급한 API 키(jpk_로 시작)를 환경 변수 JPUSHARE_API_KEY로 받아 Bearer로 붙이는 한 가지뿐이다. 저장 위치는 scope/folder 조합, 오류는 HTTP 상태와 code로 분기한다.
---

# JPUShare 에이전트 사용 절차

JPUShare는 연구실 구성원이 GPU 서버를 함께 쓰는 서비스다. 이 스킬은 에이전트가 사용자 대신 JPUShare API를 부르는 절차다.
사람이 읽는 안내는 다음 두 문서이고, 이 스킬과 어긋나면 그 문서가 맞다.

- 에이전트 연결하기: https://jhelper.jedutools.io/JPUShare/2Agent/1Connect
- API 사용법: https://jhelper.jedutools.io/JPUShare/2Agent/2API

## 0. 설치와 설정

- **설치**: 이 파일이 에이전트의 스킬 폴더에 있으면 설치된 것이다. 없으면 `npx skills add JBNU-JEduTools/JHelper --skill jpushare`로 설치한다(에이전트를 지정하려면 `-a claude-code`, `-a codex` 등).
- **키가 있는지 확인**: 환경 변수 `JPUSHARE_API_KEY`가 비어 있으면 작업을 시작하지 말고 사람에게 다음을 안내한다.
  1. JPUShare(https://share.jedutools.io)에 로그인한다.
  2. 왼쪽 위 **내 정보/설정** → **API 키 발급**에서 키 이름과 유효 기간을 정하고, 할 일에 필요한 허용 범위만 고른다(2절 표). 연결 확인(`GET /v1/me`)에는 `account:read`가 필요하다.
  3. **API 키 발급**을 누르고(작업 제출처럼 권한이 큰 범위를 고르면 **키 허용 범위 확인** 창에서 **확인 후 발급**), 한 번만 보이는 `jpk_...` 원문을 복사한다.
  4. 터미널에서 `export JPUSHARE_API_KEY='jpk_...'`를 실행한 뒤 **그 터미널에서 에이전트를 다시 시작**한다. 이미 켜져 있던 에이전트는 나중에 export한 값을 모른다.
- **에이전트는 키를 스스로 만들 수 없다.** 키 발급·목록·폐기(`/v1/api-keys`)는 웹 로그인 전용이라 키로 부르면 403 `JWT_REQUIRED`다.
- **사람이 키를 채팅에 붙여 넣은 경우**: 막지는 않는다. 다만 "붙여 넣은 키는 AI 서비스 쪽 대화 기록에 남습니다. 다음부터는 환경 변수로 넘기는 편이 안전합니다"라고 한 번 알린다. 그 키는 이 세션의 환경 변수(`export JPUSHARE_API_KEY=...`)로만 쓰고, 파일·커밋·출력에 다시 쓰지 않는다.
- **연결 확인**: 키가 있으면 먼저 `GET /v1/me`를 부른다(1절 예제).
  - 200이면 `username`, `lab`, `actions`(이 키로 할 수 있는 동작)를 사람에게 짧게 알린다.
  - 401이면 키가 만료·폐기됐거나 잘못 복사된 것이다 → 사람에게 새 키를 요청한다.
  - 403 `API_KEY_SCOPE_REQUIRED`이면 키에 `account:read`가 없다 → 그 범위를 넣어 새로 발급해 달라고 요청한다.
  - `lab`이 비어 있으면 연구실 소속이 없다 → 작업 제출은 403 `NO_LAB`이다. 참가 신청은 웹에서 하고, 승인은 책임교수 또는 연구실 관리자가 한다.

## 1. 인증 — API 키

```bash
: "${JPUSHARE_API_KEY:?JPUSHARE_API_KEY 가 비어 있습니다 — 0절대로 사람에게 키를 받는다}"   # 키는 덮어쓰지 않는다
export BASE=https://share.jedutools.io
```

모든 호출에 `Authorization: Bearer $JPUSHARE_API_KEY`를 붙인다. 경로는 모두 `/v1`로 시작한다.

<!-- doc-exec: C01 expect=200 -->

```bash
curl --fail-with-body "$BASE/v1/me" -H "Authorization: Bearer $JPUSHARE_API_KEY"
```

- 키는 발급한 사람 본인의 자격 증명이다. 허용 범위(scope)는 그 사람의 권한을 **좁힐 뿐 넓히지 않는다**. 소속·역할·소유권은 요청마다 다시 평가된다.
- 활성 키는 사람당 최대 5개, 유효 기간은 최대 90일이다. 만료·폐기·계정 비활성·연구실 역할 변경은 다음 요청부터 바로 적용된다.
- 허용 범위는 발급 뒤 바꿀 수 없다. 부족하면 사람에게 새 키 발급을 요청한다.
- 키가 노출됐으면 사람에게 웹에서 폐기하고 다시 발급하라고 알린다.

## 2. 허용 범위와 호출할 수 있는 경로

허용 범위는 12개다. 키의 허용 범위가 경로가 요구하는 범위를 포함해야 한다. 표에 없는 경로(관리자·토론·키 관리·연구실 가입·워크스페이스 등)는 웹 로그인 전용 → 403 `JWT_REQUIRED`.

| 허용 범위 | 경로 |
|---|---|
| `account:read` | `GET /v1/me`, `GET /v1/auth/me` |
| `platform:read` | `GET /v1/tiers`, `GET /v1/workers`, `GET /v1/workers/{tier}/gpu/history`, `GET /v1/workspace-profiles`, `GET /v1/platform/stats`, `GET /v1/platform/queue-snapshot` |
| `jobs:read` | `GET /v1/jobs`, `GET /v1/jobs/{id}`, `GET /v1/jobs/{id}/gpu`, `GET /v1/jobs/{id}/gpu/history`, `GET /v1/jobs/{id}/log`, `GET /v1/jobs/{id}/results`, `GET /v1/jobs/{id}/results-zip` |
| `jobs:submit` | `POST /v1/jobs` |
| `jobs:cancel` | `POST /v1/jobs/{id}/cancel` |
| `queue:read` | `GET /v1/queue` |
| `queue:reorder` | `PUT /v1/queue/reorder` |
| `storage:read` | `GET /v1/storage`, `GET /v1/storage/objects`, `GET /v1/storage/objects/{key}/url` |
| `storage:write` | `POST /v1/storage/upload-url`, `POST /v1/storage/folders`, `POST /v1/storage/copy`, `POST /v1/storage/multipart/{init,part,complete,abort}` |
| `storage:organize` | `POST /v1/storage/move`, `POST /v1/storage/rename` 등 |
| `storage:delete` | `DELETE /v1/storage/objects/{key}`, `POST /v1/storage/folders/delete` 등 |
| `lab:read` | `GET /v1/labs/me`, `GET /v1/labs/me/members`, `GET /v1/labs/me/jobs`, `GET /v1/labs/me/usage` |

인증 없이 부를 수 있는 경로는 `GET /v1/auth/config`, `GET /v1/maintenance/status`뿐이다. LLM 기능은 제공하지 않는다 — `/v1/llm/*`는 503 `LLM_DISABLED`.

## 3. 주요 절차

### 저장 위치 — scope/folder 조합

저장소 이름 대신 **`scope`와 `folder` 두 값**으로 위치를 지정한다. 조합은 네 가지뿐이고, 표 밖은 400 `INVALID_LOCATION`이다. `key`·`prefix`는 그 위치 기준 상대 경로다.

| `scope` | `folder` | 용도 |
|---|---|---|
| `shared` | `data` | 연구실 공유 데이터(작업 입력) |
| `shared` | `result` | 연구실 공유 결과 |
| `private` | `data` | 나만 보는 데이터 |
| `private` | `result` | 나만 보는 결과(작업 ID 폴더, 작업이 끝나고 30일 뒤 정리) |

```bash
curl --fail-with-body "$BASE/v1/storage" -H "Authorization: Bearer $JPUSHARE_API_KEY"   # 용량
curl --fail-with-body --get "$BASE/v1/storage/objects" \
  -H "Authorization: Bearer $JPUSHARE_API_KEY" \
  --data-urlencode 'scope=shared' --data-urlencode 'folder=data' --data-urlencode 'prefix=train/'
curl --fail-with-body --get "$BASE/v1/storage/objects/train/sample.csv/url" \
  -H "Authorization: Bearer $JPUSHARE_API_KEY" \
  --data-urlencode 'scope=shared' --data-urlencode 'folder=data'   # 임시 다운로드 주소
```

### 업로드 256 MiB 이하 (storage:write) — 주소 발급 + PUT 두 단계

`content_length`는 정확한 바이트 수다. 응답은 `{url, headers, expires_in}`.

<!-- doc-exec: C03 expect=200 -->

```bash
curl --fail-with-body "$BASE/v1/storage/upload-url" \
  -H "Authorization: Bearer $JPUSHARE_API_KEY" -H 'Content-Type: application/json' \
  -d '{"scope":"shared","folder":"data","key":"train/sample.csv","content_length":1234}' \
  -o upload.json
UPLOAD_URL=$(jq -r .url upload.json)
UPLOAD_TAGGING=$(jq -r '.headers["x-amz-tagging"]' upload.json)
```

응답 `headers`의 모든 항목(지금은 `x-amz-tagging`)을 PUT에 **빠짐없이** 붙인다.

<!-- doc-exec: C04 expect=200 -->

```bash
curl --fail-with-body -X PUT "$UPLOAD_URL" -H "x-amz-tagging: $UPLOAD_TAGGING" --data-binary @sample.csv
```

헤더를 빠뜨리면 저장소가 **403**(XML 본문, `code` 봉투 없음)으로 거절한다. `<Code>`는 보통 `SignatureDoesNotMatch`이고, 요청을 받은 저장소 노드에 따라 `AccessDenied`로도 나온다.

<!-- doc-exec: C05 expect=403 -->

```bash
curl -sS -X PUT "$UPLOAD_URL" --data-binary @sample.csv   # 잘못된 예 → 403 SignatureDoesNotMatch|AccessDenied
```

### 업로드 256 MiB 초과 — 멀티파트

`upload-url`이 400 `MUST_USE_MULTIPART`를 주면 멀티파트로 올린다(반대로 256 MiB 이하를 멀티파트로 개시하면 400 `USE_SINGLE_PUT`).

| 경로 | 요청 본문 | 응답 |
|---|---|---|
| `POST /v1/storage/multipart/init` | `{"scope","folder","key","content_length"}`(전체 바이트) | `{"upload_id","part_size"}` |
| `POST /v1/storage/multipart/part` | `{"upload_id","part_numbers":[1,…]}`(1~10000) | `{"parts":[{"part_number","url"}]}` |
| (파트 PUT) | 각 `url`에 파트 본문 PUT, 추가 헤더 없음 | 응답 헤더 `ETag`(따옴표까지 그대로 보관) |
| `POST /v1/storage/multipart/complete` | `{"upload_id","parts":[{"part_number","etag"}]}` | `{"etag"}` |
| `POST /v1/storage/multipart/abort` | `{"upload_id"}` | 빈 200 — 중간에 그만두면 반드시 부른다 |

`upload_id`가 없어졌으면(완료·중단·정리됨) 404 `UPLOAD_NOT_FOUND`다 → 개시부터 다시 한다. 서버가 다시 시작돼도 `upload_id`는 지워지지 않는다. 전체 셸 예제는 API 사용법 문서의 파일 업로드 절에 있다.

### 실행 환경 고르기 (platform:read)

`workspace_snapshot_id`는 `GET /v1/workspace-profiles` 항목의 `current_snapshot_id`다. 호환 조건: 항목의 `supported_compute_caps` 중 `GET /v1/tiers`의 `compute_capability`와 점 앞 숫자가 같고 점 뒤 숫자가 GPU 이하인 값이 있어야 한다(둘 중 하나가 `null`이면 서버가 판정하지 않는다). 어기면 400 `VALIDATION_FAILED`이고 `errors[].code`가 `WORKSPACE_GPU_INCOMPATIBLE`이다.

### 작업 제출 (jobs:submit)

`POST /v1/jobs`는 `multipart/form-data`다. 코드는 `artifact`(ZIP, 500 MiB 이하) 또는 `git_url`(+`git_ref`) 중 하나만 준다. **`args`·`channels`는 JSON 문자열**이다.

<!-- doc-exec: C07 expect=200 -->

```bash
curl --fail-with-body "$BASE/v1/jobs" \
  -H "Authorization: Bearer $JPUSHARE_API_KEY" \
  -F 'artifact=@code.zip' \
  -F 'command=python' \
  -F 'args=["main.py"]' \
  -F 'name=에이전트 제출 예제' \
  -F 'work_type=training' \
  -F 'description=jpushare 스킬 예제' \
  -F 'tier=jpu-60' \
  -F "workspace_snapshot_id=$SNAPSHOT_ID" \
  -F 'timeout_seconds=3600' \
  -F 'result_location=private' \
  -F 'channels=[{"name":"train","scope":"shared","folder":"data","prefix":"train/","size_gb":1}]' \
  -o job.json
JOB_ID=$(jq -r .job_id job.json)
```

- `description`(작업 목적, 500자 이내)은 **필수**다. 비었거나 공백뿐이면 400 `DESCRIPTION_REQUIRED` → 사람이 말한 목적을 한 줄로 적어 다시 낸다.
- `tier`(GPU 서버)는 `GET /v1/tiers`로 지금 값을 확인한다. GPU 수는 GPU 서버가 정한다(`num_gpus`는 무시). `timeout_seconds`는 60~259200.
- `result_location`: `shared` 또는 `private`. 생략하면 채널 중 `private`가 하나라도 있으면 `private`, 아니면 `shared`.
- `channels[].name`은 코드에서 `JOB_CHANNEL_<이름>` 환경 변수로 읽는다.
- 연구실 소속이 없으면 본문 검사 전에 403 `NO_LAB`.

### 상태·로그·결과 (jobs:read)

작업이 끝나기를 기다릴 때는 `GET /v1/jobs/{id}`를 5~10초 간격으로 불러 `state`를 본다.

<!-- doc-exec: C08 expect=200 -->

```bash
curl --fail-with-body "$BASE/v1/jobs/$JOB_ID" -H "Authorization: Bearer $JPUSHARE_API_KEY"
```

- 진행 중: `USER_QUEUE_WAIT`·`GLOBAL_QUEUE_WAIT`·`ESCALATION_WAIT`(대기), `ASSIGNED`, `RUNNING`, `CANCEL_REQUESTED`.
- 종료 상태(10개, 이후 바뀌지 않음): `SUCCEEDED`, `FAILED_RUNTIME`, `FAILED_ENV`, `FAILED_OOM_CONFIRMED`, `FAILED_OOM_SUSPECT`, `TIMED_OUT`, `CANCELLED`, `KILLED_BY_ADMIN`, `FAILED_SUBMISSION`, `UPLOAD_FAILED`.
- 실패로 끝났으면 `last_error_code`(예: `RUNTIME_EXIT_NONZERO`)와 `last_error_message`(콘솔의 "실패 사유" 문장)를 보고 stderr 로그를 읽는다. 성공하면 둘 다 `null`이다.

```bash
curl --fail-with-body "$BASE/v1/jobs/$JOB_ID/log?stream=stderr" -H "Authorization: Bearer $JPUSHARE_API_KEY"   # 시작 전이면 404 NO_ATTEMPT
curl --fail-with-body "$BASE/v1/jobs/$JOB_ID/log?stream=stdout&follow=1" -H "Authorization: Bearer $JPUSHARE_API_KEY"  # SSE, 한 연결 15분
curl --fail-with-body "$BASE/v1/jobs/$JOB_ID/results-zip" -H "Authorization: Bearer $JPUSHARE_API_KEY" -o results.zip   # 끝난 작업, 2 GiB까지
```

<!-- doc-exec: C10 expect=200 -->

```bash
curl --fail-with-body "$BASE/v1/jobs/$JOB_ID/results" -H "Authorization: Bearer $JPUSHARE_API_KEY"   # objects[].url = 임시 주소
```

- 프로그램이 실행된 뒤 실패한 작업도 `logs/stdout.log`·`logs/stderr.log`·`exit_code.txt`가 결과에 남는다. 준비 단계에서 실패한 작업(`FAILED_ENV` 등)은 결과가 비어 있을 수 있다 → `last_error_message`로 판단한다.
- `url`은 만료되는 임시 주소다. 필요할 때 목록을 다시 받는다.

### 취소 (jobs:cancel)

사람이 취소를 확인한 뒤에만 부른다.

```bash
curl --fail-with-body -X POST "$BASE/v1/jobs/$JOB_ID/cancel" -H "Authorization: Bearer $JPUSHARE_API_KEY"
```

### 현황 조회

```bash
curl --fail-with-body "$BASE/v1/tiers" -H "Authorization: Bearer $JPUSHARE_API_KEY"
curl --fail-with-body "$BASE/v1/workers" -H "Authorization: Bearer $JPUSHARE_API_KEY"
curl --fail-with-body "$BASE/v1/queue" -H "Authorization: Bearer $JPUSHARE_API_KEY"          # queue:read
curl -s "$BASE/v1/maintenance/status"                                                        # 인증 불필요
```

## 4. 오류 표

일반 오류는 `code`·`error`·`message` 봉투, 제출 검증 오류는 `status:"VALIDATION_FAILED"`와 `errors[]`(`code`·`field`·`message`·`detail`) 봉투다. HTTP 상태와 `code`를 함께 보고 분기한다.

| 상태·코드 | 의미와 대응 |
|---|---|
| 401 | 키 없음·만료·폐기. `Bearer jpk_...` 형식과 키 상태를 확인하고 사람에게 새 키를 요청한다 |
| 403 `JWT_REQUIRED` | 키로 부를 수 없는 경로다(키 관리·관리자 등). 웹 로그인이 필요하다 |
| 403 `API_KEY_SCOPE_REQUIRED` | 키에 그 경로의 허용 범위가 없다 → 필요한 범위로 새 키 발급을 요청한다 |
| 403 `API_KEY_ROUTE_FORBIDDEN` | 분류되지 않은 경로 — 메서드와 경로를 확인한다 |
| 403 `NO_LAB` | 연구실 소속 없이 작업 제출 — 소속이 먼저다 |
| 403 `SignatureDoesNotMatch`·`AccessDenied`(XML) | 업로드 주소로 PUT 할 때 응답 `headers`를 빠뜨렸다 |
| 400 `INVALID_LOCATION` | scope/folder 조합 오류 — 네 가지 조합만 된다 |
| 400 `MUST_USE_MULTIPART` / `USE_SINGLE_PUT` | 크기와 업로드 방식이 맞지 않는다(경계 256 MiB) |
| 400 `VALIDATION_FAILED` + `WORKSPACE_GPU_INCOMPATIBLE` | 실행 환경이 그 GPU 서버의 GPU 세대를 지원하지 않는다 → 호환 조건(3절)에 맞게 다시 고른다 |
| 400 `VALIDATION_FAILED` + `WORKER_ACCOUNT_MISSING` | 그 GPU 서버에 사용자 실행 계정이 아직 없다(가입 직후 준비 일부 실패). 다른 GPU 서버로 내거나 잠시 뒤 다시 시도하고, 반복되면 사람에게 운영자 확인을 요청한다 |
| 400 `DESCRIPTION_REQUIRED` | 작업 제출에 `description`이 없다 — 작업 목적을 적어 다시 낸다 |
| 400 `VALIDATION_FAILED` 기타 | 제출 필드 검증 실패 — `errors[].code`·`field`로 고친다 |
| 429 | 두 종류다. 전역 제한은 **평문 본문 + `Retry-After` 헤더**(JSON으로 파싱하지 않는다), `JOIN_RATE_LIMITED`·`LOG_STREAM_LIMIT`은 JSON 봉투다. 표시된 시간만큼 기다린 뒤 다시 시도한다 |
| 503 `SERVICE_MAINTENANCE` | 점검 중 — `GET /v1/maintenance/status`를 보고 끝난 뒤 다시 시도한다 |

허용 범위가 모자란 키의 거절 예:

<!-- doc-exec: C11 expect=403 -->

```bash
# account:read 만 가진 키 → 403 API_KEY_SCOPE_REQUIRED
curl -sS "$BASE/v1/jobs" -H "Authorization: Bearer $READONLY_API_KEY" -F 'command=python' -F 'tier=jpu-60'
```

목록은 `?cursor=&limit=`로 받고, 응답의 `next_cursor`를 다음 `cursor`에 넣어 넘긴다.

## 5. 판단 규칙

- **키 관리는 사람이 한다.** 만료되거나 허용 범위가 모자라면 사람에게 요청한다.
- **필요한 허용 범위만 요청한다.** 읽기만 할 거면 쓰기 범위를 달라고 하지 않는다.
- **파괴적 동작(삭제·취소·대기열 순서 변경)은 사람의 확인을 받은 뒤에만 실행한다.** 삭제·이동 전에 `*-preview` 경로(예: `/v1/storage/folders/delete-preview`, `/v1/storage/move-preview`)가 있으면 먼저 불러 영향 범위를 사람에게 보여 준다.
- **LLM 경로는 부르지 않는다**(503 `LLM_DISABLED`).
- **키 원문을 파일·로그·보고·커밋에 쓰지 않는다.** 환경 변수로만 쓴다.
- **429 평문 응답을 JSON으로 파싱하지 않는다.** `Retry-After` 헤더만큼 기다린다.
- **403 `JWT_REQUIRED`를 키로 다시 시도하지 않는다.** 경로 문제지 키 문제가 아니다.
- **`WORKSPACE_GPU_INCOMPATIBLE`이면 같은 조합으로 다시 내지 않는다.** 실행 환경이나 GPU 서버를 바꿔야 풀린다.
