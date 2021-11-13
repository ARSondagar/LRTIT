import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpClient,
  HttpParams,
  HttpHeaders,
} from "@angular/common/http";
import { Observable, throwError, BehaviorSubject } from "rxjs";
import {
  catchError,
  map,
  finalize,
  switchMap,
  take,
  filter,
} from "rxjs/operators";
import { CookieService } from "ngx-cookie";
import { TokenResponse } from "../models/auth";
import { ServerResponse } from "../models/server-response";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private _updateTokenEvent$ = new BehaviorSubject<boolean>(null);
  private _updateTokenState: Observable<boolean>;
  private _loading = false;

  constructor(
    private _httpClient: HttpClient,
    private _cookieService: CookieService,
    private _router: Router
  ) {
    this._updateTokenState = this._updateTokenEvent$.asObservable();
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err) => {
        const status: number = err.status;
        const error = err.error;
        if (
          (status === 401 || error.status === 401 || status === 0) &&
          req.url === environment.apiUrl + "refresh"
        ) {
          //ToDO fixing
          this._router.navigate(["/auth/login"]);
          return throwError(err);
        }
        if (status === 401 || error.status === 401) {
          if (!this._loading) {
            this._updateToken();
          }
          return this._updateTokenState.pipe(
            filter((token) => token != null),
            take(1),
            switchMap((isUpdated) => {
              if (!!isUpdated) {
                return next.handle(this._setNewHeaders(req));
              } else if (isUpdated === false) {
                this._router.navigate(["/auth/login"]);
                return throwError(false);
              }
            })
          );
        }
        return throwError(err);
      })
    );
  }

  private _updateToken(): void {
    let params = new HttpParams();
    let headers = new HttpHeaders();
    const refreshToken = this._cookieService.get("refreshTokenS");
    params = params.set("authorization", "false");
    this._loading = true;
    if (refreshToken) {
      headers = headers.append(
        "Authorization",
        "Bearer " + this._cookieService.get("refreshTokenS")
      );
      this._httpClient
        .post<ServerResponse<TokenResponse>>("refresh", {}, { params, headers })
        .pipe(
          finalize(() => (this._loading = false)),
          map((data: ServerResponse<TokenResponse>) => {
            const tokens = data.data;
            this._updateCookies(tokens);
            this._updateTokenEvent$.next(true);
          }),
          catchError((err) => {
            console.log("errr");
            this._router.navigate(["/auth/login"]);
            this._updateTokenEvent$.next(false);
            return throwError(false);
          })
        )
        .subscribe();
    } else {
      this._loading = false;
      if (this._router.url.indexOf('/auth') === -1) {
        this._router.navigate(["/auth/login"]);
      }
    }
  }

  private _updateCookies(data: TokenResponse): void {
    this._cookieService.put("accessTokenS", data.accessToken);
  }

  private _setNewHeaders(req: HttpRequest<any>): HttpRequest<any> {
    let httpHeaders: HttpHeaders = req.headers;
    httpHeaders = httpHeaders.delete("Authorization");
    httpHeaders = httpHeaders.append(
      "Authorization",
      "Bearer " + this._cookieService.get("accessTokenS") || ""
    );
    const clonedReq = req.clone({
      headers: httpHeaders,
    });
    return clonedReq;
  }
}
