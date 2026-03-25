import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiService } from '../api/api.service';

export interface Notification {
  id: number;
  title: string;
  message: string;
  lien?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiService);

  getNotifications(): Observable<Notification[]> {
    return this.api
      .get<{ notifications: Notification[] }>('/notification/user')
      .pipe(
        map((res) => res.notifications ?? []),
        catchError(() => of([])),
      );
  }

  markAsRead(id: number): Observable<unknown> {
    return this.api.post('/notification/lecture', { notification: id });
  }

  markAllAsRead(): Observable<unknown> {
    return this.api.post('/notification/readAll', {});
  }
}
