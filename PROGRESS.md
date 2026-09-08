# Lộ trình phát triển dự án

Tệp này theo dõi tiến độ của dự án **Web ôn thi viên chức**. Sau mỗi buổi code hoặc cột mốc, hãy cập nhật các ô tick để phản ánh công việc đã hoàn thành.

## Các giai đoạn

### Giai đoạn 1: Khởi tạo dự án & Thiết lập cơ sở dữ liệu
- [x] Tạo README.md
- [x] Tạo PROGRESS.md
- [x] Khởi tạo dự án npm (`npm init -y`)
- [x] Cài đặt Next.js và React (`next`, `react`, `react-dom`)
- [x] Cài đặt TypeScript và các kiểu dữ liệu (`typescript`, `@types/node`, `@types/react`, `@types/react-dom`)
- [x] Tạo cấu trúc thư mục dự án (`src/pages/`, `src/components/`, `src/styles/`, `src/lib/`, `supabase/`, `public/`)
- [x] Cấu hình Next.js (`tsconfig.json`, `next.config.ts`)
- [x] Cập nhật `package.json` với các script (`dev`, `build`, `start`)
- [x] Tạo tệp trang cơ bản (`src/pages/index.tsx`)
- [x] Thiết lập Vercel Functions cho API (`src/pages/api/hello.ts`)
- [x] Cấu hình biến môi trường và secrets (`.env.example`)
- [x] Thiết kế schema PostgreSQL cho Supabase (`supabase/schema.sql`)

### Giai đoạn 2: Trang chủ & Danh mục ôn tập

#### Feature 2.1 - Giao diện Trang chủ (UI First) ✅
- [x] Thiết kế Layout chính (Header, Footer, Hero Section)
- [x] Tạo Component "Danh mục ôn tập" (CategoryCard) dùng **Mock Data**
- [x] Tạo trang chi tiết danh mục (Category Detail Page)
- [x] Hoàn thiện Responsive (Mobile/Tablet) bằng CSS inline

#### Feature 2.2 - Vercel API ✅
- [x] Tạo API `/api/categories` (GET) - trả về JSON tĩnh (Mock)
- [x] Tạo API `/api/subjects?categoryId=...` (GET) - trả về chủ đề theo danh mục

#### Feature 2.3 - Kết nối Supabase (Database) ✅
- [x] Thiết kế bảng `categories` và `subjects` trong Supabase
- [x] Viết script seed dữ liệu mẫu (`supabase/seed.sql`)
- [x] Cập nhật API để đọc/ghi Supabase thay vì D1

#### Feature 2.4 - Tích hợp & Hoàn thiện
- [x] Fetch dữ liệu từ API vào Trang chủ (useEffect + fetch)
- [x] Kiểm thử luồng: Trang chủ → Danh mục → Chi tiết
- [x] Xử lý trạng thái Loading và Error

### Giai đoạn 3: Tính năng thi trắc nghiệm
- [x] Tạo trang làm bài (/exam/[subjectId]) với giao diện thi
- [x] Hiển thị câu hỏi, palette điều hướng, nút Tiếp theo/Quay lại
- [x] Xử lý chọn đáp án, lưu trạng thái, đồng hồ đếm ngược
- [x] Tính toán điểm, hiển thị kết quả (vòng tròn điểm, thống kê đúng/sai)
- [x] API lưu kết quả (/api/results POST), review chi tiết từng câu
- [x] Seed câu hỏi vào Supabase (`supabase/seed.sql`)

### Giai đoạn 4: Bài tập điền khuyết
- [ ] Tạo trình soạn thảo văn bản cho tài liệu luật
- [ ] Đánh dấu chỗ trống và nhận đầu vào từ người dùng
- [ ] Xác thực câu trả lời so với văn bản đúng
- [ ] Cung cấp phản hồi tức thì và chấm điểm
- [ ] Lưu kết quả bài tập vào Supabase

### Giai đoạn 5: Tối ưu hóa, Kiểm thử & Triển khai
- [X] Viết unit test và integration test
- [X] Thực hiện đánh giá hiệu năng
- [ ] Tối ưu hóa mã nguồn API và frontend
- [x] Tối ưu frontend: loại bỏ request font chặn render, render sẵn trang chủ bằng ISR và cải thiện accessibility
- [x] Triển khai lên Vercel Hobby (https://vienchuc247.vercel.app)
- [ ] Thiết lập CI/CD pipeline (nếu cần)
- [ ] Giám sát và bảo trì môi trường production
### Giai đoạn 6: Quản trị hệ thống (Admin Panel)

#### Feature 6.1 - Quản lý danh mục
- [x] CRUD Chuyên mục
- [x] CRUD Chủ đề

#### Feature 6.2 - Quản lý câu hỏi
- [x] CRUD Câu hỏi trắc nghiệm
- [ ] CRUD Bài tập điền khuyết
- [ ] Upload hình ảnh (nếu có)

#### Feature 6.3 - Nhập dữ liệu
- [ ] Import JSON
- [ ] Import Excel / CSV
- [ ] Kiểm tra dữ liệu trước khi nhập
- [x] Đồng bộ dữ liệu vào Supabase

#### Feature 6.4 - Thống kê
- [ ] Thống kê số lượt làm bài
- [ ] Thống kê điểm trung bình
- [ ] Thống kê câu hỏi làm sai nhiều nhất
- [x] Dashboard tổng quan

#### Feature 6.5 - Quản lý người dùng
- [ ] Hồ sơ người dùng
- [ ] Lịch sử làm bài
- [ ] Tiến độ học tập
- [ ] Xem lại bài đã làm

#### Feature 6.6 - Quản trị hệ thống
- [x] Authentication cho CMS và API admin
- [ ] Sao lưu dữ liệu (Backup)
- [ ] Khôi phục dữ liệu (Restore)
- [ ] Nhật ký hoạt động (Audit Log)
- [ ] Thiết lập hệ thống
---

## Ghi chú
- **Trạng thái hiện tại:** ✅ UI người dùng, CMS admin và Supabase data access đã hoàn thành. Đã deploy lên Vercel Hobby.
- **Tối ưu gần đây:** ✅ Loại bỏ Google Fonts/preconnect ngoài, giảm request chặn render, dùng ISR cho danh mục trang chủ và sửa các vấn đề accessibility chính.
- **URL production:** https://vienchuc247.vercel.app
- **Các API đã tạo:**
  - `GET /api/categories` — Trả về danh sách danh mục ôn tập (từ Supabase hoặc mock data)
  - `GET /api/subjects?categoryId=1` — Trả về chủ đề theo danh mục (từ Supabase hoặc mock data)
  - `GET /api/questions?subjectId=1` — Trả về câu hỏi theo chủ đề
  - `POST /api/results` — Lưu kết quả bài thi
  - `GET /api/admin/stats` — Thống kê dashboard (cần đăng nhập admin)
  - `CRUD /api/admin/*` — Quản lý categories, subjects, questions, results
- **Các tệp đã tạo:**
  - `src/lib/db.ts` — Lớp truy cập Supabase, tự động fallback mock khi local chưa cấu hình
  - `src/lib/store.ts` — Data access layer với Supabase + in-memory fallback
  - `src/lib/admin-auth.ts` — HMAC-signed HttpOnly cookie cho admin session
  - `supabase/schema.sql` — Schema PostgreSQL
  - `supabase/seed.sql` — Seed categories, subjects và câu hỏi ban đầu
- **Environment Variables trên Vercel:**
  - `SUPABASE_URL` — URL Supabase project
  - `SUPABASE_SERVICE_ROLE_KEY` — Service role key (server-side only)
  - `NEXT_PUBLIC_SUPABASE_URL` — URL Supabase cho client-side
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon key cho client-side
  - `ADMIN_PASSWORD` — Mật khẩu admin CMS
- **Bước tiếp theo:** Đo lại PageSpeed sau deploy, tiếp tục tối ưu API nếu cần, rồi hoàn thiện Giai đoạn 6.4 (Thống kê chi tiết), Giai đoạn 6.5 (Quản lý người dùng) và Giai đoạn 4 (Bài tập điền khuyết).
