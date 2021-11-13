import { Component, OnInit, OnDestroy } from '@angular/core';
import { JoinRequestData } from '../../core/models/join';
import { AppService } from '../../../../../app.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';

@Component({
    selector: 'app-join',
    templateUrl: 'join.component.html',
    styleUrls: ['join.component.scss']
})
export class JoinComponent implements OnInit, OnDestroy {
    private _unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private _appService: AppService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _cookieService: CookieService
    ) { }

    ngOnInit() {
        this._getTrackingByReferalCode();
    }

    private _getTrackingByReferalCode(): void {
        const referalCode: string = this._activatedRoute.snapshot.paramMap.get('referalCode') || '';
        const joinRequestData: JoinRequestData = {
            action: "transition",
            refferalCode: referalCode
        }
        this._appService.getTrackingByReferalCode(joinRequestData)
            .pipe(takeUntil(this._unsubscribe$))
            .subscribe((data) => {
                const expireDate = new Date(new Date().getTime() + 30 * 1000 * 60 * 60 * 24).toString();
                this._cookieService.put('refferalCode', referalCode, { expires: expireDate });
                this._router.navigate(['/auth/login']);
            },
                (error) => {
                  this._router.navigate(['/auth/login']);
                })
    }

    ngOnDestroy() {
        this._unsubscribe$.next();
        this._unsubscribe$.complete();
    }
}
