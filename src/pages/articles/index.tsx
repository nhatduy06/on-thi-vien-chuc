import type { GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { Article } from '../../lib/mock';
import { listArticles } from '../../lib/store';

interface ArticlesProps { articles: Article[] }

const ArticlesPage: NextPage<ArticlesProps> = ({ articles }) => (
  <Layout title="Cập nhật mới nhất - Viên Chức 247">
    <section className="articles-page" aria-labelledby="articles-title">
      <div className="articles-heading"><span className="home-section-kicker">Thông tin ôn thi</span><h1 id="articles-title">Cập nhật mới nhất</h1><p>Những thông tin và nội dung mới nhất từ Viên Chức 247.</p></div>
      <div className="articles-list">
        {articles.length === 0 ? <div className="empty-state"><p>Chưa có bài viết nào.</p></div> : articles.map((article) => <article className="article-list-card" key={article.id}><time dateTime={article.published_at}>{new Date(article.published_at).toLocaleDateString('vi-VN')}</time><h2>{article.title}</h2><p>{article.excerpt}</p><Link href={`/articles/${article.id}`} className="article-read-link">Đọc bài viết <span aria-hidden="true">→</span></Link></article>)}
      </div>
    </section>
  </Layout>
);

export default ArticlesPage;

export const getStaticProps: GetStaticProps<ArticlesProps> = async () => ({
  props: { articles: await listArticles() },
  revalidate: 60,
});
