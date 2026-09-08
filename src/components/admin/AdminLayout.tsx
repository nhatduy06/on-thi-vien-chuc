import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CircleHelp, FileText, Globe2, LayoutDashboard, Library, LogOut, Menu, Trophy } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/categories', label: 'Danh mục', icon: Library, exact: false },
  { href: '/admin/subjects', label: 'Chủ đề', icon: FileText, exact: false },
  { href: '/admin/questions', label: 'Câu hỏi', icon: CircleHelp, exact: false },
  { href: '/admin/results', label: 'Kết quả thi', icon: Trophy, exact: false },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Admin - Web ôn thi viên chức' }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (item: { href: string; exact: boolean }) =>
    item.exact ? router.pathname === item.href : router.pathname.startsWith(item.href);

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    await router.push('/admin/login');
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="admin-root">
        <aside id="admin-sidebar" className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <Link href="/admin" className="admin-logo" onClick={() => setSidebarOpen(false)}>
            <span className="admin-logo-icon"><LayoutDashboard size={15} /></span>
            <span className="admin-logo-text">Admin CMS</span>
          </Link>

          <nav className="admin-nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link ${isActive(item) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="admin-nav-icon"><item.icon size={16} strokeWidth={1.8} /></span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <Link href="/" className="admin-nav-link">
               <span className="admin-nav-icon"><Globe2 size={16} strokeWidth={1.8} /></span>
              <span>Xem trang web</span>
            </Link>
            <button className="admin-logout" onClick={handleLogout}>
               <span className="admin-nav-icon"><LogOut size={16} strokeWidth={1.8} /></span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="admin-main">
          <header className="admin-topbar">
            <button
              className="admin-hamburger"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Mở hoặc đóng thanh điều hướng quản trị"
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
              type="button"
            >
               <Menu size={18} />
            </button>
            <h1 className="admin-page-title">{title.replace(' - Admin - Web ôn thi viên chức', '').replace('Admin - Web ôn thi viên chức', 'Dashboard')}</h1>
          </header>
          <main className="admin-content">{children}</main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
