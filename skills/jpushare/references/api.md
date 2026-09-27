# JPUShare API 참조

SKILL.md의 절차에서 세부가 필요할 때 읽는다. 기본 주소는 `https://share.jedutools.io`, 경로는 모두 `/v1`로 시작한다.

## 목차

- 허용 범위와 호출할 수 있는 경로
- 저장 위치(scope/folder)
- 멀티파트 업로드(256 MiB 초과)
- 작업 제출 필드
- 응답 봉투와 목록 넘기기
- 전체 오류 표

## 허용 범위와 호출할 수 있는 경로

키는 발급한 사람의 권한을 좁힐 뿐 넓히지 않는다. 권한은 요청마다 다시 평가된다. 활성 키는 사람당 최대 5개, 유효 기간은 최대 90일이고, 허용 범위는 발급 뒤 바꿀 수 없다.
표에 없는 경로(관리자·토론·키 관리·연구실 가입·워크스페이스 등)는 웹 로그인 전용이라 키로 부르면 403 `JWT_REQUIRED`다. 인증 없이 부를 수 있는 경로는 `GET /v1/auth/config`, `GET /v1/maintenance/status`뿐이다.

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

## 저장 위치(scope/folder)

저장 공간은 연구실마다 따로 있다. 위치는 저장소 이름 대신 네 조합으로만 지정한다. 표 밖은 400 `INVALID_LOCATION`이다. `key`·`prefix`는 그 위치 기준 상대 경로다.

| `scope` | `folder` | 용도 |
|---|---|---|
| `shared` | `data` | 연구실 공유 데이터(작업 입력) |
| `shared` | `result` | 연구실 공유 결과(`results/<작업 ID>/`) |
| `private` | `data` | 나만 보는 데이터 |
| `private` | `result` | 나만 보는 결과(`<작업 ID>/`) |

결과는 위치와 관계없이 작업이 끝나고 30일 뒤 정리된다. `GET /v1/storage`는 `quota_gb`·`used_gb`(GiB)와 자리별 사용량을 준다. 목록 항목의 `size`는 바이트, `is_prefix=true`는 폴더다.

## 멀티파트 업로드(256 MiB 초과)

256 MiB 이하를 멀티파트로 개시하면 400 `USE_SINGLE_PUT`이다.

| 경로 | 요청 본문 | 응답 |
|---|---|---|
| `POST /v1/storage/multipart/init` | `{"scope","folder","key","content_length"}`(전체 바이트) | `{"upload_id","part_size"}` |
| `POST /v1/storage/multipart/part` | `{"upload_id","part_numbers":[1,…]}`(1~10000) | `{"parts":[{"part_number","url"}]}` |
| (파트 PUT) | 각 `url`에 파트 본문 PUT, 추가 헤더 없음 | 응답 헤더 `ETag`(따옴표까지 그대로 보관) |
| `POST /v1/storage/multipart/complete` | `{"upload_id","parts":[{"part_number","etag"}]}` | `{"etag"}` |
| `POST /v1/storage/multipart/abort` | `{"upload_id"}` | 빈 200 — 중간에 그만두면 반드시 부른다 |

파트 수는 `ceil(content_length / part_size)`다. `upload_id`가 없어졌으면 404 `UPLOAD_NOT_FOUND` → 개시부터 다시 한다.

```bash
split -b 256M -d -a 1 big.bin part-      # part-0, part-1
for n in 1 2; do
  url=$(jq -r ".parts[] | select(.part_number==$n) | .url" parts.json)
  etag=$(curl -sS -X PUT "$url" --data-binary @part-$((n-1)) -D - -o /dev/null \
    | tr -d '\r' | awk 'tolower($1)=="etag:" {print $2}')
  echo "{\"part_number\":$n,\"etag\":$(jq -Rn --arg e "$etag" '$e')}"
done | jq -s --arg id "$UPLOAD_ID" '{upload_id:$id, parts:.}' > complete.json
```

## 작업 제출 필드

| 필드 | 뜻 |
|---|---|
| `artifact` / `git_url`(+`git_ref`) | 코드. 둘 중 하나만. ZIP은 500 MiB 이하, Git은 HTTPS·허용 호스트, 주소에 자격 증명을 넣지 않는다 |
| `command`, `args` | 실행 명령과 인수(`args`는 JSON 배열 문자열) |
| `name`, `work_type`, `description` | 작업 이름, 종류(`training` 등), 목적(필수, 500자 이내) |
| `tier` | GPU 서버 이름(`GET /v1/tiers`). GPU 수는 GPU 서버가 정하며 `num_gpus`는 무시된다 |
| `workspace_snapshot_id` | 실행 환경의 `current_snapshot_id` |
| `timeout_seconds` | 60~259200 |
| `result_location` | `shared` 또는 `private`. 생략하면 `private` 채널이 하나라도 있을 때 `private` |
| `channels` | 입력 데이터 JSON 배열: `name`, `scope`, `folder`, `prefix`, `size_gb` |

응답은 `job_id`, `state`, `priority`, `tier`, `queue_position`, `warnings`다. 로그를 따라가려면 `GET /v1/jobs/{id}/log?stream=stdout&follow=1`(SSE, 한 연결 15분)을 쓴다. 아직 시작하지 않은 작업의 로그는 404 `NO_ATTEMPT`다.

## 응답 봉투와 목록 넘기기

일반 오류는 `code`·`error`·`message`(경우에 따라 `request_id`), 제출 검증 오류는 `status:"VALIDATION_FAILED"`와 `errors[]`(`code`·`field`·`message`·`detail`)다. 목록은 `?cursor=&limit=`로 받고, 응답의 `next_cursor`를 다음 `cursor`에 넣는다. `null`이면 마지막이다.

## 전체 오류 표

| 상태·코드 | 의미와 대응 |
|---|---|
| 401 | 키 없음·만료·폐기. `Bearer jpk_...` 형식을 확인하고 새 키를 요청한다 |
| 403 `JWT_REQUIRED` | 키로 부를 수 없는 경로(키 관리·관리자 등). 웹 로그인이 필요하다 |
| 403 `API_KEY_SCOPE_REQUIRED` | 키에 그 경로의 허용 범위가 없다 → 새 키를 요청한다 |
| 403 `API_KEY_ROUTE_FORBIDDEN` | 분류되지 않은 경로 — 메서드와 경로를 확인한다 |
| 403 `NO_LAB` | 연구실 소속 없이 작업 제출 — 참가 승인이 먼저다 |
| 403 `SignatureDoesNotMatch`·`AccessDenied`(XML) | 업로드 PUT에 발급 응답의 `headers`를 빠뜨렸다 |
| 403 (그 밖) | 그 작업·저장 공간에 접근할 권한이 없다 |
| 400 `INVALID_LOCATION` | scope/folder 조합 오류 |
| 400 `MUST_USE_MULTIPART` / `USE_SINGLE_PUT` | 크기와 업로드 방식이 맞지 않는다(경계 256 MiB) |
| 400 `VALIDATION_FAILED` + `WORKSPACE_GPU_INCOMPATIBLE` | 실행 환경이 그 GPU 서버의 GPU 세대를 지원하지 않는다 → 같은 조합으로 다시 내지 않는다 |
| 400 `VALIDATION_FAILED` + `WORKER_ACCOUNT_MISSING` | 그 GPU 서버에 사용자 실행 계정이 아직 없다(가입 직후 준비 일부 실패) → 다른 GPU 서버나 잠시 뒤 재시도 |
| 400 `DESCRIPTION_REQUIRED` | `description`이 비었다 |
| 400 `VALIDATION_FAILED` 기타 | `errors[].code`·`field`로 고친다 |
| 404 `UPLOAD_NOT_FOUND` | 멀티파트 `upload_id`가 없다 → 개시부터 다시 |
| 404 `NO_ATTEMPT` | 아직 시작하지 않은 작업의 로그 |
| 429 | 전역 제한은 평문 본문 + `Retry-After` 헤더, `JOIN_RATE_LIMITED`·`LOG_STREAM_LIMIT`은 JSON 봉투. 표시된 시간만큼 기다린다 |
| 503 `SERVICE_MAINTENANCE` | 점검 중 — `GET /v1/maintenance/status`로 끝난 것을 확인한다 |
| 503 `LLM_DISABLED` | LLM 기능은 제공하지 않는다 |
