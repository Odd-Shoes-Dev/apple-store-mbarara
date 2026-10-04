import { NewReviewInput, Review } from "../domain/types";

export interface ReviewRepository {
  listApproved(productId: string): Promise<Review[]>;
  listAll(): Promise<Review[]>;
  create(input: NewReviewInput): Promise<Review>;
  approve(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}
