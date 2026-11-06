# PR: `refactor/mobile-layout` → `main` — Hợp nhất mobile về 1 app "1 app 2 vai trò"

> **Base:** `main` (`ad4ef68`) · **Head:** `refactor/mobile-layout`
> **2 commits, 106 files:** `985eefb` (78 files, 0+/0− — pure rename) + `9c27e79` (28 files, +29/−7339)

## Bối cảnh

Sau đợt merge 04/11, `main` chứa driver ở **hai nơi**: driver UI polish trong `caller-app/`
(PR #6) và app `driver-app/` riêng của Phú (PR #4) — xung đột kiến trúc với quyết định
"1 app 2 vai trò" đã thống nhất ở PR #2 (`feature/unified-mobile-app`, 23/10).
PR này chốt lại hướng unified theo quyết định nhóm.

## Thay đổi

### Commit 1 — `985eefb` (pure move, review bằng rename-only diff)
- `mobile-app/caller-app/*` → `mobile-app/`: `App.js`, `src/`, `assets/`, `scripts/`,
  `package.json`, `app.json`, `README.md`, `.env.example` — **0 insertions, 0 deletions**,
  100% rename (git `--follow` vẫn chạy). Import trong `src/` đều relative nên không đứt.
- `mobile-app/` giờ **chính là** app Expo (`cd mobile-app && npm install && npx expo start`).
- CI không có job mobile; docker-compose không có service mobile — không tác động.

### Commit 2 — `9c27e79` (gỡ driver-app + salvage)
- **Xóa `mobile-app/driver-app/`** (Nguyễn Hữu Phú, PR #4) theo quyết định giữ unified app.
- **Salvage từ driver-app** (được credit trong code): `dispatchApi`
  (`accept`/`reject`/`setTripStatus` — `backend/app/api/dispatch.py`) +
  `ambulanceApi.postLocation` → nap vào `src/services/api.js`, xuất qua cổng
  `src/services/index.js`.
- **Không mất login thật**: `authApi.login` (OAuth2 form-encoded) + token persist
  AsyncStorage + restore session đã tồn tại sẵn trong caller-app từ trước — driver-app
  copy cùng nguồn nên không trùng lặp.
- 6 màn demo của driver-app (Dispatch/Navigation/Hospital/…) xóa cùng app — nội dung
  đã có bản polish trong `src/screens/driver/` (10 màn D-01…D-09).
- `README` root + 2 dòng comment `env.js` cập nhật theo đường dẫn mới.

## Không đụng

`backend/` (0 tham chiếu filesystem tới mobile — "caller"/"driver" trong backend là
role nghiệp vụ), `dispatcher-web/`, `database/`, `docker/`, `tools/`, CI (2 job cũ).
`docs/pr-caller-app-ui.md` giữ nguyên — hồ sơ PR lịch sử.

## QA (chạy tại head nhánh)

| Bước | Kết quả |
|---|---|
| `audit-imports.js` | 64 files, ALL OK |
| `check-icons-final.js` | 38/38 icons, ALL OK |
| `npx expo export --platform android` (từ `mobile-app/`) | PASS |

## Lưu ý cho reviewer

- **Phú**: PR này xóa `driver-app/` của bạn — phần api client + login đã được giữ lại
  trong app hợp nhất (xem comment "Salvage" trong `src/services/api.js`). Nếu bạn còn
  code local chưa push trên path cũ, báo trước khi merge để phối hợp rebase.
- Ai đang checkout `feat/driver-app-ui`/`caller-app` local: sau merge PR này, kéo main
  và `git branch -d` nhánh cũ, checkout lại sẽ thấy cấu trúc mới.
