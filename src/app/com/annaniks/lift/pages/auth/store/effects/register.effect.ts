import { getCurrentUserAction } from './../actions/getCurrentUser.action';
import { HttpErrorResponse } from '@angular/common/http';
import { ServerResponse } from 'src/app/com/annaniks/lift/core/models/server-response';
import { TokenResponse } from './../../../../core/models/auth';
import { User } from "./../../../../core/models/user";
import { map, catchError, switchMap } from "rxjs/operators";
import { AuthService } from "../../auth.service";
import {
  registerAction,
  registerSuccessAction,
  registerFailureAction,
} from "./../actions/register.action";
import { createEffect, Actions, ofType } from "@ngrx/effects";
import { Injectable } from "@angular/core";
import { of } from "rxjs";
import { Store } from '@ngrx/store';

@Injectable()
export class RegisterEffect {
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(registerAction),
      switchMap(({ registerData }) => {
        return this.authService.register(registerData).pipe(
          map((data: ServerResponse<TokenResponse>) => {
            const tokenResponse = data.data;

            this.store.dispatch(getCurrentUserAction());

            return registerSuccessAction({ tokenResponse });
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            return of(registerFailureAction({errors: errorResponse.error.message}))
          })
        );
      })
    )
  );

  constructor(private actions$: Actions,
    private store: Store,
    private authService: AuthService) {}
}
