import type { LucideIcon } from 'lucide-react';
import { BookOpen, Languages, Landmark, Monitor, FolderOpen } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  'kien-thuc-chung': BookOpen,
  'luat-vien-chuc': Landmark,
  'tin-hoc': Monitor,
  'tieng-anh': Languages,
};

interface CategoryIconProps {
  slug?: string;
  size?: number;
  strokeWidth?: number;
}

const CategoryIcon = ({ slug, size = 22, strokeWidth = 1.8 }: CategoryIconProps) => {
  const Icon = (slug && ICONS[slug]) || FolderOpen;
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
};

export default CategoryIcon;
