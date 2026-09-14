import type { RecruitmentNotice } from './store';

export function cleanNoticeExcerpt(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s*The post\b.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getNoticeProvince(notice: RecruitmentNotice): string {
  if (notice.province?.trim()) return notice.province.trim();
  const match = notice.title.match(/(?:TP\.?|Thành phố|tỉnh)\s+[^,]+?(?=\s+(?:tuyển|thông báo|tiếp|điều|năm)|,|$)/i);
  return match?.[0]?.trim() || '';
}
