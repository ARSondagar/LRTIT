import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
// import { Loading } from '../models/models';
import { Observable } from 'rxjs';
@Injectable()
export class LoadingService {
    private _loaderSubject = new Subject<any>();
    private _loaderState = this._loaderSubject.asObservable();

    constructor() { }

    public showLoading(): void {
        this._loaderSubject.next(<any>{ show: true });
    }

    public hideLoading(): void {
        this._loaderSubject.next(<any>{ show: false });
    }

    public getLoaderState(): Observable<any> {
        return this._loaderState;
    }
}