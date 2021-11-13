import { InstagramAccount, UserExt } from 'src/app/com/annaniks/lift/core/models/user';
import { User } from './../../../../core/models/user';
import { ActionTypes } from './../actionTypes';
import { createAction, props } from '@ngrx/store';

export const getCurrentUserAction = createAction(ActionTypes.GET_CURRENT_USER);

export const getCurrentUserSuccessAction = createAction(
  ActionTypes.GET_CURRENT_USER_SUCCESS,
  props<{ currentUser: UserExt }>()
);

export const getCurrentUserFailureAction = createAction(
  ActionTypes.GET_CURRENT_USER_FAILURE
);

export const setCurrentUserInstagramAction = createAction(
  ActionTypes.SET_CURRENT_USER_INSTAGRAM,
  props<{ currentUserInstagram: InstagramAccount }>()
);

export const setCurrentUserInstagramSuccessAction = createAction(
  ActionTypes.SET_CURRENT_USER_INSTAGRAM_SUCCESS,
  props<{ currentUserInstagram: InstagramAccount }>()
);
