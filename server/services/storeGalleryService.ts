import { StoreGalleryRepository } from "../ports/StoreGalleryRepository";
import { NewStoreGalleryImageInput, StoreGalleryImage, UpdateStoreGalleryImageInput } from "../domain/types";

// Any number of images can be stored — this only caps how many can be
// *live* on the landing page at the same time.
const MAX_ACTIVE_IMAGES = 3;

export function createStoreGalleryService(repo: StoreGalleryRepository) {
  return {
    listActive(): Promise<StoreGalleryImage[]> {
      return repo.listActive();
    },
    listAll(): Promise<StoreGalleryImage[]> {
      return repo.listAll();
    },
    getById(id: string): Promise<StoreGalleryImage | null> {
      return repo.getById(id);
    },
    async create(input: NewStoreGalleryImageInput): Promise<StoreGalleryImage> {
      if (input.active) {
        const activeCount = (await repo.listActive()).length;
        if (activeCount >= MAX_ACTIVE_IMAGES) {
          throw new Error(`Only ${MAX_ACTIVE_IMAGES} images can be live at once. Deactivate one first.`);
        }
      }
      return repo.create(input);
    },
    async update(id: string, input: UpdateStoreGalleryImageInput): Promise<StoreGalleryImage> {
      if (input.active) {
        const activeImages = await repo.listActive();
        const alreadyActive = activeImages.some((img) => img.id === id);
        if (!alreadyActive && activeImages.length >= MAX_ACTIVE_IMAGES) {
          throw new Error(`Only ${MAX_ACTIVE_IMAGES} images can be live at once. Deactivate one first.`);
        }
      }
      return repo.update(id, input);
    },
    delete(id: string): Promise<void> {
      return repo.delete(id);
    },
  };
}

export type StoreGalleryService = ReturnType<typeof createStoreGalleryService>;
