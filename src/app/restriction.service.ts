import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree} from '@angular/router';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

export class RestrictionGuard implements CanActivate {

  private isRestricted: boolean;

  constructor() {
    this.isRestricted = environment.isRestricted;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return of(!this.isRestricted);
  }
}
