import { getCurrentUserAction } from './../actions/getCurrentUser.action';
import { CookieService } from 'ngx-cookie';
import { TokenResponse } from './../../../../core/models/auth';
import { ServerResponse } from 'src/app/com/annaniks/lift/core/models/server-response';
import { loginFailureAction, loginSuccessAction, loginAction } from './../actions/login.action';
import { LoginData } from './../../../../core/models/login';
import {Injectable} from '@angular/core'
import {createEffect, Actions, ofType} from '@ngrx/effects'
import {map, catchError, switchMap, tap} from 'rxjs/operators'
import {HttpErrorResponse} from '@angular/common/http'
import {Router} from '@angular/router'
import {of} from 'rxjs'
import { AuthService } from '../../auth.service';
import { Store } from '@ngrx/store';

@Injectable()
export class LoginEffect {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginAction),
      switchMap(({request}) => {
        return this.authService.login(request).pipe(
          map((data: ServerResponse<TokenResponse>) => {
            const tokenResponse = data.data;

            const expiredDate = new Date();
            expiredDate.setDate( expiredDate.getDate() + 125 );
            const options = {
              expires: expiredDate
            }
            this.cookieService.put('accessTokenS', tokenResponse.accessToken, options);
            this.cookieService.put('refreshTokenS', tokenResponse.refreshToken, options);
            this.store.dispatch(getCurrentUserAction());

            return loginSuccessAction({tokenResponse})
          }),

          catchError((errorResponse: HttpErrorResponse) => {
            return of(loginFailureAction({errors: errorResponse.error.message}))
          })
        )
      })
    )
  )

  redirectAfterSubmit$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccessAction),
        tap(() => {
          setTimeout(() => {
            this.router.navigateByUrl('/statistics/preview')
          }, 2000);
        })
      ),
    {dispatch: false}
  )

  constructor(
    private actions$: Actions,
    private cookieService: CookieService,
    private authService: AuthService,
    private store: Store,
    private router: Router
  ) {}
}
