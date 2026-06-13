import { Injectable, inject, signal } from '@angular/core';
import { ReviewsService } from './reviews.service';
import { Review } from './customer.models';
import { Firestore, collection, doc, setDoc, onSnapshot } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class FirebaseReviewsService extends ReviewsService {
  private firestore = inject(Firestore);

  override readonly reviews = signal<Review[]>([]);

  constructor() {
    super();

    // Listen to reviews in real time
    const reviewsCol = collection(this.firestore, 'reviews');
    onSnapshot(reviewsCol, (snapshot) => {
      const list: Review[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          orderId: data['orderId'],
          stars: data['stars'],
          comment: data['comment'],
          createdAt: data['createdAt']?.toDate() || new Date(),
          customerId: data['customerId'],
          customerName: data['customerName']
        } as Review);
      });
      this.reviews.set(list);
    }, (err) => {
      console.error('Erro ao carregar avaliações do Firestore:', err);
    });
  }

  override async addReview(review: Omit<Review, 'id'>): Promise<void> {
    try {
      const reviewsCol = collection(this.firestore, 'reviews');
      const docRef = doc(reviewsCol);
      const newReview = {
        ...review,
        createdAt: new Date()
      };
      await setDoc(docRef, newReview);
    } catch (err) {
      console.error('Erro ao adicionar avaliação no Firestore:', err);
    }
  }

  override getByOrder(orderId: string): Review | undefined {
    return this.reviews().find(r => r.orderId === orderId);
  }
}
