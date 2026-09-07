import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { LoaderCircle } from 'lucide-react';
import { getSupabaseBrowserClient } from '../../lib/supabase-browser';

const AuthCallback: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const finishLogin = async () => {
      const code = typeof router.query.code === 'string' ? router.query.code : '';
      const supabase = getSupabaseBrowserClient();
      if (!code || !supabase) {
        await router.replace('/login?error=Không thể hoàn tất đăng nhập Google');
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        await router.replace('/login?error=Phiên đăng nhập Google không hợp lệ');
        return;
      }

      await router.replace('/');
    };

    finishLogin().catch(() => router.replace('/login?error=Không thể hoàn tất đăng nhập Google'));
  }, [router]);

  return (
    <>
      <Head><title>Đang đăng nhập - Web ôn thi viên chức</title></Head>
      <main className="user-auth-page">
        <div className="user-auth-card callback-card">
          <LoaderCircle className="callback-spinner" size={25} />
          <p>Đang hoàn tất đăng nhập...</p>
        </div>
      </main>
    </>
  );
};

export default AuthCallback;
