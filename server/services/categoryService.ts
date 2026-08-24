import { CategoryRepository } from "../ports/CategoryRepository";
import {
  Category,
  CategoryWithChildren,
  NewCategoryInput,
  UpdateCategoryInput,
} from "../domain/types";

export function createCategoryService(categoryRepository: CategoryRepository) {
  return {
    async getNavTree(): Promise<CategoryWithChildren[]> {
      const departments = await categoryRepository.listDepartments();
      return Promise.all(
        departments.map(async (department) => ({
          ...department,
          children: await categoryRepository.listChildren(department.id),
        }))
      );
    },

    async listAllFlat(): Promise<(Category & { parentName: string | null })[]> {
      const all = await categoryRepository.listAll();
      const byId = new Map(all.map((category) => [category.id, category]));
      return all.map((category) => ({
        ...category,
        parentName: category.parentId ? byId.get(category.parentId)?.name ?? null : null,
      }));
    },

    getBySlug(slug: string): Promise<Category | null> {
      return categoryRepository.getBySlug(slug);
    },

    getById(id: string): Promise<Category | null> {
      return categoryRepository.getById(id);
    },

    // If `categoryId` is a department, returns it plus all its children's ids (browsing a
    // department shows everything under it). Otherwise (a model, or a department with no
    // children) returns just the id itself.
    async resolveFilterIds(categoryId: string): Promise<string[]> {
      const children = await categoryRepository.listChildren(categoryId);
      return children.length > 0 ? [categoryId, ...children.map((c) => c.id)] : [categoryId];
    },

    async create(input: NewCategoryInput): Promise<Category> {
      if (input.parentId) {
        const parent = await categoryRepository.getById(input.parentId);
        if (parent?.parentId) {
          throw new Error("Categories can only be nested one level deep");
        }
      }
      return categoryRepository.create(input);
    },

    async update(id: string, input: UpdateCategoryInput): Promise<Category> {
      if (input.parentId) {
        const parent = await categoryRepository.getById(input.parentId);
        if (parent?.parentId) {
          throw new Error("Categories can only be nested one level deep");
        }

        const existingChildren = await categoryRepository.listChildren(id);
        if (existingChildren.length > 0) {
          throw new Error("A category with its own sub-categories can't be nested under another one");
        }
      }
      return categoryRepository.update(id, input);
    },

    delete(id: string): Promise<void> {
      return categoryRepository.delete(id);
    },
  };
}

export type CategoryService = ReturnType<typeof createCategoryService>;
