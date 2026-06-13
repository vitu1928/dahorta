import { Injectable, WritableSignal } from '@angular/core';
import { Review } from './customer.models';

@Injectable({ providedIn: 'root' })
export abstract class ReviewsService {
  abstract readonly reviews: WritableSignal<Review[]>;

  abstract addReview(review: Omit<Review, 'id'>): void | Promise<void>;
  abstract getByOrder(orderId: string): Review | undefined;
}
