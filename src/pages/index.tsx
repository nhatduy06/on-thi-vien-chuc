import type { GetStaticProps, NextPage } from 'next';
import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import Layout from '../components/Layout';
import CategoryCard from '../components/CategoryCard';
import { Category } from '../lib/mock';
import { getCategories } from '../lib/db';
import {
  ArrowRight,
  Bell,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ListChecks,
  Lightbulb,
  MonitorSmartphone,
  Trophy,
} from 'lucide-react';

interface HomeProps {
  initialCategories: Category[];
}

const Home: NextPage<HomeProps> = ({ initialCategories }) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/categories');
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message || 'Không thể tải danh mục');
      setCategories(json.data);
    } catch {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Trang chủ - Viên Chức 247">
      <div className="home-page">
        <section className="home-hero" aria-labelledby="home-title">
          <Image
            className="home-hero-image"
            src="/hero-study.jpg"
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            aria-hidden="true"
          />
          <div className="home-hero-overlay" aria-hidden="true" />
          <div className="home-hero-content">
            <h1 id="home-title">Chinh phục kỳ thi <span>viên chức</span> dễ dàng hơn.</h1>
            <div className="home-hero-actions">
              <a href="#categories" className="home-primary-button">Bắt đầu thi thử <ArrowRight size={17} aria-hidden="true" /></a>
              <a href="#study-flow" className="home-secondary-button"><BookOpenCheck size={17} aria-hidden="true" /> Xem lộ trình</a>
            </div>
          </div>
        </section>

        <section className="home-section home-categories" id="categories" aria-labelledby="categories-title">
          <div className="home-section-heading">
            <div><h2 id="categories-title">Danh mục ôn thi trọng tâm</h2></div>
          </div>
          {loading && <div className="loading-state"><div className="spinner" /><p>Đang tải danh mục...</p></div>}
          {error && <div className="error-state"><p className="error-message">{error}</p><button className="btn btn-retry" onClick={refreshCategories} type="button">Thử lại</button></div>}
          {!loading && !error && categories.length === 0 && <div className="empty-state"><p>Chưa có danh mục nào.</p></div>}
          {!loading && !error && categories.length > 0 && <div className="home-category-grid">{categories.map((category) => <CategoryCard key={category.id} category={category} />)}<a href="#study-flow" className="home-all-card"><span><ArrowRight size={22} aria-hidden="true" /></span><strong>Xem lộ trình học</strong></a></div>}
        </section>

        <section className="home-section home-flow" id="study-flow" aria-labelledby="flow-title">
          <div className="home-section-heading centered"><div><h2 id="flow-title">Lộ trình học tập thông minh</h2></div></div>
          <div className="home-flow-grid">
            <div className="home-flow-line" aria-hidden="true" />
            <HomeStep icon={<ListChecks size={25} aria-hidden="true" />} title="Chọn chủ đề" />
            <HomeStep icon={<ClipboardCheck size={25} aria-hidden="true" />} title="Làm bài tập trung" />
            <HomeStep icon={<Trophy size={25} aria-hidden="true" />} title="Rút kinh nghiệm" />
          </div>
        </section>

        <section className="home-section home-features" id="features" aria-labelledby="features-title">
          <div className="home-updates-panel" aria-labelledby="updates-title">
            <h2 id="updates-title">Cập nhật mới nhất</h2>
            <div className="home-article-list">
              <a href="#categories" className="home-article">
                <span className="home-article-icon article-book"><BookOpen size={20} aria-hidden="true" /></span>
                <span><strong>Khởi động lộ trình ôn thi viên chức</strong><small>Bắt đầu từ những chủ đề trọng tâm</small><time dateTime="2026-03-18">18/03/2026</time></span>
              </a>
              <a href="#study-flow" className="home-article">
                <span className="home-article-icon article-tip"><Lightbulb size={20} aria-hidden="true" /></span>
                <span><strong>Bí quyết ghi nhớ kiến thức lâu hơn</strong><small>Chia nhỏ nội dung và luyện tập đều đặn</small><time dateTime="2026-03-12">12/03/2026</time></span>
              </a>
              <a href="#features" className="home-article">
                <span className="home-article-icon article-notice"><Bell size={20} aria-hidden="true" /></span>
                <span><strong>Cập nhật ngân hàng câu hỏi mới</strong><small>Bổ sung nội dung ôn tập theo chủ đề</small><time dateTime="2026-03-05">05/03/2026</time></span>
              </a>
            </div>
            <a href="#categories" className="home-articles-link">Xem tất cả bài viết <ArrowRight size={15} aria-hidden="true" /></a>
          </div>
          <div className="home-feature-copy"><h2 id="features-title">Tự tin hơn sau mỗi lần làm bài</h2><div className="home-feature-list"><FeatureItem icon={<CheckCircle2 size={19} aria-hidden="true" />} title="Chấm điểm & phân tích tự động" /><FeatureItem icon={<Clock3 size={19} aria-hidden="true" />} title="Mô phỏng thời gian thực" /><FeatureItem icon={<MonitorSmartphone size={19} aria-hidden="true" />} title="Học trên mọi thiết bị" /></div></div>
        </section>

        <section className="home-final-cta"><div><h2>Xây dựng sự tự tin cho kỳ thi tiếp theo.</h2></div><a href="#categories" className="home-primary-button">Bắt đầu ôn thi <ArrowRight size={17} aria-hidden="true" /></a></section>
      </div>
    </Layout>
  );
};

function HomeStep({ icon, title }: { icon: ReactNode; title: string }) {
  return <div className="home-step"><div className="home-step-icon">{icon}</div><h3>{title}</h3></div>;
}

function FeatureItem({ icon, title }: { icon: ReactNode; title: string }) {
  return <div className="home-feature-item"><span>{icon}</span><div><h3>{title}</h3></div></div>;
}

export default Home;

export const getStaticProps: GetStaticProps<HomeProps> = async () => ({
  props: { initialCategories: await getCategories() },
  revalidate: 60,
});
