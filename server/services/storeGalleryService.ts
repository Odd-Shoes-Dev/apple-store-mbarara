import { StoreGalleryRepository } from "../ports/StoreGalleryRepository";
import { NewStoreGalleryImageInput, StoreGalleryImage, UpdateStoreGalleryImageInput } from "../domain/types";

const MAX_IMAGES = 3;

export function createStoreGalleryService(repo: StoreGalleryRepository) {
  return {
    listActive(): Promise<StoreGalleryImage[]> {
      return repo.listActive();
    },
    listAll(): Promise<StoreGalleryImage[]> {
      return repo.listAll();
    },
    async create(input: NewStoreGalleryImageInput): Promise<StoreGalleryImage> {
      const existing = await repo.listAll();
      if (existing.length >= MAX_IMAGES) {
        throw new Error(`You can only have up to ${MAX_IMAGES} gallery images`);
      }
      return repo.create(input);
    },
    update(id: string, input: UpdateStoreGalleryImageInput): Promise<StoreGalleryImage> {
      return repo.update(id, input);
    },
    delete(id: string): Promise<void> {
      return repo.delete(id);
    },
  };
}

export type StoreGalleryService = ReturnType<typeof createStoreGalleryService>;
