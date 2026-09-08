import type { NextPage, GetStaticPaths, GetStaticProps } from 'next';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Category, Subject } from '../../lib/mock';
import Link from 'next/link';
import { readJson } from '../../lib/http';
import CategoryIcon from '../../components/CategoryIcon';
import { ClipboardList } from 'lucide-react';

interface CategoryDetailProps {
  slug: string;
}

const CategoryDetail: NextPage<CategoryDetailProps> = ({ slug }) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const catRes = await fetch('/api/categories');
      const catJson = await readJson(catRes);
      if (catJson.success) {
        const found = catJson.data.find((c: Category) => c.slug === slug);
        if (found) {
          setCategory(found);
          const subRes = await fetch(`/api/subjects?categoryId=${found.id}`);
          const subJson = await readJson(subRes);
          if (subJson.success) {
            setSubjects(subJson.data);
          }
        } else {
          setError('Không tìm thấy danh mục');
        }
      } else {
        setError(catJson.message || 'Không thể tải danh mục');
      }
    } catch {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <Layout title="Đang tải... - Web ôn thi viên chức">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </Layout>
    );
  }

  if (error || !category) {
    return (
      <Layout title="Không tìm thấy - Web ôn thi viên chức">
        <div className="not-found">
          <h1>{error || 'Không tìm thấy danh mục'}</h1>
          <p>Danh mục này không tồn tại.</p>
          <button className="btn btn-retry" onClick={fetchData}>Thử lại</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${category.name} - Web ôn thi viên chức`}>
      <section className="category-detail">
        <div className="category-header">
          <div className="category-icon-large"><CategoryIcon slug={category.slug} size={30} /></div>
          <div className="category-info">
            <h1 className="category-title">{category.name}</h1>
            <p className="category-description">{category.description}</p>
          </div>
        </div>

        <section className="subjects-section">
          <h2 className="section-title">Chủ đề ôn tập</h2>
          {subjects.length === 0 ? (
            <div className="empty-state"><p>Chưa có chủ đề nào trong danh mục này.</p></div>
          ) : (
            <div className="subjects-grid">
              {subjects.map((subject) => (
                <div key={subject.id} className="subject-card">
                  <h3 className="subject-title">{subject.name}</h3>
                  <p className="subject-description">{subject.description}</p>
                  <div className="subject-meta">
                    <span className="question-count"><ClipboardList size={14} /> {subject.question_count || 0} câu hỏi</span>
                  </div>
                  <Link href={`/exam/${subject.id}`} className="btn-start">
                    Bắt đầu ôn tập →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  // Pre-generate known slugs; new slugs created via admin CMS
  // will be rendered on-demand thanks to fallback: 'blocking'
  const slugs = ['kien-thuc-chung', 'luat-vien-chuc', 'tin-hoc', 'tieng-anh'];
  return { paths: slugs.map(s => ({ params: { slug: s } })), fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<CategoryDetailProps> = async (context) => {
  return { props: { slug: context.params?.slug as string } };
};

export default CategoryDetail;
