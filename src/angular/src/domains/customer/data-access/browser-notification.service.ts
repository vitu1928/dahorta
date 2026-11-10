import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '../../auth/data-access/auth.service';
import { NotificationPreferences, NotificationService, NotificationSettingPermission } from './notification.service';

const STORAGE_KEY = 'dahorta_notification_prefs';
const DEFAULT_PREFS: NotificationPreferences = {
  orderStatus: true,
  promotions: false,
  coupons: true,
  motoboyApproaching: true
};

@Injectable({ providedIn: 'root' })
export class BrowserNotificationService extends NotificationService {
  private readonly auth = inject(AuthService);
  override readonly preferences = signal<NotificationPreferences>(this.loadPreferences());
  override readonly permissionStatus = signal<NotificationSettingPermission>(
    typeof Notification === 'undefined' ? 'denied' : Notification.permission
  );

  override updatePreference(key: keyof NotificationPreferences, value: boolean): void {
    this.preferences.update(preferences => {
      const updated = { ...preferences, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Não foi possível salvar preferências de notificação:', error);
      }
      return updated;
    });
  }

  override async requestPermission(): Promise<boolean> {
    if (typeof Notification === 'undefined') {
      this.permissionStatus.set('denied');
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      this.permissionStatus.set(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Não foi possível solicitar permissão para notificações:', error);
      this.permissionStatus.set(Notification.permission);
      return false;
    }
  }

  override sendNotification(userId: string, title: string, body: string, type: keyof NotificationPreferences): void {
    if (this.auth.currentUser()?.id !== userId || !this.preferences()[type]) return;
    if (this.permissionStatus() === 'granted') new Notification(title, { body, icon: '/assets/logo.png' });
  }

  private loadPreferences(): NotificationPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : { ...DEFAULT_PREFS };
    } catch (error) {
      console.error('Não foi possível carregar preferências de notificação:', error);
      return { ...DEFAULT_PREFS };
    }
  }
}
