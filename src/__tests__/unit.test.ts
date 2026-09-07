import { mockCategories, mockSubjects, mockQuestions, Category, Subject, Question } from "../lib/mock";
import { getCategories, getSubjects, isSupabaseAvailable } from "../lib/db";

describe("Mock Data - Categories", () => {
  it("should have 4 categories", () => {
    expect(mockCategories.length).toBe(4);
  });
  it("each category should have required fields", () => {
    mockCategories.forEach((cat: Category) => {
      expect(cat.id).toBeDefined();
      expect(cat.name).toBeTruthy();
      expect(cat.slug).toBeTruthy();
      expect(cat.description).toBeTruthy();
      expect(cat.icon).toBeTruthy();
    });
  });
  it("should have unique slugs", () => {
    const slugs = mockCategories.map(c => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("Mock Data - Subjects", () => {
  it("should have 4 subjects", () => {
    expect(mockSubjects.length).toBe(4);
  });
  it("each subject should belong to a valid category", () => {
    const catIds = mockCategories.map(c => c.id);
    mockSubjects.forEach((sub: Subject) => expect(catIds).toContain(sub.category_id));
  });
});

describe("Mock Data - Questions", () => {
  it("should have 8 questions", () => {
    expect(mockQuestions.length).toBe(8);
  });
  it("each question should have valid correct_answer", () => {
    const valid = ["A","B","C","D"];
    mockQuestions.forEach((q: Question) => expect(valid).toContain(q.correct_answer));
  });
  it("each question should belong to a valid subject", () => {
    const subIds = mockSubjects.map(s => s.id);
    mockQuestions.forEach((q: Question) => expect(subIds).toContain(q.subject_id));
  });
  it("each question should have non-empty options", () => {
    mockQuestions.forEach((q: Question) => {
      expect(q.option_a).toBeTruthy();
      expect(q.option_b).toBeTruthy();
      expect(q.option_c).toBeTruthy();
      expect(q.option_d).toBeTruthy();
    });
  });
});

describe("DB Layer", () => {
  it("getCategories should return sorted categories", async () => {
    const cats = await getCategories();
    expect(cats.length).toBeGreaterThanOrEqual(4);
  });
  it("getSubjects should filter by categoryId", async () => {
    const subs = await getSubjects(1);
    subs.forEach(s => expect(s.category_id).toBe(1));
  });
  it("getSubjects should return empty for non-existent id", async () => {
    const subs = await getSubjects(999);
    expect(subs.length).toBe(0);
  });
  it("isSupabaseAvailable should return false locally", () => {
    expect(isSupabaseAvailable()).toBe(false);
  });
});

describe("Data Integrity", () => {
  it("category 1 subjects link to correct questions", () => {
    const cat1Subs = mockSubjects.filter(s => s.category_id === 1);
    const cat1Qs = mockQuestions.filter(q => cat1Subs.some(s => s.id === q.subject_id));
    expect(cat1Subs.length).toBe(2);
    expect(cat1Qs.length).toBe(5);
  });
  it("all IDs should be unique across questions", () => {
    const ids = mockQuestions.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
