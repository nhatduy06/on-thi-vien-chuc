-- Migration 002: Seed dữ liệu mẫu cho categories và subjects

-- Insert categories
INSERT OR IGNORE INTO categories (name, slug, description, icon, display_order) VALUES
('Kiến thức chung', 'kien-thuc-chung', 'Các kiến thức cơ bản về quản lý nhà nước, pháp luật, chính sách của Đảng và Nhà nước', '📚', 1),
('Luật viên chức', 'luat-vien-chuc', 'Luật viên chức, quyền và nghĩa vụ của viên chức, quy chế thi tuyển', '⚖️', 2),
('Tin học', 'tin-hoc', 'Tin học văn phòng, sử dụng phần mềm, kiến thức cơ bản về CNTT', '💻', 3),
('Tiếng Anh', 'tieng-anh', 'Từ vựng, ngữ pháp, đọc hiểu tiếng Anh phục vụ thi viên chức', '🌍', 4);

-- Insert subjects for category 1: Kiến thức chung
INSERT OR IGNORE INTO subjects (category_id, name, slug, description, display_order) VALUES
(1, 'Pháp luật đại cương', 'phap-luat-dai-cuong', 'Hệ thống pháp luật Việt Nam, hiến pháp, văn bản quy phạm pháp luật', 1),
(1, 'Quản lý hành chính nhà nước', 'quan-ly-hanh-chinh', 'Tổ chức bộ máy nhà nước, thủ tục hành chính, cải cách hành chính', 2),
(1, 'Đường lối chính sách của Đảng', 'duong-loi-chinh-sach', 'Đường lối phát triển kinh tế - xã hội, chính sách dân tộc, tôn giáo', 3),
(1, 'Kỹ năng soạn thảo văn bản', 'ky-nang-soan-thao', 'Kỹ năng soạn thảo văn bản hành chính, thể thức văn bản', 4);

-- Insert subjects for category 2: Luật viên chức
INSERT OR IGNORE INTO subjects (category_id, name, slug, description, display_order) VALUES
(2, 'Luật viên chức 2026', 'luat-vien-chuc-2026', 'Nội dung Luật viên chức mới nhất, các điều khoản sửa đổi bổ sung', 1),
(2, 'Nghị định hướng dẫn thi hành', 'nghi-dinh-huong-dan', 'Các nghị định, thông tư hướng dẫn thi hành Luật viên chức', 2),
(2, 'Quy chế thi tuyển viên chức', 'quy-che-thi-tuyen', 'Quy chế thi tuyển, xét tuyển viên chức, quy trình tổ chức kỳ thi', 3);

-- Insert subjects for category 3: Tin học
INSERT OR IGNORE INTO subjects (category_id, name, slug, description, display_order) VALUES
(3, 'Tin học văn phòng', 'tin-hoc-van-phong', 'Sử dụng Windows, Microsoft Office (Word, Excel, PowerPoint)', 1),
(3, 'Kiến thức cơ bản về CNTT', 'kien-thuc-co-ban-cntt', 'Kiến thức cơ bản về máy tính, mạng, an toàn thông tin', 2);

-- Insert subjects for category 4: Tiếng Anh
INSERT OR IGNORE INTO subjects (category_id, name, slug, description, display_order) VALUES
(4, 'Ngữ pháp tiếng Anh', 'ngu-phap-tieng-anh', 'Các chủ điểm ngữ pháp cơ bản, câu điều kiện, thì, câu bị động', 1),
(4, 'Đọc hiểu tiếng Anh', 'doc-hieu-tieng-anh', 'Kỹ năng đọc hiểu đoạn văn, tìm ý chính, từ vựng theo chủ đề', 2),
(4, 'Từ vựng tiếng Anh', 'tu-vung-tieng-anh', 'Từ vựng tiếng Anh theo chủ đề hành chính, văn phòng, pháp luật', 3);
