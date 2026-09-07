import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { getSupabaseBrowserClient } from '../lib/supabase-browser';

const UserLogin: NextPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSignup = router.query.mode === 'signup';

  useEffect(() => {
    const queryError = router.query.error;
    if (typeof queryError === 'string' && queryError) setError(queryError);
  }, [router.query.error]);

  const continueWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError('Đăng nhập Google chưa được cấu hình. Vui lòng thử lại sau.');
      setLoading(false);
      return;
    }

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (googleError) {
      setError('Không thể mở đăng nhập Google. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{isSignup ? 'Đăng ký tài khoản' : 'Đăng nhập'} - Web ôn thi viên chức</title>
        <meta name="description" content="Đăng nhập tài khoản học viên bằng Google" />
      </Head>
      <main className="user-auth-page">
        <div className="user-auth-card">
          <Link href="/" className="user-auth-brand"><span><BookOpen size={16} /></span> Web ôn thi viên chức</Link>
          <h1>{isSignup ? 'Tạo tài khoản học viên' : 'Đăng nhập để bắt đầu ôn thi'}</h1>
          <p>{isSignup ? 'Tạo tài khoản miễn phí để bắt đầu hành trình ôn thi.' : 'Tiếp tục với tài khoản Google của bạn.'}</p>
          <button className="google-login-button user-google-button" type="button" onClick={continueWithGoogle} disabled={loading}>
            <span className="google-mark">G</span>
            {loading ? 'Đang chuyển đến Google...' : 'Tiếp tục với Google'}
          </button>
          {error && <p className="user-auth-error">{error}</p>}
          <div className="user-auth-divider"><span>hoặc</span></div>
          <p className="user-auth-hint">Đăng nhập an toàn, nhanh chóng và không cần ghi nhớ thêm mật khẩu.</p>
          <div className="user-auth-switch">
            {isSignup ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
            <Link href={isSignup ? '/login' : '/login?mode=signup'}>{isSignup ? 'Đăng nhập' : 'Đăng ký'}</Link>
          </div>
          <Link href="/" className="user-auth-back"><ArrowLeft size={14} /> Về trang chủ</Link>
        </div>
      </main>
    </>
  );
};

export default UserLogin;
