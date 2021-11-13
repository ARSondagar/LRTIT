import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServerResponse } from '../../../core/models/server-response';
import { AllTicketsResponse, CreateTicketData } from '../../../core/models/support-service';

@Injectable()
export class SupportService {

    constructor(private _httpClient: HttpClient) { }

    public createTicket(createTicketData: CreateTicketData, attachedFiles: File[]): Observable<ServerResponse<{}>> {
        const formData: FormData = new FormData();
        if (createTicketData) {
            const keys = Object.keys(createTicketData) || [];
            keys.map((element, index) => {
                formData.append(element, createTicketData[element]);
            })
        }
        if (attachedFiles) {
            attachedFiles.map((element, index) => {
                formData.append('files', element, element.name);
            })
        }
        return this._httpClient.post<ServerResponse<{}>>('support', formData);
    }

    public getAllTickets(): Observable<ServerResponse<AllTicketsResponse>> {
        return this._httpClient.get<ServerResponse<AllTicketsResponse>>('support/tickets');
    }
}