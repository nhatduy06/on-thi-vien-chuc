import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Web ôn thi viên chức' }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Web ôn thi viên chức - Ôn tập trực tuyến" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <header className="header">
        <div className="container">
          <Link href="/" className="logo" onClick={() => setMenuOpen(false)}>
            <span className="logo-icon"><BookOpen size={15} strokeWidth={2} /></span>
            <span className="logo-text">Web ôn thi viên chức</span>
          </Link>

          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>

           <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
            <Link href="/" className="nav-link" onClick={() => setMenuOpen(false)}>Trang chủ</Link>
            <Link href="/#categories" className="nav-link" onClick={() => setMenuOpen(false)}>Danh mục</Link>
            <Link href="/#features" className="nav-link" onClick={() => setMenuOpen(false)}>Tính năng</Link>
           </nav>
           <div className="header-actions">
             <Link href="/login" className="header-login" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
             <Link href="/login?mode=signup" className="header-register" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
             <Link href="/#categories" className="header-cta" onClick={() => setMenuOpen(false)}>Bắt đầu ôn thi <ArrowRight size={14} /></Link>
           </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link href="/" className="footer-logo"><span className="logo-icon"><BookOpen size={15} /></span> Web ôn thi viên chức</Link>
              <p>Nền tảng luyện thi trắc nghiệm giúp bạn học có kế hoạch và tiến bộ qua từng phiên ôn tập.</p>
            </div>
            <div className="footer-column">
              <h3>Khám phá</h3>
              <Link href="/#categories">Danh mục ôn tập</Link>
              <Link href="/#study-flow">Cách học</Link>
              <Link href="/#features">Tính năng</Link>
            </div>
            <div className="footer-column">
              <h3>Hỗ trợ</h3>
              <Link href="/#categories">Bắt đầu ôn thi</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 Web ôn thi viên chức</span>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Layout;
