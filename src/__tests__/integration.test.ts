import { getCategories, getSubjects } from "../lib/db";

describe("Integration - DB to Mock Data", () => {
  it("should fetch categories and subjects successfully", async () => {
    const categories = await getCategories();
    expect(categories.length).toBeGreaterThan(0);

    const firstCategory = categories[0];
    const subjects = await getSubjects(firstCategory.id);
    expect(subjects.length).toBeGreaterThanOrEqual(0);
  });
});