import { Injectable, WritableSignal, Signal } from '@angular/core';

export interface NotificationPreferences {
  orderStatus: boolean;
  promotions: boolean;
  coupons: boolean;
  motoboyApproaching: boolean;
}

@Injectable({ providedIn: 'root' })
export abstract class NotificationService {
  abstract readonly preferences: WritableSignal<NotificationPreferences>;
  abstract readonly permissionStatus: WritableSignal<NotificationSettingPermission>;

  abstract updatePreference(key: keyof NotificationPreferences, value: boolean): void;
  abstract requestPermission(): Promise<boolean>;
  abstract sendNotification(title: string, body: string, type: keyof NotificationPreferences): void;
}

export type NotificationSettingPermission = 'default' | 'granted' | 'denied';
