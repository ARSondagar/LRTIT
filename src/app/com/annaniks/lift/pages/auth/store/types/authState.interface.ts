import { InstagramAccount, UserExt } from 'src/app/com/annaniks/lift/core/models/user';
import { TokenResponse } from './../../../../core/models/auth';
import { User } from './../../../../core/models/user';

export interface AuthStateInterface {
  isSubmitting: boolean
  currentUser: UserExt | null
  currentInstagram: InstagramAccount
  isLoggedIn: boolean | null
  validationErrors: any | null
  isLoading: boolean
  test: number
  tokenResponse: TokenResponse
}
