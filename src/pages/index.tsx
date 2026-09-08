import type { GetStaticProps, NextPage } from 'next';
import { useState, type ReactNode } from 'react';
import Layout from '../components/Layout';
import CategoryCard from '../components/CategoryCard';
import { Category } from '../lib/mock';
import { getCategories } from '../lib/db';
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ListChecks,
  MonitorSmartphone,
  Target,
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
          <div className="home-hero-overlay" aria-hidden="true" />
          <div className="home-hero-content">
            <div className="home-eyebrow"><span className="eyebrow-dot" /> Nền tảng ôn thi có hệ thống</div>
            <h1 id="home-title">Chinh phục kỳ thi <span>viên chức</span> dễ dàng hơn.</h1>
            <p className="home-hero-description">
              Luyện tập theo từng chủ đề, thi thử với đồng hồ thực và xem lại từng lỗi sai để tiến bộ chắc chắn mỗi ngày.
            </p>
            <div className="home-hero-actions">
              <a href="#categories" className="home-primary-button">Bắt đầu thi thử <ArrowRight size={17} aria-hidden="true" /></a>
              <a href="#study-flow" className="home-secondary-button"><BookOpenCheck size={17} aria-hidden="true" /> Xem lộ trình</a>
            </div>
            <div className="home-hero-proof" aria-label="Thông tin nền tảng">
              <div><strong>{categories.length || 4}</strong><span>Lĩnh vực ôn tập</span></div>
              <i aria-hidden="true" />
              <div><strong>24/7</strong><span>Chủ động thời gian</span></div>
              <i aria-hidden="true" />
              <div><strong>10/10</strong><span>Phản hồi sau bài làm</span></div>
            </div>
          </div>
        </section>

        <section className="home-trust" aria-label="Lợi ích nền tảng">
          <div className="home-trust-heading"><span><BookOpenCheck size={20} aria-hidden="true" /></span><strong>Mọi thứ bạn cần để ôn thi tự tin hơn</strong></div>
          <div className="home-trust-items">
            <div><Target size={18} aria-hidden="true" /><span><strong>Bám sát trọng tâm</strong><small>Chia theo từng nội dung</small></span></div>
            <div><CheckCircle2 size={18} aria-hidden="true" /><span><strong>Chấm điểm tức thì</strong><small>Biết đúng sai ngay</small></span></div>
            <div><BarChart3 size={18} aria-hidden="true" /><span><strong>Nhìn thấy tiến bộ</strong><small>Ôn tập có mục tiêu</small></span></div>
          </div>
        </section>

        <section className="home-section home-categories" id="categories" aria-labelledby="categories-title">
          <div className="home-section-heading">
            <div><span className="home-section-kicker">Chọn đúng nội dung</span><h2 id="categories-title">Danh mục ôn thi trọng tâm</h2><p>Bắt đầu từ phần kiến thức phù hợp với mục tiêu của bạn.</p></div>
            <span className="home-section-count">{categories.length || 4} lĩnh vực</span>
          </div>
          {loading && <div className="loading-state"><div className="spinner" /><p>Đang tải danh mục...</p></div>}
          {error && <div className="error-state"><p className="error-message">{error}</p><button className="btn btn-retry" onClick={refreshCategories} type="button">Thử lại</button></div>}
          {!loading && !error && categories.length === 0 && <div className="empty-state"><p>Chưa có danh mục nào.</p></div>}
          {!loading && !error && categories.length > 0 && <div className="home-category-grid">{categories.map((category) => <CategoryCard key={category.id} category={category} />)}<a href="#study-flow" className="home-all-card"><span><ArrowRight size={22} aria-hidden="true" /></span><strong>Xem lộ trình học</strong><small>Khám phá cách ôn tập hiệu quả</small></a></div>}
        </section>

        <section className="home-section home-flow" id="study-flow" aria-labelledby="flow-title">
          <div className="home-section-heading centered"><div><span className="home-section-kicker">Phương pháp đơn giản</span><h2 id="flow-title">Lộ trình học tập thông minh</h2><p>Ba bước rõ ràng để biến mỗi phiên ôn tập thành tiến bộ.</p></div></div>
          <div className="home-flow-grid">
            <div className="home-flow-line" aria-hidden="true" />
            <HomeStep icon={<ListChecks size={25} aria-hidden="true" />} number="01" title="Chọn chủ đề" description="Đi thẳng vào phần kiến thức bạn muốn luyện tập hôm nay." />
            <HomeStep icon={<ClipboardCheck size={25} aria-hidden="true" />} number="02" title="Làm bài tập trung" description="Trả lời từng câu hỏi với thời gian và tiến độ được hiển thị rõ." />
            <HomeStep icon={<Trophy size={25} aria-hidden="true" />} number="03" title="Rút kinh nghiệm" description="Xem điểm, đáp án và lời giải để biết phần cần cải thiện." />
          </div>
        </section>

        <section className="home-section home-features" id="features" aria-labelledby="features-title">
          <div className="home-feature-visual" aria-hidden="true">
            <div className="feature-visual-backdrop" />
            <div className="feature-exam-card"><div className="feature-exam-header"><span>Đề thi thử #024</span><span><Clock3 size={14} /> 14:32</span></div><div className="feature-question"><small>Câu hỏi 18/50</small><strong>Quyền và nghĩa vụ của viên chức được quy định như thế nào?</strong></div><div className="feature-options"><i /><i className="selected" /><i /><i /></div><div className="feature-exam-bottom"><span>Đã làm 36%</span><span className="feature-mini-progress"><i /></span></div></div>
            <div className="feature-score-card"><BarChart3 size={18} /><strong>8.6/10</strong><small>Điểm trung bình</small></div>
          </div>
          <div className="home-feature-copy"><span className="home-section-kicker">Công cụ hỗ trợ</span><h2 id="features-title">Tự tin hơn sau mỗi lần làm bài</h2><p>Nền tảng giúp bạn luyện tập như thi thật nhưng học được nhiều hơn sau mỗi câu trả lời.</p><div className="home-feature-list"><FeatureItem icon={<CheckCircle2 size={19} aria-hidden="true" />} title="Chấm điểm & phân tích tự động" description="Biết ngay kết quả, câu sai và lời giải chi tiết sau khi nộp bài." /><FeatureItem icon={<Clock3 size={19} aria-hidden="true" />} title="Mô phỏng thời gian thực" description="Rèn thói quen phân bổ thời gian với đồng hồ đếm ngược." /><FeatureItem icon={<MonitorSmartphone size={19} aria-hidden="true" />} title="Học trên mọi thiết bị" description="Tiếp tục phiên ôn tập trên máy tính, tablet hoặc điện thoại." /></div></div>
        </section>

        <section className="home-final-cta"><div><span className="home-section-kicker">Sẵn sàng bắt đầu?</span><h2>Xây dựng sự tự tin cho kỳ thi tiếp theo.</h2><p>Mỗi ngày một phiên ôn tập có mục tiêu sẽ tạo nên khác biệt.</p></div><a href="#categories" className="home-primary-button">Bắt đầu ôn thi <ArrowRight size={17} aria-hidden="true" /></a></section>
      </div>
    </Layout>
  );
};

function HomeStep({ icon, number, title, description }: { icon: ReactNode; number: string; title: string; description: string }) {
  return <div className="home-step"><div className="home-step-icon">{icon}</div><span>{number}</span><h3>{title}</h3><p>{description}</p></div>;
}

function FeatureItem({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="home-feature-item"><span>{icon}</span><div><h3>{title}</h3><p>{description}</p></div></div>;
}

export default Home;

export const getStaticProps: GetStaticProps<HomeProps> = async () => ({
  props: { initialCategories: await getCategories() },
  revalidate: 60,
});
