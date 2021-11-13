import { AppStateInterface } from "../../../shared/types/appState.interface";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AuthStateInterface } from "./types/authState.interface";

export const authFeatureSelector = createFeatureSelector<
  AppStateInterface,
  AuthStateInterface
>("auth");

export const isLoadingSelector = createSelector(
  authFeatureSelector,
  (authState) => authState.isLoading
);

export const isSubmittingSelector = createSelector(
  authFeatureSelector,
  (authState) => authState.isSubmitting
);

export const currentUserSelector = createSelector(
  authFeatureSelector,
  (authState: AuthStateInterface) => authState.currentUser
);

export const currentInstagramSelector = createSelector(
  authFeatureSelector,
  (authState: AuthStateInterface) => authState.currentInstagram
);

export const validationErrorsSelector = createSelector(
  authFeatureSelector,
  (authState: AuthStateInterface) => authState.validationErrors
)
