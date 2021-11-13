export enum ActionTypes {
  REGISTER = '[Auth] Register',
  REGISTER_SUCCESS = '[Auth] Register succes',
  REGISTER_FAILURE = '[Auth] Register failure',

  LOGIN = '[Auth] Login',
  LOGIN_SUCCESS = '[Auth] Login success',
  LOGIN_FAILURE = '[Auth] Login failure',

  GET_CURRENT_USER = '[Auth] Get current user',
  GET_CURRENT_USER_SUCCESS = '[Auth] Get current user success',
  GET_CURRENT_USER_FAILURE = '[Auth] Get current user failure',

  REMOVE_CURRENT_INSTAGRAM = '[Auth] Remove current instagram',

  SET_CURRENT_USER_INSTAGRAM = '[Auth] Set current user instagram',
  SET_CURRENT_USER_INSTAGRAM_SUCCESS = '[Auth] Set current user instagram success',

  SWITCH_USER = '[Auth] Switch user',
  SWITCH_USER_SUCCESS = '[Auth] Switch user success',
  SWITCH_USER_FAILURE = '[Auth] Switch user failure',
  SWITCH_USER_INSTAGRAM = '[Auth] Switch user instagram',
}
