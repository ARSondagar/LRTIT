import { isLoadingSelector } from './../../pages/auth/store/selectors';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { LoadingService } from '../../core/services/loading-service';
// import { Loading } from '../../models/models';

@Component({
    selector: 'app-loading',
    templateUrl: 'loading.component.html',
    styleUrls: ['loading.component.scss'],

})
export class LoadingComponent implements OnInit, OnDestroy {
    private _show = false;
    private _subscription: Subscription;

    public loading$: Observable<boolean>;

    constructor(
        private _loadingService: LoadingService,
        private store: Store
    ) { }

    ngOnInit() {
        this._subscription = this._loadingService.getLoaderState()
            .subscribe((state: any) => {
                this._show = state.show;
            });

            this.loading$ = this.store.pipe(select(isLoadingSelector))
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    get show(): boolean {
        return this._show;
    }
}
