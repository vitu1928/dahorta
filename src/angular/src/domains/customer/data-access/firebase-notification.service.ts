import { Injectable, signal, effect, inject } from '@angular/core';
import { NotificationService, NotificationPreferences, NotificationSettingPermission } from './notification.service';
import { Firestore, collection, doc, setDoc, onSnapshot, query, where, addDoc } from '@angular/fire/firestore';
import { AuthService } from '../../auth/data-access/auth.service';

const STORAGE_KEY = 'dahorta_notification_prefs';
const DEFAULT_PREFS: NotificationPreferences = {
  orderStatus: true,
  promotions: false,
  coupons: true,
  motoboyApproaching: true,
};

@Injectable({ providedIn: 'root' })
export class FirebaseNotificationService extends NotificationService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  override preferences = signal<NotificationPreferences>(this.loadPrefs());
  override permissionStatus = signal<NotificationSettingPermission>(this.getBrowserPermission());

  private unsubscribe: (() => void) | null = null;

  constructor() {
    super();
  }

  private loadPrefs(): NotificationPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { ...DEFAULT_PREFS };
    } catch {
      return { ...DEFAULT_PREFS };
    }
  }

  private getBrowserPermission(): NotificationSettingPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission as NotificationSettingPermission;
    }
    return 'denied';
  }

  override updatePreference(key: keyof NotificationPreferences, value: boolean): void {
    this.preferences.update(prefs => {
      const updated = { ...prefs, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save notification preferences', e);
      }
      return updated;
    });
  }

  override async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      this.permissionStatus.set('denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionStatus.set(permission as NotificationSettingPermission);
      return permission === 'granted';
    } catch {
      this.permissionStatus.set('denied');
      return false;
    }
  }

  override sendNotification(userId: string, title: string, body: string, type: keyof NotificationPreferences): void {
    const user = this.authService.currentUser();
    if (user && user.id === userId) {
      this.triggerLocalNotification(title, body, type);
    }
  }

  private triggerLocalNotification(title: string, body: string, type: keyof NotificationPreferences): void {
    if (!this.preferences()[type]) {
      console.log(`[Notification Service] Blocked "${title}" because "${type}" preferences are disabled.`);
      return;
    }

    if (this.permissionStatus() === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/assets/logo.png', 
        });
      } catch (e) {
        console.warn('Failed to trigger standard browser Notification:', e);
        console.log(`[Push Notification] ${title} - ${body}`);
      }
    } else {
      console.log(`[Push Notification - Permission Blocked/Default] ${title}: ${body}`);
    }
  }
}
