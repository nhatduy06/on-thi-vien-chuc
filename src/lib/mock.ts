export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
}

export interface Subject {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  question_count: number;
}

export interface Question {
  id: number;
  subject_id: number;
  content: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const mockCategories: Category[] = [
  { id: 1, name: 'Kiến thức chung', slug: 'kien-thuc-chung', description: 'Các kiến thức cơ bản về quản lý nhà nước, pháp luật...', icon: 'book-open', display_order: 1 },
  { id: 2, name: 'Luật viên chức', slug: 'luat-vien-chuc', description: 'Luật viên chức năm 2026, quyền và nghĩa vụ...', icon: 'landmark', display_order: 2 },
  { id: 3, name: 'Tin học', slug: 'tin-hoc', description: 'Tin học văn phòng, sử dụng phần mềm...', icon: 'monitor', display_order: 3 },
  { id: 4, name: 'Tiếng Anh', slug: 'tieng-anh', description: 'Từ vựng, ngữ pháp phục vụ thi viên chức...', icon: 'languages', display_order: 4 },
];

export const mockSubjects: Subject[] = [
  { id: 1, category_id: 1, name: 'Pháp luật đại cương', slug: 'phap-luat-dai-cuong', description: 'Hệ thống pháp luật Việt Nam, hiến pháp...', display_order: 1, question_count: 50 },
  { id: 2, category_id: 1, name: 'Quản lý hành chính nhà nước', slug: 'quan-ly-hanh-chinh', description: 'Tổ chức bộ máy nhà nước, thủ tục hành chính...', display_order: 2, question_count: 45 },
  { id: 3, category_id: 2, name: 'Luật viên chức 2026', slug: 'luat-vien-chuc-2026', description: 'Nội dung luật viên chức mới nhất...', display_order: 1, question_count: 100 },
  { id: 4, category_id: 3, name: 'Tin học văn phòng', slug: 'tin-hoc-van-phong', description: 'Sử dụng Windows, Office, Internet...', display_order: 1, question_count: 60 },
];

export const mockQuestions: Question[] = [
  { id: 1, subject_id: 1, content: 'Theo Hiến pháp nước CHXHCN Việt Nam, cơ quan quyền lực nhà nước cao nhất là?', option_a: 'Chính phủ', option_b: 'Quốc hội', option_c: 'Tòa án nhân dân tối cao', option_d: 'Viện kiểm sát nhân dân tối cao', correct_answer: 'B', explanation: 'Quốc hội là cơ quan quyền lực nhà nước cao nhất theo quy định của Hiến pháp.', difficulty: 'easy' },
  { id: 2, subject_id: 1, content: 'Văn bản quy phạm pháp luật nào có hiệu lực pháp lý cao nhất?', option_a: 'Luật', option_b: 'Pháp lệnh', option_c: 'Hiến pháp', option_d: 'Nghị định', correct_answer: 'C', explanation: 'Hiến pháp là văn bản quy phạm pháp luật có hiệu lực pháp lý cao nhất.', difficulty: 'easy' },
  { id: 3, subject_id: 1, content: 'Hệ thống cơ quan hành chính nhà nước ở Việt Nam bao gồm?', option_a: 'Chính phủ và Ủy ban nhân dân các cấp', option_b: 'Quốc hội và Hội đồng nhân dân', option_c: 'Tòa án và Viện kiểm sát', option_d: 'Cơ quan Đảng và Nhà nước', correct_answer: 'A', explanation: 'Hệ thống hành chính nhà nước gồm Chính phủ và UBND các cấp.', difficulty: 'medium' },
  { id: 4, subject_id: 1, content: 'Công chức là gì?', option_a: 'Người làm việc trong cơ quan nhà nước', option_b: 'Người được tuyển dụng vào làm việc trong biên chế nhà nước', option_c: 'Người làm việc trong doanh nghiệp nhà nước', option_d: 'Người làm việc theo hợp đồng lao động', correct_answer: 'B', explanation: 'Công chức là người được tuyển dụng vào làm việc trong biên chế nhà nước.', difficulty: 'medium' },
  { id: 5, subject_id: 1, content: 'Nguyên tắc tổ chức và hoạt động của bộ máy nhà nước ta là?', option_a: 'Tập trung dân chủ', option_b: 'Phân quyền', option_c: 'Tam quyền phân lập', option_d: 'Dân chủ trực tiếp', correct_answer: 'A', explanation: 'Nguyên tắc cơ bản là tập trung dân chủ.', difficulty: 'hard' },
  { id: 6, subject_id: 3, content: 'Theo Luật viên chức, viên chức là gì?', option_a: 'Người làm việc trong cơ quan nhà nước', option_b: 'Người được tuyển dụng theo vị trí việc làm, làm việc tại đơn vị sự nghiệp công lập', option_c: 'Người làm việc trong doanh nghiệp nhà nước', option_d: 'Người làm việc theo hợp đồng lao động', correct_answer: 'B', explanation: 'Viên chức là người được tuyển dụng theo vị trí việc làm tại đơn vị sự nghiệp công lập.', difficulty: 'easy' },
  { id: 7, subject_id: 3, content: 'Hợp đồng làm việc của viên chức có mấy loại?', option_a: '1 loại', option_b: '2 loại', option_c: '3 loại', option_d: '4 loại', correct_answer: 'B', explanation: 'Có 2 loại: hợp đồng không xác định thời hạn và hợp đồng xác định thời hạn.', difficulty: 'medium' },
  { id: 8, subject_id: 3, content: 'Quyền nào sau đây không thuộc quyền của viên chức?', option_a: 'Quyền đình công', option_b: 'Quyền được bảo đảm lương', option_c: 'Quyền được đào tạo', option_d: 'Quyền được nghỉ ngơi', correct_answer: 'A', explanation: 'Viên chức không có quyền đình công theo quy định của pháp luật.', difficulty: 'hard' },
];
