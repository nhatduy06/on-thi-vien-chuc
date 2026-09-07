# Web ôn thi viên chức

Ứng dụng ôn thi trắc nghiệm xây dựng bằng Next.js 16, triển khai trên Vercel Hobby và sử dụng Supabase Free cho PostgreSQL. API Routes của Pages Router chạy bằng Vercel Functions.

## Công nghệ

- Next.js 16 + React 19 (Pages Router)
- Vercel Hobby cho hosting, SSR và API Routes
- Supabase Free (PostgreSQL) cho categories, subjects, questions và exam results
- HMAC-signed HttpOnly cookie cho Admin session

## Cấu trúc chính

```text
├── src/
│   ├── pages/                 # UI pages và API Routes
│   │   ├── admin/             # CMS quản trị
│   │   ├── api/admin/         # CRUD API cho CMS
│   │   ├── category/          # Trang danh mục người dùng
│   │   └── exam/              # Trang làm bài
│   ├── components/            # Layout và component dùng lại
│   ├── lib/
│   │   ├── store.ts           # Supabase data access, fallback local
│   │   ├── db.ts              # Data access API cho trang người dùng
│   │   ├── admin-auth.ts      # HMAC Admin authentication
│   │   └── mock.ts            # Dữ liệu fallback khi chưa cấu hình Supabase
│   └── styles/                # CSS toàn cục và CMS
├── supabase/
│   ├── schema.sql             # Tạo schema PostgreSQL
│   └── seed.sql               # Dữ liệu mẫu ban đầu
├── next.config.ts
└── package.json
```

## Chạy local

Tạo file `.env.local` từ `.env.example`, rồi điền:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_PASSWORD=your-local-admin-password
```

`SUPABASE_SERVICE_ROLE_KEY` chỉ được dùng ở server và không được đặt tên `NEXT_PUBLIC_`.

Cài package và chạy:

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`. Nếu chưa có Supabase credentials, app dùng mock data để phát triển và test local.

## Thiết lập Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com).
2. Mở `SQL Editor`.
3. Dán và chạy toàn bộ `supabase/schema.sql`.
4. Dán và chạy toàn bộ `supabase/seed.sql`.
5. Vào `Project Settings → API`.
6. Sao chép `Project URL`, key `anon` và key `service_role` vào biến môi trường.

Không đưa `service_role` key vào code frontend hoặc Git repository. Row Level Security đã được bật trong schema; các request database của app chạy server-side bằng service role key.

## Đăng nhập Google cho người dùng

Trang `/login` sử dụng Supabase Auth để đăng nhập tài khoản học viên bằng Google. Admin vẫn dùng mật khẩu riêng tại `/admin/login` và không dùng Google OAuth.

1. Tạo OAuth Client ID loại `Web application` trong Google Cloud Console.
2. Trong Supabase vào `Authentication → Providers → Google`, bật Google và nhập Client ID/Client Secret.
3. Trong Supabase vào `Authentication → URL Configuration → Redirect URLs`, thêm:

```text
http://localhost:3000/auth/callback
https://your-vercel-domain.vercel.app/auth/callback
```

4. Đặt `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` cho trình duyệt.

Tham số `prompt=select_account` khiến Google hiển thị bộ chọn tài khoản khi người dùng bấm nút. Đăng nhập Google chỉ tạo phiên học viên; không cấp quyền Admin.

## Deploy Vercel thủ công

### Qua Vercel Dashboard

1. Đẩy project lên Git repository.
2. Vào [vercel.com/new](https://vercel.com/new) và import repository.
3. Giữ framework preset là `Next.js`.
4. Thêm các Environment Variables cho `Production`:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ADMIN_PASSWORD
NEXT_PUBLIC_SITE_URL
```

5. Bấm `Deploy`.

### Qua Vercel CLI

```bash
npx vercel login
npx vercel --prod
```

Khi được hỏi, chọn project name, ví dụ `onthivienchuc`. Vercel sẽ tạo URL dạng:

```text
https://onthivienchuc.vercel.app
```

Sau lần deploy đầu tiên, có thể cấu hình Environment Variables trên Vercel Dashboard rồi deploy lại.

## Cập nhật website

Sau khi sửa code:

```bash
npm run typecheck
npm test -- --runInBand
npx vercel --prod
```

Nếu chỉ thêm hoặc sửa câu hỏi qua Admin thì không cần deploy lại. Dữ liệu được lưu trực tiếp trong Supabase.

Nếu thay đổi cấu trúc database, cập nhật SQL tương ứng trong Supabase SQL Editor trước khi deploy code.

## Kiểm tra trước deploy

```bash
npm run typecheck
npm test
npm run build
```

## Bảo mật Admin

CMS có đăng nhập tại `/admin/login`. Mật khẩu không lưu trong database; session là cookie HttpOnly ký HMAC, hết hạn sau 8 giờ. Production phải đặt `ADMIN_PASSWORD` trong Vercel Environment Variables.

Không commit `.env.local`, `SUPABASE_SERVICE_ROLE_KEY` hoặc bất kỳ secret nào vào repository.

## Dữ liệu Cloudflare cũ

Thư mục `d1-migrations/` là migration cũ của Cloudflare D1 và không còn được Vercel sử dụng. Schema/seed mới cho Supabase nằm trong `supabase/`.
