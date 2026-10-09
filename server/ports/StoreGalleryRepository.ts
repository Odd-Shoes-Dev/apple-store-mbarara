import { NewStoreGalleryImageInput, StoreGalleryImage, UpdateStoreGalleryImageInput } from "../domain/types";

export interface StoreGalleryRepository {
  listActive(): Promise<StoreGalleryImage[]>;
  listAll(): Promise<StoreGalleryImage[]>;
  getById(id: string): Promise<StoreGalleryImage | null>;
  create(input: NewStoreGalleryImageInput): Promise<StoreGalleryImage>;
  update(id: string, input: UpdateStoreGalleryImageInput): Promise<StoreGalleryImage>;
  delete(id: string): Promise<void>;
}
