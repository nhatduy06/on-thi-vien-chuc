import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { Article } from '../../lib/mock';
import { listArticles } from '../../lib/store';

interface ArticleProps { article: Article | null }

const ArticlePage: NextPage<ArticleProps> = ({ article }) => {
  if (!article) return <Layout title="Không tìm thấy - Viên Chức 247"><div className="not-found"><h1>Không tìm thấy bài viết</h1><Link href="/articles" className="btn btn-primary">Xem tất cả bài viết</Link></div></Layout>;
  return <Layout title={`${article.title} - Viên Chức 247`}><article className="article-detail"><Link href="/articles" className="article-back">← Tất cả bài viết</Link><time dateTime={article.published_at}>{new Date(article.published_at).toLocaleDateString('vi-VN')}</time><h1>{article.title}</h1><p className="article-detail-excerpt">{article.excerpt}</p><div className="article-detail-content">{article.content.split('\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></article></Layout>;
};

export default ArticlePage;

export const getStaticPaths: GetStaticPaths = async () => ({ paths: [], fallback: 'blocking' });

export const getStaticProps: GetStaticProps<ArticleProps> = async ({ params }) => {
  const article = (await listArticles()).find((item) => item.id === Number(params?.id)) || null;
  if (!article) return { notFound: true };
  return { props: { article }, revalidate: 60 };
};
