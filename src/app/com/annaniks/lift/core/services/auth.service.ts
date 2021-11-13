import { CookieService } from "ngx-cookie";
import { LoadingService } from "./loading-service";
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable, throwError, of } from "rxjs";
import { ServerResponse } from "../models/server-response";
import { AuthState } from "../models/auth";
import { map, catchError, filter, tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { User, InstagramAccount } from "../models/user";
import { AppService } from "src/app/app.service";
import { IUserDetails } from "../../shared/interfaces/user.details.interface";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private _isAuthorized: boolean = false;
  private _isAuthorizedState$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  constructor(
    private _httpClient: HttpClient,
    private _cookieService: CookieService,
    private appSvc: AppService,
    private _router: Router,
    private _loadingService: LoadingService
  ) {}

  public setAuthState(isAuthorized: boolean): void {
    this._isAuthorized = isAuthorized;
  }

  public getAuthStateSync(): boolean {
    return this._isAuthorized;
  }

  public getUserImage(url: string): Observable<any> {
    return this._httpClient.get(url, { responseType: 'blob' });
  }

  public getAuthState(): Observable<boolean> {
    return this._isAuthorizedState$.asObservable();
  }

  public checkAuthState(): Observable<boolean> {
    this._loadingService.showLoading();

    let headers = new HttpHeaders();
    headers = headers.append(
      "Cache-Control",
      "no-cache, no-store, must-revalidate, post-check=0, pre-check=0"
    );
    headers = headers.append("Pragma", "no-cache");
    headers = headers.append("Expires", "0");

    if (this._cookieService.get("accessTokenS")) {
      return this._httpClient
        .get<ServerResponse<AuthState>>("check-token", { headers })
        .pipe(
          map((response) => {
            this._loadingService.hideLoading();
            this.setAuthState(true);
            return true;
          }),
          catchError((err) => {
            this._loadingService.hideLoading();
            this.setAuthState(false);
            this._router.navigate(["/auth/login"]);
            return throwError(false);
          })
        );
    } else {
      this._loadingService.hideLoading();
      this.setAuthState(false);
      this._router.navigate(["/auth/login"]);
      return of(false);
    }
  }

  public readImageFromInstagram(instagramAccount: InstagramAccount, index: number,
                                callBack: (x: boolean, y: any, i: number) => void): void {
    const localImageUrl = instagramAccount.avatar;
    this.readImageStream(localImageUrl, index, callBack);
    // if (!localImageUrl) {
    //   callBack(false, '', index);  // No image
    // }
    // const localImage1 = `getPicture?link=${encodeURIComponent(localImageUrl)}`;
    // this.getUserImage(localImage1).subscribe(x => {
    //   if (x.type === 'text/plain') {
    //     callBack(false, '', index);  // No image
    //   } else {
    //     this.createImageFromBlob(x, index, callBack);
    //   }
    // });
  }
  public readImageStream(localImageUrl: string, index: number,
                         callBack: (x: boolean, y: any, i: number) => void): void {
    if (!localImageUrl) {
      callBack(false, '', index);  // No image
    }
    const localImage1 = `getPicture?link=${encodeURIComponent(localImageUrl)}`;
    this.getUserImage(localImage1).subscribe(x => {
      if (x.type === 'text/plain') {
        callBack(false, '', index);  // No image
      } else {
        this.createImageFromBlob(x, index, callBack);
      }
    });
  }

  private createImageFromBlob(image: Blob,  index: number, callBack: (x: boolean, y: any, i: number) => void) {
    if (!image) {
      callBack(false, '', index);  // No image
      return
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
//      console.log(reader.result);
      callBack(true, reader.result, index);  // Got the image
    }, false);
    reader.readAsDataURL(image);
  }

}
