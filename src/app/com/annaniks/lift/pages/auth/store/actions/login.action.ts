import { TokenResponse } from './../../../../core/models/auth';
import { LoginData } from './../../../../core/models/login';
import { ActionTypes } from './../actionTypes';
import {createAction, props} from '@ngrx/store'


export const loginAction = createAction(
  ActionTypes.LOGIN,
  props<{request: LoginData}>()
)

export const loginSuccessAction = createAction(
  ActionTypes.LOGIN_SUCCESS,
  props<{tokenResponse: TokenResponse}>()
)

export const loginFailureAction = createAction(
  ActionTypes.LOGIN_FAILURE,
  props<{errors: string}>()
)
