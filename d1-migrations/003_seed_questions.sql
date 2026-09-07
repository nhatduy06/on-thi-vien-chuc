-- Migration 003: Seed questions used by the initial exam experience.
-- Subject IDs are resolved by slug so this remains safe if seed ordering changes.

INSERT INTO questions (
  subject_id, content, option_a, option_b, option_c, option_d,
  correct_answer, explanation, difficulty
)
SELECT id,
  'Theo Hiến pháp nước CHXHCN Việt Nam, cơ quan quyền lực nhà nước cao nhất là?',
  'Chính phủ', 'Quốc hội', 'Tòa án nhân dân tối cao', 'Viện kiểm sát nhân dân tối cao',
  'B', 'Quốc hội là cơ quan quyền lực nhà nước cao nhất theo quy định của Hiến pháp.', 'easy'
FROM subjects WHERE slug = 'phap-luat-dai-cuong';

INSERT INTO questions (
  subject_id, content, option_a, option_b, option_c, option_d,
  correct_answer, explanation, difficulty
)
SELECT id,
  'Văn bản quy phạm pháp luật nào có hiệu lực pháp lý cao nhất?',
  'Luật', 'Pháp lệnh', 'Hiến pháp', 'Nghị định',
  'C', 'Hiến pháp là văn bản quy phạm pháp luật có hiệu lực pháp lý cao nhất.', 'easy'
FROM subjects WHERE slug = 'phap-luat-dai-cuong';

INSERT INTO questions (
  subject_id, content, option_a, option_b, option_c, option_d,
  correct_answer, explanation, difficulty
)
SELECT id,
  'Hệ thống cơ quan hành chính nhà nước ở Việt Nam bao gồm?',
  'Chính phủ và Ủy ban nhân dân các cấp', 'Quốc hội và Hội đồng nhân dân',
  'Tòa án và Viện kiểm sát', 'Cơ quan Đảng và Nhà nước',
  'A', 'Hệ thống hành chính nhà nước gồm Chính phủ và UBND các cấp.', 'medium'
FROM subjects WHERE slug = 'phap-luat-dai-cuong';

INSERT INTO questions (
  subject_id, content, option_a, option_b, option_c, option_d,
  correct_answer, explanation, difficulty
)
SELECT id,
  'Công chức là gì?',
  'Người làm việc trong cơ quan nhà nước',
  'Người được tuyển dụng vào làm việc trong biên chế nhà nước',
  'Người làm việc trong doanh nghiệp nhà nước', 'Người làm việc theo hợp đồng lao động',
  'B', 'Công chức là người được tuyển dụng vào làm việc trong biên chế nhà nước.', 'medium'
FROM subjects WHERE slug = 'phap-luat-dai-cuong';

INSERT INTO questions (
  subject_id, content, option_a, option_b, option_c, option_d,
  correct_answer, explanation, difficulty
)
SELECT id,
  'Nguyên tắc tổ chức và hoạt động của bộ máy nhà nước ta là?',
  'Tập trung dân chủ', 'Phân quyền', 'Tam quyền phân lập', 'Dân chủ trực tiếp',
  'A', 'Nguyên tắc cơ bản là tập trung dân chủ.', 'hard'
FROM subjects WHERE slug = 'phap-luat-dai-cuong';

INSERT INTO questions (
  subject_id, content, option_a, option_b, option_c, option_d,
  correct_answer, explanation, difficulty
)
SELECT id,
  'Theo Luật viên chức, viên chức là gì?',
  'Người làm việc trong cơ quan nhà nước',
  'Người được tuyển dụng theo vị trí việc làm, làm việc tại đơn vị sự nghiệp công lập',
  'Người làm việc trong doanh nghiệp nhà nước', 'Người làm việc theo hợp đồng lao động',
  'B', 'Viên chức là người được tuyển dụng theo vị trí việc làm tại đơn vị sự nghiệp công lập.', 'easy'
FROM subjects WHERE slug = 'luat-vien-chuc-2026';

INSERT INTO questions (
  subject_id, content, option_a, option_b, option_c, option_d,
  correct_answer, explanation, difficulty
)
SELECT id,
  'Hợp đồng làm việc của viên chức có mấy loại?',
  '1 loại', '2 loại', '3 loại', '4 loại',
  'B', 'Có 2 loại: hợp đồng không xác định thời hạn và hợp đồng xác định thời hạn.', 'medium'
FROM subjects WHERE slug = 'luat-vien-chuc-2026';

INSERT INTO questions (
  subject_id, content, option_a, option_b, option_c, option_d,
  correct_answer, explanation, difficulty
)
SELECT id,
  'Quyền nào sau đây không thuộc quyền của viên chức?',
  'Quyền đình công', 'Quyền được bảo đảm lương', 'Quyền được đào tạo', 'Quyền được nghỉ ngơi',
  'A', 'Viên chức không có quyền đình công theo quy định của pháp luật.', 'hard'
FROM subjects WHERE slug = 'luat-vien-chuc-2026';
