import { switchUserAction, switchUserFailureAction, switchUserSuccessAction, removeCurrentUserAction, switchUserInstagramAction } from './actions/switchUser.action';
import { loginFailureAction, loginSuccessAction, loginAction } from './actions/login.action';
import { registerAction, registerFailureAction, registerSuccessAction } from "./actions/register.action";
import {
  getCurrentUserAction,
  getCurrentUserSuccessAction,
  getCurrentUserFailureAction,
  setCurrentUserInstagramAction,
  setCurrentUserInstagramSuccessAction,
} from "./actions/getCurrentUser.action";
import { createReducer, on, Action } from "@ngrx/store";
import { AuthStateInterface } from "./types/authState.interface";

const initialState: AuthStateInterface = {
  isSubmitting: false,
  isLoading: false,
  currentUser: null,
  currentInstagram: null,
  validationErrors: null,
  isLoggedIn: null,
  test: 0,
  tokenResponse: null
};

const authReducer = createReducer(
  initialState,
  on(
    registerAction,
    (state): AuthStateInterface => ({
      ...state,
      isSubmitting: true,
      validationErrors: null
    })
  ),
  on(
    registerSuccessAction,
    (state, action): AuthStateInterface => ({
      ...state,
      isSubmitting: false,
      isLoggedIn: true,
      tokenResponse: action.tokenResponse
    })
  ),
  on(
    registerFailureAction,
    (state, action): AuthStateInterface => ({
      ...state,
      isSubmitting: false,
      validationErrors: action.errors
    })
  ),
  on(
    loginAction,
    (state): AuthStateInterface => ({
      ...state,
      isSubmitting: true,
      validationErrors: null
    })
  ),
  on(
    loginSuccessAction,
    (state, action): AuthStateInterface => ({
      ...state,
      isSubmitting: false,
      isLoggedIn: true
    })
  ),
  on(
    loginFailureAction,
    (state, action): AuthStateInterface => ({
      ...state,
      isSubmitting: false,
      validationErrors: action.errors
    })
  ),
  on(
    getCurrentUserAction,
    (state): AuthStateInterface => ({
      ...state
    })
  ),
  on(
    getCurrentUserSuccessAction,
    (state, action): AuthStateInterface => ({
      ...state,
      isLoggedIn: true,
      currentUser: action.currentUser
    })
  ),
  on(
    getCurrentUserFailureAction,
    (state): AuthStateInterface => ({
      ...state,
      isLoggedIn: false,
    })
  ),
  on(
    setCurrentUserInstagramAction,
    (state, action): AuthStateInterface => ({
      ...state,
      isLoading: true,
    })
  ),
  on(
    setCurrentUserInstagramSuccessAction,
    (state, action): AuthStateInterface => ({
      ...state,
      isLoading: false,
      currentInstagram: action.currentUserInstagram
    })
  ),
  on(
    switchUserAction,
    (state): AuthStateInterface => ({
      ...state,
      isLoading: true,
    })
  ),
  on(
    switchUserInstagramAction, // switchUserInstagramAction -> no side effect is required
    (state, action): AuthStateInterface => ({
      ...state,
      isLoading: false,
      isLoggedIn: true,
      currentInstagram: action.instagramAccount
    })
  ),
  on(
    switchUserSuccessAction,
    (state, action): AuthStateInterface => ({
      ...state,
      isLoading: false,
      isLoggedIn: true,
      currentInstagram: action.instagramAccount
    })
  ),
  on(
    switchUserFailureAction,
    (state): AuthStateInterface => ({
      ...state,
      isLoading: false,
      isLoggedIn: false,
    })
  ),
  on(
    removeCurrentUserAction,
    (state): AuthStateInterface => ({
      ...state,
      currentInstagram: null
    })
  )
);

export function reducers(state: AuthStateInterface, action: Action) {
  return authReducer(state, action);
}
