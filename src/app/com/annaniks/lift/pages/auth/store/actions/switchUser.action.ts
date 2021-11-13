import { InstagramAccount } from 'src/app/com/annaniks/lift/core/models/user';
import { ActionTypes } from "./../actionTypes";
import { createAction, props } from "@ngrx/store";

export const switchUserAction = createAction(
  ActionTypes.SWITCH_USER,
  props<{ instagramAccount: InstagramAccount }>()
);
export const switchUserInstagramAction = createAction(  // Changes instagram account WITHOUT side effects
  ActionTypes.SWITCH_USER_INSTAGRAM ,
  props<{ instagramAccount: InstagramAccount }>()
);

export const switchUserSuccessAction = createAction(
  ActionTypes.SWITCH_USER_SUCCESS,
  props<{ instagramAccount: InstagramAccount }>()
);

export const switchUserFailureAction = createAction(
  ActionTypes.SWITCH_USER_FAILURE
);

export const removeCurrentUserAction = createAction(
  ActionTypes.REMOVE_CURRENT_INSTAGRAM
)
