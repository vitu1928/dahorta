import { Injectable, signal } from '@angular/core';
import { ReviewsService } from './reviews.service';
import { Review } from './customer.models';
import { MOCK_REVIEWS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class MockReviewsService extends ReviewsService {
  override readonly reviews = signal<Review[]>(MOCK_REVIEWS);

  override addReview(review: Omit<Review, 'id'>): void {
    const newReview: Review = {
      id: `review-${Date.now()}`,
      ...review,
    };
    this.reviews.set([...this.reviews(), newReview]);
  }

  override getByOrder(orderId: string): Review | undefined {
    return this.reviews().find(r => r.orderId === orderId);
  }
}
