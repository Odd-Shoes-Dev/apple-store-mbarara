import { ReviewRepository } from "../ports/ReviewRepository";
import { NewReviewInput, Review } from "../domain/types";

export function createReviewService(reviewRepository: ReviewRepository) {
  return {
    listApproved(productId: string): Promise<Review[]> {
      return reviewRepository.listApproved(productId);
    },

    listAll(): Promise<Review[]> {
      return reviewRepository.listAll();
    },

    submit(input: NewReviewInput): Promise<Review> {
      return reviewRepository.create(input);
    },

    approve(id: string): Promise<void> {
      return reviewRepository.approve(id);
    },

    delete(id: string): Promise<void> {
      return reviewRepository.delete(id);
    },
  };
}

export type ReviewService = ReturnType<typeof createReviewService>;
