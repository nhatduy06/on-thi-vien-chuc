import React from 'react';
import Link from 'next/link';
import { Category } from '../lib/mock';
import CategoryIcon from './CategoryIcon';
import { ArrowUpRight } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link href={`/category/${category.slug}`} className="category-card">
      <div className="card-icon" aria-hidden="true"><CategoryIcon slug={category.slug} /></div>
      <div className="card-content">
        <h3 className="card-title">{category.name}</h3>
        <span className="card-action">Luyện ngay <ArrowUpRight size={13} aria-hidden="true" /></span>
      </div>
      <div className="card-arrow" aria-hidden="true">→</div>
    </Link>
  );
};

export default CategoryCard;
