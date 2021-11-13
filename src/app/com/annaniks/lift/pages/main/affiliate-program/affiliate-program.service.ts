import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { ServerResponse } from '../../../core/models/server-response';
import { Observable } from 'rxjs';
import { AffiliateProgramOperation } from '../../../core/models/affiliate-program';

@Injectable()
export class AffiliateProgramService {

    constructor(private _httpClient: HttpClient) { }


    public getAffiliateProgramOperation(offset: number,limit: number,): Observable<ServerResponse<AffiliateProgramOperation[]>> {
        let params = new HttpParams();
        params = params.set('offset', offset.toString())
        params = params.set('limit', limit.toString())
        return this._httpClient.get<ServerResponse<AffiliateProgramOperation[]>>('tracking/refferal', { params });
    }

}
