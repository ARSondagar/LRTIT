import { InstagramAccount, UserExt } from 'src/app/com/annaniks/lift/core/models/user';
import { currentInstagramSelector } from './../selectors';
import {
  setCurrentUserInstagramAction,
  setCurrentUserInstagramSuccessAction,
} from './../actions/getCurrentUser.action';
import { CookieService } from 'ngx-cookie';
import { ServerResponse } from './../../../../core/models/server-response';
import { User } from './../../../../core/models/user';
import { AuthService } from './../../auth.service';
import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { map, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  getCurrentUserAction,
  getCurrentUserFailureAction,
  getCurrentUserSuccessAction,
} from '../actions/getCurrentUser.action';
import { select, Store } from '@ngrx/store';
import { Router } from '@angular/router';

@Injectable()
export class GetCurrentUserEffect {
  getCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getCurrentUserAction),
      switchMap(() => {
        const token = this._cookieService.get('accessTokenS');
        if (!token) {
          return of(getCurrentUserFailureAction());
        }

        return this.authService.getCurrentUser()
        .pipe(
          map((data: ServerResponse<UserExt>) => {
            const currentUser = data.data;
            let currentInstagram: InstagramAccount;
            let currentInstagramLocaLStorage: InstagramAccount;
            try {
              currentInstagramLocaLStorage = JSON.parse(
                localStorage.getItem('currentInstagramUser')
              );
            } catch (error) {
              currentInstagramLocaLStorage = null;
            }

            this.store
              .pipe(select(currentInstagramSelector))
              .subscribe((resp) => {
                currentInstagram = resp;
                this.setActiveInstagramAccount(currentInstagramLocaLStorage, resp, currentUser);
              });
            return getCurrentUserSuccessAction({ currentUser });
          }),

          catchError(() => {
            return of(getCurrentUserFailureAction());
          })
        );
      })
    )
  );

  setCurrentInstagram$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setCurrentUserInstagramAction),
      switchMap(({ currentUserInstagram }) => {
        localStorage.setItem(
          'currentInstagramUser',
          JSON.stringify(currentUserInstagram)
        );
        return of(
          setCurrentUserInstagramSuccessAction({ currentUserInstagram })
        );
      })
    )
  );

  setActiveInstagramAccount( currentInstagramLocaLStorage: InstagramAccount,
                             currentInstagram: InstagramAccount,
                             currentUser: User): void {

    const activeInstagrams = currentUser.instagramAccounts.filter(x => x.active);
    if (!currentInstagram || !currentInstagram.active) {
      let currentUserInstagram: InstagramAccount;
      if (!currentInstagramLocaLStorage) {  // Local storage is empty?
        if (activeInstagrams.length > 0) {
          currentUserInstagram = activeInstagrams[0]; // Use first active account
        } else {
          currentUserInstagram = null;
        }
      } else {  // Local storage has a record
        if (activeInstagrams.length > 0) {
          currentUserInstagram = activeInstagrams.find(
            x => x.id === currentInstagramLocaLStorage.id
          );
          if (!currentUserInstagram) {
            currentUserInstagram = activeInstagrams[0];
            localStorage.removeItem('currentInstagramUser');
          }
        } else {    // activeInstagrams.length < 1
          localStorage.removeItem('currentInstagramUser');
          currentUserInstagram = null;
        }
      }
      this.store.dispatch(
        setCurrentUserInstagramAction({ currentUserInstagram })
      );
    }
  }

  constructor(
    private actions$: Actions,
    private store: Store,
    private _cookieService: CookieService,
    private authService: AuthService,
    private _router: Router
  ) {}

}
