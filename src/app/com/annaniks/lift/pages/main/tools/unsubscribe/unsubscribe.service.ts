import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnsubscribePayload } from '../../../../core/models/unsubscribe';
import { ServerResponse } from '../../../../core/models/server-response';

@Injectable({
    providedIn: 'root'
})
export class UnsubscribeService {

    constructor(private _httpClient: HttpClient) { }

    public saveSettings(data: UnsubscribePayload): Observable<ServerResponse<UnsubscribePayload>> {
        return this._httpClient.post<ServerResponse<UnsubscribePayload>>('unsubscribe', data)
    }

    public getSettings(loginId: string): Observable<ServerResponse<UnsubscribePayload>> {
        return this._httpClient.get<ServerResponse<UnsubscribePayload>>(`unsubscribe/${loginId}`)
    }
}