import { HeroSlide, NewHeroSlideInput, UpdateHeroSlideInput } from "../domain/types";

export interface HeroSlideRepository {
  listActive(): Promise<HeroSlide[]>;
  listAll(): Promise<HeroSlide[]>;
  getById(id: string): Promise<HeroSlide | null>;
  create(input: NewHeroSlideInput): Promise<HeroSlide>;
  update(id: string, input: UpdateHeroSlideInput): Promise<HeroSlide>;
  delete(id: string): Promise<void>;
}
