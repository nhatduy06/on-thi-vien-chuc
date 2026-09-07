import type { NextPage } from 'next';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { readJson } from '../../lib/http';
import { LockKeyhole } from 'lucide-react';

const AdminLogin: NextPage = () => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const result = await readJson<{ success: boolean; message?: string }>(response);
      if (!result.success) {
        setError(result.message || 'Đăng nhập thất bại');
        return;
      }
      await router.push('/admin');
    } catch {
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Đăng nhập quản trị</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-login-icon"><LockKeyhole size={20} strokeWidth={1.8} /></div>
          <h1>Đăng nhập quản trị</h1>
          <p>Nhập mật khẩu quản trị để tiếp tục.</p>
          <form onSubmit={submit}>
            <label htmlFor="admin-password">Mật khẩu</label>
            <input
              id="admin-password"
              className="form-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoFocus
            />
            {error && <div className="admin-login-error">{error}</div>}
            <button className="btn-save admin-login-submit" type="submit" disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>
          <a href="/" className="admin-login-back">← Về trang người dùng</a>
        </div>
      </main>
    </>
  );
};

export default AdminLogin;
