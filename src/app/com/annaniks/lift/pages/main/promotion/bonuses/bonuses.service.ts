import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJs 
import { Observable } from 'rxjs';

// Interfaces
import { ServerResponse } from '../../../../core/models/server-response';
import { BonusSettings } from '../../../../core/models/bonus-settings';

@Injectable()
export class BonusesService {

    public getBonusesConfig(id: number): Observable<ServerResponse<BonusSettings>> {
        return this.httpClient.get<ServerResponse<BonusSettings>>(`activity/${id}`)
    }


    public saveBonusesConfig(settings: BonusSettings): Observable<ServerResponse<BonusSettings>> {
        return this.httpClient.post<ServerResponse<BonusSettings>>('activity', settings)
    }

    public uploadTxt(file: FormData): Observable<ServerResponse<string[]>> {
        return this.httpClient.post<ServerResponse<string[]>>('mailing/parse', file);
    }

    constructor(private httpClient: HttpClient) { }

}