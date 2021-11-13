import { currentUserSelector } from './../../auth/store/selectors';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavbarService } from '../../../core/services/navbar.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { User } from '../../../core/models/user';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { AppService } from 'src/app/app.service';

@Component({
    selector: 'app-profile',
    templateUrl: 'profile.component.html',
    styleUrls: ['profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
    private _unsubscribe$: Subject<void> = new Subject<void>();
    currentUser$: Observable<User | null>
    public tab: number = 1;
    public showPreviewBlock$: Observable<number>;

    constructor(
        private _navbarService: NavbarService,
        private _appSvc: AppService,
        private store: Store,
        private _authService: AuthService,
        private _activatedRoute: ActivatedRoute,
        private router: Router
    ) {
        this._checkRouteParams();
        this.showPreviewBlock$ = _appSvc.headerIsVisible$;
        this.router.events.pipe(
          filter(evt => evt instanceof NavigationStart)
        ).subscribe(() => {
          _appSvc.setHeaderFlag(0);
        });
    }

    ngOnInit() {
        this._navbarService.setNavbarItems([]);
        this.currentUser$ = this.store.pipe(select(currentUserSelector))
    }

    private _checkRouteParams(): void {
        this._activatedRoute.queryParams
            .pipe(takeUntil(this._unsubscribe$))
            .subscribe((params) => {
                if (params && params.tab) {
                    switch (params.tab) {
                        case 'basic-settings': {
                            this.tab = 1;
                            break;
                        }
                        case 'personal-settings': {
                            this.tab = 2;
                            break;
                        }
                        case 'additional-settings': {
                            this.tab = 3;
                            break;
                        }
                        default: {
                            this.tab = 1;
                            break;
                        }
                    }
                }
                else {
                    this.tab = 1;
                }
            })
    }

    public changedTab(tab): void {
        this.tab = tab;
    }



    ngOnDestroy() {
        this._unsubscribe$.next()
        this._unsubscribe$.complete()
    }
}
