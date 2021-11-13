import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TarifDataService } from './tarif-data.service';

@Injectable({
  providedIn: 'root'
})
export class TariffResolveService implements Resolve<any> {

  constructor(private _tarifDataSvc: TarifDataService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {


    const allData$ = combineLatest(
      this._tarifDataSvc.getCurrentUserDetails(),
      this._tarifDataSvc.getAllServices(),
      this._tarifDataSvc.getTransactions(1)
    );
    return allData$.pipe(
      map(results => ({
        userDetails: results[0],
        allServices: results[1],
        allTransactions: results[2]
      }))
    );
  }
}
