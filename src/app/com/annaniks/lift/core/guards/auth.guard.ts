import { Injectable } from '@angular/core';
import { CanLoad, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private _authService: AuthService,
    ) { }

    canActivate(): Observable<boolean> | Promise<boolean> | boolean {
        return this._authService.checkAuthState();
    }
}