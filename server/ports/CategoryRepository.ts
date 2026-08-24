import { Category, NewCategoryInput, UpdateCategoryInput } from "../domain/types";

export interface CategoryRepository {
  listAll(): Promise<Category[]>;
  listDepartments(): Promise<Category[]>;
  listChildren(parentId: string): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
  getBySlug(slug: string): Promise<Category | null>;
  create(input: NewCategoryInput): Promise<Category>;
  update(id: string, input: UpdateCategoryInput): Promise<Category>;
  delete(id: string): Promise<void>;
}
