import { HeroSlideRepository } from "../ports/HeroSlideRepository";
import { HeroSlide, NewHeroSlideInput, UpdateHeroSlideInput } from "../domain/types";

export function createHeroService(repo: HeroSlideRepository) {
  return {
    listActive(): Promise<HeroSlide[]> {
      return repo.listActive();
    },
    listAll(): Promise<HeroSlide[]> {
      return repo.listAll();
    },
    getById(id: string): Promise<HeroSlide | null> {
      return repo.getById(id);
    },
    create(input: NewHeroSlideInput): Promise<HeroSlide> {
      return repo.create(input);
    },
    update(id: string, input: UpdateHeroSlideInput): Promise<HeroSlide> {
      return repo.update(id, input);
    },
    delete(id: string): Promise<void> {
      return repo.delete(id);
    },
  };
}

export type HeroService = ReturnType<typeof createHeroService>;
