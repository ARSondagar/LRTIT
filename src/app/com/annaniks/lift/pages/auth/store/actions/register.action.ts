import { TokenResponse } from './../../../../core/models/auth';
import { RegisterData } from './../../../../core/models/register';
import { ActionTypes } from "./../actionTypes";
import { createAction, props } from "@ngrx/store";

export const registerAction = createAction(
  ActionTypes.REGISTER,
  props<{registerData: RegisterData}>()
);

export const registerSuccessAction = createAction(
  ActionTypes.REGISTER_SUCCESS,
  props<{tokenResponse: TokenResponse}>()
);

export const registerFailureAction = createAction(
  ActionTypes.REGISTER_FAILURE,
  props<{errors: string}>()
);
