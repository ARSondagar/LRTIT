export interface AuthState {
    isAuth: boolean;
}

export interface TokenResponse {
    userId: number;
    refreshToken?: string;
    accessToken: string;
}
