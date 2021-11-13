import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ServerResponse } from './com/annaniks/lift/core/models/server-response';
import { JoinRequestData } from './com/annaniks/lift/core/models/join';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, tap } from 'rxjs/operators';
import { IUserDetails } from './com/annaniks/lift/shared/interfaces/user.details.interface';
import { IServiceBase } from './com/annaniks/lift/shared/interfaces/tariff.interface';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root'})
export class AppService {
  private _headerIsVisible$ = new BehaviorSubject<number>(0); // Show default content
  public headerIsVisible$: Observable<number>;

  private _CurrentUserDetails: IUserDetails = null;
  public get currentUserDetails(): IUserDetails { return this._CurrentUserDetails; }
  public set currentUserDetails(value: IUserDetails) {
    this._CurrentUserDetails = value;
  }

  private _showPaimentCurtain$ = new BehaviorSubject<boolean>(true);
  public showPaimentCurtain$ = this._showPaimentCurtain$.asObservable().pipe(
    distinctUntilChanged()
  );
  public set showPaimentCurtain(value: boolean) {
    this._showPaimentCurtain$.next(value);
  }

  public autoSubscribeIsValid = false;
  public autoWatchStoryIsValid = false;
  public bonusesIsValid = false;
  public autopostingIsValid = false;
  public directIsValid = false;
  public unsubscribeIsValid = false;


  constructor(
    private _toastrService: ToastrService,
    private _httpClient: HttpClient) {
    this.headerIsVisible$ = this._headerIsVisible$.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  public getCurrentUserDetails(userId: number): Observable<ServerResponse<IUserDetails>> {
    if (this.currentUserDetails === null || this.currentUserDetails.userId !== userId) {
      const url = `accountDetails/user/${userId}`;
      return this._httpClient.get<ServerResponse<IUserDetails>>(url)
              .pipe(
                tap((x: ServerResponse<IUserDetails>) => {
                  if (x.code === 200) {
                    this.currentUserDetails = x.data;
                    this.setValidationFlags(x.data);
                  }
                }),
                catchError(err => {
                  console.log(err);
                  throw err;
                })
              );
    } else {
      const rzlt: ServerResponse<IUserDetails> = {
        code: 200,
        data: this.currentUserDetails,
        message: null
      };
      return of(rzlt);
    }
  }
  public setValidationFlags(usrDtl: IUserDetails): void {
    const orderedServices: IServiceBase[] = usrDtl.services.filter(x => x.active);
    this.autoSubscribeIsValid = this.autoWatchStoryIsValid = this.bonusesIsValid = false;
    this.autopostingIsValid = this.directIsValid = this.unsubscribeIsValid = false;
    orderedServices.forEach(x => {
      switch (x.id) {
        case 1: this.autoSubscribeIsValid = true;
                break;
        case 2: this.autoWatchStoryIsValid = true;
                break;
        case 3: this.bonusesIsValid = true;
                break;
        case 4: this.autopostingIsValid = true;
                break;
        case 5: this.directIsValid = true;
                break;
        case 6: this.unsubscribeIsValid = true;
                break;
      }
    });
  }

  public getTrackingByReferalCode(joinRequest: JoinRequestData): Observable<ServerResponse<any>> {
      let params = new HttpParams();
      params = params.set('authorization', 'false');
      return this._httpClient.post<ServerResponse<any>>('tracking', joinRequest,{ params })
  }
  // value == 0 --> Show main containt (restore host page)
  //          1 --> Show FAQ page
  //          2 --> Show CompanyComponent
  //          3 --> Show ContactsComponent
  public setHeaderFlag(value: number): void {
    this._headerIsVisible$.next(value);
  }

  public getHeaderFlag(): number {
    return this._headerIsVisible$.getValue();
  }

  // For global debugging the application
  // https://stackoverflow.com/questions/45831191/generate-and-download-file-from-js
  // public downloadFile(filename, text) {
  //   const element = document.createElement('a');
  //   element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  //   element.setAttribute('download', filename);

  //   element.style.display = 'none';
  //   document.body.appendChild(element);

  //   element.click();

  //   document.body.removeChild(element);
  // }
}
