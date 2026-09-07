import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CategoryCard from '../components/CategoryCard';
import { Category } from '../lib/mock';
import { readJson } from '../lib/http';
import { ArrowRight, BarChart3, BookOpenCheck, CheckCircle2, ClipboardCheck, ListChecks, Smartphone, Target, Timer, TrendingUp, Trophy } from 'lucide-react';

const Home: NextPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/categories');
      const json = await readJson(res);
      if (json.success) {
        setCategories(json.data);
      } else {
        setError(json.message || 'Không thể tải danh mục');
      }
    } catch {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Layout title="Trang chủ - Web ôn thi viên chức">
      <section className="hero hero-banner">
        <div className="hero-layout">
          <div className="hero-content">
            <h1 className="hero-title">Ôn thi viên chức hiệu quả. Sẵn sàng cho kỳ thi.</h1>
            <div className="hero-buttons">
              <a href="#categories" className="btn btn-primary">Bắt đầu ôn thi <ArrowRight size={15} /></a>
              <a href="#categories" className="btn btn-secondary">Xem danh mục <ArrowRight size={15} /></a>
            </div>
            <div className="hero-note" aria-label="Điểm nổi bật">
              <span>Thi thử theo từng chủ đề</span>
              <span>Chấm điểm ngay</span>
              <span>Học trên mọi thiết bị</span>
            </div>
          </div>
          <div className="hero-banner-visual" aria-label="Lộ trình ôn thi minh họa">
            <div className="banner-visual-heading"><span>Lộ trình ôn thi</span><span className="banner-live"><i /> Đang hoạt động</span></div>
            <div className="banner-visual-progress"><span>Tiến độ phiên học</span><strong>68%</strong></div>
            <div className="banner-progress-track"><span /></div>
            <div className="banner-visual-list">
              <div className="banner-list-item is-done"><span className="banner-list-icon"><CheckCircle2 size={15} /></span><span><strong>Kiến thức chung</strong><small>Đã hoàn thành</small></span><CheckCircle2 size={15} /></div>
              <div className="banner-list-item is-active"><span className="banner-list-icon"><BookOpenCheck size={15} /></span><span><strong>Luật viên chức</strong><small>Đang ôn tập</small></span><ArrowRight size={15} /></div>
              <div className="banner-list-item"><span className="banner-list-icon"><Target size={15} /></span><span><strong>Tin học & Tiếng Anh</strong><small>Sẵn sàng bắt đầu</small></span><ArrowRight size={15} /></div>
            </div>
            <div className="banner-visual-footer"><span><TrendingUp size={15} /> Học đều mỗi ngày</span><span>4 nội dung</span></div>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Giá trị của nền tảng">
        <div className="trust-intro"><span className="trust-mark"><BookOpenCheck size={18} /></span><strong>Công cụ hỗ trợ bạn luyện thi có hệ thống</strong></div>
        <div className="trust-items">
          <div className="trust-item"><Target size={17} /><span><strong>Nhiều bộ câu hỏi</strong><small>Theo từng nội dung</small></span></div>
          <div className="trust-item"><CheckCircle2 size={17} /><span><strong>Chấm điểm tự động</strong><small>Phản hồi ngay sau bài làm</small></span></div>
          <div className="trust-item"><TrendingUp size={17} /><span><strong>Theo dõi tiến độ</strong><small>Nhìn rõ điểm cần cải thiện</small></span></div>
        </div>
      </section>

      <section className="categories-section" id="categories">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Chọn nội dung bạn muốn ôn</h2>
          </div>
          <span className="section-count">{categories.length > 0 ? `${categories.length} lĩnh vực` : 'Theo dữ liệu hệ thống'}</span>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải danh mục...</p>
          </div>
        )}
        {error && (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button className="btn btn-retry" onClick={fetchCategories}>Thử lại</button>
          </div>
        )}
        {!loading && !error && categories.length === 0 && (
          <div className="empty-state"><p>Chưa có danh mục nào.</p></div>
        )}
        {!loading && !error && categories.length > 0 && (
          <div className="categories-grid">
            {categories.map(c => <CategoryCard key={c.id} category={c} />)}
          </div>
        )}
      </section>

      <section className="study-flow" id="study-flow">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Ôn thi đơn giản hơn với 3 bước</h2>
          </div>
        </div>
        <div className="flow-grid">
          <div className="flow-item"><div className="flow-icon"><ListChecks size={21} /></div><span className="flow-number">01</span><h3>Chọn chủ đề</h3><p>Đi thẳng vào phần kiến thức bạn muốn luyện tập hôm nay.</p></div>
          <div className="flow-item"><div className="flow-icon"><ClipboardCheck size={21} /></div><span className="flow-number">02</span><h3>Làm bài tập trung</h3><p>Trả lời từng câu hỏi với thời gian và tiến độ được hiển thị rõ.</p></div>
          <div className="flow-item"><div className="flow-icon"><Trophy size={21} /></div><span className="flow-number">03</span><h3>Rút kinh nghiệm</h3><p>Xem điểm, đáp án và lời giải để biến mỗi lần làm bài thành tiến bộ.</p></div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Công cụ giúp bạn học hiệu quả</h2>
          </div>
        </div>
        <div className="feature-showcase">
          <div className="feature-list">
            <div className="feature-row"><span className="feature-icon"><Timer size={19} /></span><span><strong>Đồng hồ đếm ngược</strong><small>Rèn thói quen phân bổ thời gian như trong kỳ thi thật.</small></span></div>
            <div className="feature-row"><span className="feature-icon"><CheckCircle2 size={19} /></span><span><strong>Chấm điểm tự động</strong><small>Biết kết quả ngay sau khi hoàn thành bài làm.</small></span></div>
            <div className="feature-row"><span className="feature-icon"><BarChart3 size={19} /></span><span><strong>Phân tích kết quả</strong><small>Xem lại đáp án, câu đúng sai và lời giải chi tiết.</small></span></div>
            <div className="feature-row"><span className="feature-icon"><Smartphone size={19} /></span><span><strong>Học trên mọi thiết bị</strong><small>Tiếp tục phiên ôn tập trên máy tính, tablet hoặc điện thoại.</small></span></div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div>
          <h2>Bắt đầu buổi ôn tập đầu tiên</h2>
        </div>
        <a href="#categories" className="btn btn-primary">Bắt đầu ôn thi <ArrowRight size={15} /></a>
      </section>
    </Layout>
  );
};

export default Home;
