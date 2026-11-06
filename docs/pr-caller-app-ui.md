# PR: `feat/caller-app-ui` → `main` — Caller App UI hoàn chỉnh (15 màn)

> **Base:** `main` (`ca35310`) · **Head:** `feat/caller-app-ui` (`23d662b`) · **29 commits** · 56 files · +5466/−839
> **Phạm vi:** chỉ `mobile-app/caller-app/` — không đụng `backend/`, `dispatcher-web/`, `driver-app/`, `docs/architecture.md`.

## 1. Tổng quan

Nhánh này hiện thực **toàn bộ giao diện người gọi (Caller) của SmartEMS** theo tài liệu thiết kế `UI_design_SmartEMS.pdf` (15 trang mockup, 15 màn caller), chạy được ngay trên **Expo Go** với **mock engine** mô phỏng hành trình cấp cứu realtime end-to-end. Mọi quyết định thiết kế đã được chốt với chủ nhiệm UI (2026-10-23, ghi trong meeting log — xem mục 6).

App là 1 project Expo độc lập bên trong monorepo (`mobile-app/caller-app`), chưa gộp với driver-app theo hướng "1 app 2 vai trò" — cấu trúc source bên trong đã tổ chức theo đề xuất gộp (xem mục 5) để nếu nhóm trưởng gật gộp thì chỉ cần move pure, 0 refactor.

**Kiểm thử tự động đã chạy trước khi mở PR (nghiệm thu GĐ5):**

| Kiểm tra | Kết quả |
|---|---|
| Audit import/export toàn source (49 file .js) — bắt lỗi named-from-default Metro bỏ sót | ALL OK |
| Icon check 25 icon Ionicons unique đối chiếu glyphmap thật | ALL OK |
| Label chốt 15 màn đối chiếu nguyên văn mockup (Q7) | ALL OK |
| `expo export --platform android` (Metro bundle) | PASS — 2.9MB hbc |
| `git ls-remote` branch đã push đủ, main không bị đụng | OK |

## 2. Màn hình đã hoàn thành (15/15 caller + 3 màn đăng ký)

| Mã | Màn hình | File chính |
|---|---|---|
| M-01 | Splash (navy + logo + slogan giờ vàng + dots) | `src/navigation/AppNavigator.js` |
| M-02 | Onboarding 3 slide (slide 1 đúng mockup, slide 2-3 FE tự thiết kế — đã chốt Q4) | `src/screens/onboarding/Onboarding.js` |
| M-03 | Đăng nhập SĐT + mật khẩu (mockup) | `src/screens/auth/Login/` |
| — | Đăng ký 3 bước: SĐT → OTP 6 ô (demo) → Họ tên + Mật khẩu (chốt Q3) | `src/screens/auth/Register*.js` |
| M-05 | Chọn vai trò Caller/Driver | `src/screens/auth/RoleChoice.js` |
| C-01 | Home: nút SOS giữ 2s (progress ring + phình to), card chào, 2 quick card, card chuyến đang chạy | `src/screens/caller/Home/` |
| C-02 | Xác nhận vị trí: map + vòng accuracy ±m, nút Sửa, mức độ khẩn cấp, gửi kèm hồ sơ y tế | `src/screens/caller/SOS/` |
| C-03 | Ghép xe: timeline 4 bước suy ra từ event backend, đồng hồ đếm, card "Trong lúc chờ" | `src/screens/caller/Matching/` |
| C-04 | Theo dõi realtime: xe chạy trên map (mock ~52s/chuyến), FSM stepper 5 bước, Gọi/Nhắn/Chia sẻ | `src/screens/caller/Tracking/` |
| C-05 | Hoàn tất: banner xanh, 3 chỉ số giờ vàng (xanh lá), đánh giá 5 sao | `src/screens/caller/Completion/` |
| C-06 | Thư viện sơ cứu 8 chủ đề offline + search không phân biệt dấu | `src/screens/caller/FirstAid/` + `src/data/firstAid.js` |
| C-07 | Hướng dẫn sơ cứu từng bước + badge KHẨN CẤP + Gọi 115 (`tel:115`) | `src/screens/caller/FirstAidDetail/` |
| C-08 | Lịch sử: 3 filter chip, badge trạng thái, tự sinh khi hoàn tất/hủy chuyến | `src/screens/caller/History/` |
| C-09 | Chi tiết sự cố: timeline dùng ĐÚNG tên event backend (`SOS_CREATED`...) | `src/screens/caller/HistoryDetail/` |
| C-10 | Hồ sơ: card y tế hồng (AsyncStorage), editor nhóm máu 8 chip, menu chuyển vai trò | `src/screens/caller/Profile/` + `MedicalProfile/` |
| C-11 | Cài đặt: 3 toggle persist qua restart, quyền riêng tư NĐ 13/2023 | `src/screens/caller/Settings/` |

**Luồng chính để review nhanh (2 phút):** Splash → Onboarding → Đăng nhập (mock: SĐT bất kỳ `09xxxxxxxxx`, mật khẩu ≥6 ký tự) → Chọn "Tôi cần cứu trợ" → giữ nút SOS 2 giây → C-02 gửi → C-03 (đếm giây, timeline tự nhảy) → C-04 (xe chạy trên map về hiện trường) → C-05 → đánh giá → Về trang chủ → tab Lịch sử thấy chuyến vừa chạy.

## 3. Commit theo giai đoạn (Conventional Commits)

```
GĐ1 (khung + tab):        4ca7a0b → 8334f90 (+2 fix nhỏ)
GĐ2 (auth + onboarding):  c78c6d5 → 8983dc9 (+2 fix OTP spacing/focus)
GĐ3 (hành trình SOS):     e0c52fa → 877fe4b (data layer, components, C-01→C-05, wiring)
GĐ3.1 (chỉnh UI):         fc17fd6, 514b612, 2f1d261 (layout Home, nút SOS phình to, C-05 xanh)
GĐ4 (C-06→C-11):          6c2eca3 → 23d662b (data layer, sơ cứu, lịch sử, hồ sơ, cài đặt)
```

## 4. Thêm mới gì so với `main`

**Dependencies (3):** `@expo/vector-icons` ^15, `@react-navigation/bottom-tabs` ^7.21, `react-native-svg` 15.16.0 (khớp `bundledNativeModules.json` của Expo SDK 58 — Expo Go nhúng sẵn native, **người review chỉ cần `npm install`, không cần build**).

**Kiến trúc source (`src/`):**

- `theme/` — design tokens chốt từ mockup (đỏ #DC2626, navy #0F172A, xanh lá #22C55E, badge đỏ/xanh/xám...)
- `components/` — 9 component dùng chung: AppButton, Badge, Card, DotsLoader, EmptyState, FsmStepper, OtpInput, SosHoldButton (SVG ring + spring), StarRating
- `navigation/` — AppNavigator (splash, auth gate, role gate) + CallerTabs (4 tab)
- `store/` — zustand 5 store: auth, emergency (FSM hành trình), history, medical, settings — 4 store persist AsyncStorage
- `services/` — cổng `index.js` duy nhất chuyển mock/real theo `EXPO_PUBLIC_MOCK_MODE`; `location.js` reverse geocode không cần API key
- `services/mock/` — mock engine sinh event đúng `event_types` backend + xe di chuyển trên map
- `data/firstAid.js` — 8 chủ đề sơ cứu (35 bước) đọc offline
- `constants/trip.js` — hàm/format dùng chung, khớp tên trạng thái FSM backend

**Xóa:** asset placeholder `src/assets/firstaid/cpr.json` (thay bằng data thật).

## 5. Mock mode ↔ Backend thật

Mọi API call đi qua `src/services/index.js`:

```bash
# .env của caller-app
EXPO_PUBLIC_MOCK_MODE=true    # demo (mặc định) — chạy được không cần backend
EXPO_PUBLIC_MOCK_MODE=false   # gọi backend thật (auth OAuth2 + POST /emergencies + WS /ws)
```

Mock engine sinh event đúng tên `event_types.py` của backend (`SOS_CREATED → AMBULANCE_ASSIGNED → DRIVER_EN_ROUTE → ARRIVED_ON_SCENE → TRANSPORTING → AT_HOSPITAL → TRIP_COMPLETED`), nên khi backend hoàn thiện thì FE chỉ đổi flag, không sửa logic màn hình. Lưu ý: phần lớn event sau `SOS_CREATED` hiện backend chỉ broadcast kênh dispatchers — xem mục 7.

## 6. Quyết định thiết kế đã chốt với chủ nhiệm UI (2026-10-23)

1. **Login = SĐT + mật khẩu**; đăng ký = OTP 3 bước (demo: mã nào cũng pass — SMS gateway là việc backend). SĐT map email nội bộ `{sdt}@caller.smartems.app`, user không thấy khái niệm email.
2. **Bảng màu ước tính được chấp nhận làm design tokens chính thức.**
3. **Label nguyên văn:** C-03 "Đang tìm xe phù hợp...", C-04 "Gọi", C-10 menu "Chuyển vai trò tài xế".
4. **Map dùng `PROVIDER_DEFAULT`** — Expo Go Android render Google Maps sẵn, iOS Apple Maps (khác skin nhẹ, chấp nhận cho demo). API key chỉ cần khi build APK bằng EAS (đã chổ sẵn trong app.json).
5. **Push notification thật defer** (expo-notifications giới hạn trong Expo Go) — toggle cài đặt hiện persist local.
6. **Git:** FE chỉ push nhánh feature — merge là của nhóm trưởng (PR này).

## 7. Backend TODO list cho nhóm trưởng phân công (blocker khi ra bản thật)

| # | Thiết kế FE cần | Backend hiện có | Việc cần làm |
|---|---|---|---|
| 1 | Login SĐT | Email + password | Phone identity + field phone |
| 2 | OTP đăng ký | Không có | OTP endpoints + **SMS gateway** |
| 3 | Chuyển vai trò Caller/Driver | `user.role` 1 chuỗi | Role-switch endpoint |
| 4 | Ưu tiên 3 mức (C-02) | `EmergencyCreate` không nhận | Thêm field `priority: 1\|2\|3` |
| 5 | WS push cho caller | Chỉ broadcast kênh dispatchers | Broadcast thêm `user:{id}` / `emergency:{id}` + payload mở rộng (plate, driver, ETA) |
| 6 | Lịch sử SOS của tôi | `GET /emergencies` chỉ cho dispatcher | `GET /emergencies/mine` |
| 7 | Event log chi tiết | Model có, chưa expose | Endpoint event log theo emergency |
| 8 | Hồ sơ y tế | User chỉ name/phone/email | Bảng `user_medical_profile` + nhận kèm payload SOS |
| 9 | Đánh giá 5 sao | Không có | Bảng ratings |
| 10 | Bệnh viện gần nhất | `/hospitals` stub | Hoàn thiện dữ liệu + khoảng cách |
| 11 | Địa chỉ dạng text | Chỉ lat/lng | Lưu `address` string (FE đã gửi) |
| 12 | Route polyline | Có OSRM client (profile routing) | Bật profile routing / trả route cho FE |

(Nguồn: `design/design-analysis.md` mục "Khoảng cách thiết kế ↔ backend", đã verify `git diff 5699e5b..ca35310` rỗng — đội backend chưa bắt đầu mục nào.)

## 8. Known limitations (chấp nhận trong v1 demo)

- OTP demo không gửi SMS thật (mã nào cũng pass) — chờ mục 7.2.
- Lịch sử lưu AsyncStorage (tối đa 50 bản ghi), chưa đồng bộ server — chờ mục 7.6.
- "Nhắn" tài xế hiện chỉ mở `sms:` link; "Chia sẻ vị trí" dùng `Share` hệ điều hành.
- Driver-app: chọn vai trò tài xế hiện màn "Đang phát triển" — không đụng code driver-app.
- Android là target chính (máy test Windows + Expo Go); iOS chưa test thiết bị thật.

## 9. Cách chạy để review

```bash
git fetch origin && git checkout feat/caller-app-ui
cd mobile-app/caller-app
npm install
npx expo start --clear      # quét QR bằng Expo Go (Android)
```

> ⚠️ Từ `main` chưa có 3 dependency trên — **bắt buộc `npm install`** sau khi checkout, chạy `--clear` lần đầu để Metro cache mới.
