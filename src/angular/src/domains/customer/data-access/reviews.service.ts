import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { Review } from './customer.models';
import { MOCK_REVIEWS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  reviews = signal<Review[]>(MOCK_REVIEWS);

  addReview(review: Omit<Review, 'id'>) {
    const newReview: Review = {
      id: `review-${Date.now()}`,
      ...review,
    };
    this.reviews.set([...this.reviews(), newReview]);
  }

  getByOrder(orderId: string): Review | undefined {
    return this.reviews().find(r => r.orderId === orderId);
  }
}
