import { Injectable, signal } from '@angular/core';
import { NotificationService, NotificationPreferences, NotificationSettingPermission } from './notification.service';

const STORAGE_KEY = 'dahorta_notification_prefs';
const DEFAULT_PREFS: NotificationPreferences = {
  orderStatus: true,
  promotions: false,
  coupons: true,
  motoboyApproaching: true,
};

@Injectable({ providedIn: 'root' })
export class MockNotificationService extends NotificationService {
  override preferences = signal<NotificationPreferences>(this.loadPrefs());
  override permissionStatus = signal<NotificationSettingPermission>(this.getBrowserPermission());

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

  override sendNotification(title: string, body: string, type: keyof NotificationPreferences): void {
    // Check if the user has enabled notifications for this specific type
    if (!this.preferences()[type]) {
      console.log(`[Notification Service] Blocked "${title}" because "${type}" preferences are disabled.`);
      return;
    }

    // Check browser permission
    if (this.permissionStatus() === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/assets/logo.png', // Fallback icon path
        });
      } catch (e) {
        console.warn('Failed to trigger standard browser Notification:', e);
        // Fallback fallback console print
        console.log(`[Push Notification] ${title} - ${body}`);
      }
    } else {
      console.log(`[Push Notification - Permission Blocked/Default] ${title}: ${body}`);
    }

    // FCM Integration Blueprint:
    // Here we would call:
    // firebaseMessaging.sendMessageToToken(fcmToken, { title, body })
  }
}
