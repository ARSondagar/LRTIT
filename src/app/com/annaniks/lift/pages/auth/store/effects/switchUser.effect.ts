import { getCurrentUserAction } from "./../actions/getCurrentUser.action";
import {
  removeCurrentUserAction,
  switchUserFailureAction,
  switchUserSuccessAction,
} from "./../actions/switchUser.action";
import { AuthService } from "./../../auth.service";
import { Injectable } from "@angular/core";
import { createEffect, Actions, ofType } from "@ngrx/effects";
import { map, catchError, switchMap } from "rxjs/operators";
import { of } from "rxjs";
import { switchUserAction } from "../actions/switchUser.action";
import { Store } from "@ngrx/store";

@Injectable()
export class SwitchUserEffect {
  switchUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(switchUserAction),
      switchMap(({ instagramAccount }) => {
        if (!instagramAccount.id) {
          this.store.dispatch(removeCurrentUserAction());
          this.store.dispatch(getCurrentUserAction())

          return of(switchUserFailureAction());
        } else {
          return this.authService.switchUser(instagramAccount.id).pipe(
            map(() => {
              localStorage.setItem(
                "currentInstagramUser",
                JSON.stringify(instagramAccount)
              );
              this.store.dispatch(getCurrentUserAction());
              return switchUserSuccessAction({ instagramAccount });
            }),

            catchError(() => {
              return of(switchUserFailureAction());
            })
          );
        }
      })
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private authService: AuthService
  ) {}
}
