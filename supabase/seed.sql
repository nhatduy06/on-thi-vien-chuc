-- Run after schema.sql. Safe to run more than once.
insert into public.categories (name, slug, description, icon, display_order) values
  ('Kiến thức chung', 'kien-thuc-chung', 'Các kiến thức cơ bản về quản lý nhà nước, pháp luật, chính sách của Đảng và Nhà nước', 'book-open', 1),
  ('Luật viên chức', 'luat-vien-chuc', 'Luật viên chức, quyền và nghĩa vụ của viên chức, quy chế thi tuyển', 'landmark', 2),
  ('Tin học', 'tin-hoc', 'Tin học văn phòng, sử dụng phần mềm, kiến thức cơ bản về CNTT', 'monitor', 3),
  ('Tiếng Anh', 'tieng-anh', 'Từ vựng, ngữ pháp, đọc hiểu tiếng Anh phục vụ thi viên chức', 'languages', 4)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  display_order = excluded.display_order,
  updated_at = now();

insert into public.subjects (category_id, name, slug, description, display_order)
select c.id, seed.name, seed.slug, seed.description, seed.display_order
from (values
  ('kien-thuc-chung', 'Pháp luật đại cương', 'phap-luat-dai-cuong', 'Hệ thống pháp luật Việt Nam, hiến pháp, văn bản quy phạm pháp luật', 1),
  ('kien-thuc-chung', 'Quản lý hành chính nhà nước', 'quan-ly-hanh-chinh', 'Tổ chức bộ máy nhà nước, thủ tục hành chính, cải cách hành chính', 2),
  ('kien-thuc-chung', 'Đường lối chính sách của Đảng', 'duong-loi-chinh-sach', 'Đường lối phát triển kinh tế - xã hội, chính sách dân tộc, tôn giáo', 3),
  ('kien-thuc-chung', 'Kỹ năng soạn thảo văn bản', 'ky-nang-soan-thao', 'Kỹ năng soạn thảo văn bản hành chính, thể thức văn bản', 4),
  ('luat-vien-chuc', 'Luật viên chức 2026', 'luat-vien-chuc-2026', 'Nội dung Luật viên chức mới nhất, các điều khoản sửa đổi bổ sung', 1),
  ('luat-vien-chuc', 'Nghị định hướng dẫn thi hành', 'nghi-dinh-huong-dan', 'Các nghị định, thông tư hướng dẫn thi hành Luật viên chức', 2),
  ('luat-vien-chuc', 'Quy chế thi tuyển viên chức', 'quy-che-thi-tuyen', 'Quy chế thi tuyển, xét tuyển viên chức, quy trình tổ chức kỳ thi', 3),
  ('tin-hoc', 'Tin học văn phòng', 'tin-hoc-van-phong', 'Sử dụng Windows, Microsoft Office (Word, Excel, PowerPoint)', 1),
  ('tin-hoc', 'Kiến thức cơ bản về CNTT', 'kien-thuc-co-ban-cntt', 'Kiến thức cơ bản về máy tính, mạng, an toàn thông tin', 2),
  ('tieng-anh', 'Ngữ pháp tiếng Anh', 'ngu-phap-tieng-anh', 'Các chủ điểm ngữ pháp cơ bản, câu điều kiện, thì, câu bị động', 1),
  ('tieng-anh', 'Đọc hiểu tiếng Anh', 'doc-hieu-tieng-anh', 'Kỹ năng đọc hiểu đoạn văn, tìm ý chính, từ vựng theo chủ đề', 2),
  ('tieng-anh', 'Từ vựng tiếng Anh', 'tu-vung-tieng-anh', 'Từ vựng tiếng Anh theo chủ đề hành chính, văn phòng, pháp luật', 3)
) as seed(category_slug, name, slug, description, display_order)
join public.categories c on c.slug = seed.category_slug
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  description = excluded.description,
  display_order = excluded.display_order,
  updated_at = now();

insert into public.questions (subject_id, content, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
select s.id, seed.content, seed.option_a, seed.option_b, seed.option_c, seed.option_d, seed.correct_answer, seed.explanation, seed.difficulty
from (values
  ('phap-luat-dai-cuong', 'Theo Hiến pháp nước CHXHCN Việt Nam, cơ quan quyền lực nhà nước cao nhất là?', 'Chính phủ', 'Quốc hội', 'Tòa án nhân dân tối cao', 'Viện kiểm sát nhân dân tối cao', 'B', 'Quốc hội là cơ quan quyền lực nhà nước cao nhất theo quy định của Hiến pháp.', 'easy'),
  ('phap-luat-dai-cuong', 'Văn bản quy phạm pháp luật nào có hiệu lực pháp lý cao nhất?', 'Luật', 'Pháp lệnh', 'Hiến pháp', 'Nghị định', 'C', 'Hiến pháp là văn bản quy phạm pháp luật có hiệu lực pháp lý cao nhất.', 'easy'),
  ('phap-luat-dai-cuong', 'Hệ thống cơ quan hành chính nhà nước ở Việt Nam bao gồm?', 'Chính phủ và Ủy ban nhân dân các cấp', 'Quốc hội và Hội đồng nhân dân', 'Tòa án và Viện kiểm sát', 'Cơ quan Đảng và Nhà nước', 'A', 'Hệ thống hành chính nhà nước gồm Chính phủ và UBND các cấp.', 'medium'),
  ('phap-luat-dai-cuong', 'Công chức là gì?', 'Người làm việc trong cơ quan nhà nước', 'Người được tuyển dụng vào làm việc trong biên chế nhà nước', 'Người làm việc trong doanh nghiệp nhà nước', 'Người làm việc theo hợp đồng lao động', 'B', 'Công chức là người được tuyển dụng vào làm việc trong biên chế nhà nước.', 'medium'),
  ('phap-luat-dai-cuong', 'Nguyên tắc tổ chức và hoạt động của bộ máy nhà nước ta là?', 'Tập trung dân chủ', 'Phân quyền', 'Tam quyền phân lập', 'Dân chủ trực tiếp', 'A', 'Nguyên tắc cơ bản là tập trung dân chủ.', 'hard'),
  ('luat-vien-chuc-2026', 'Theo Luật viên chức, viên chức là gì?', 'Người làm việc trong cơ quan nhà nước', 'Người được tuyển dụng theo vị trí việc làm, làm việc tại đơn vị sự nghiệp công lập', 'Người làm việc trong doanh nghiệp nhà nước', 'Người làm việc theo hợp đồng lao động', 'B', 'Viên chức là người được tuyển dụng theo vị trí việc làm tại đơn vị sự nghiệp công lập.', 'easy'),
  ('luat-vien-chuc-2026', 'Hợp đồng làm việc của viên chức có mấy loại?', '1 loại', '2 loại', '3 loại', '4 loại', 'B', 'Có 2 loại: hợp đồng không xác định thời hạn và hợp đồng xác định thời hạn.', 'medium'),
  ('luat-vien-chuc-2026', 'Quyền nào sau đây không thuộc quyền của viên chức?', 'Quyền đình công', 'Quyền được bảo đảm lương', 'Quyền được đào tạo', 'Quyền được nghỉ ngơi', 'A', 'Viên chức không có quyền đình công theo quy định của pháp luật.', 'hard')
) as seed(subject_slug, content, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
join public.subjects s on s.slug = seed.subject_slug
where not exists (
  select 1 from public.questions q
  where q.subject_id = s.id and q.content = seed.content
);
