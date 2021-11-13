import { map } from 'rxjs/operators';
import { ServerResponse } from './../../core/models/server-response';
import { AppleAuthInterface } from './../interfaces/appleAuth.interface';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppleMapService {

    constructor(private _httpClient: HttpClient) {
    }

    public getToken(): Observable<ServerResponse<AppleAuthInterface>> {
      return this._httpClient.get<ServerResponse<AppleAuthInterface>>('jwt-apple-map');
  }

}
