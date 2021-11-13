import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { ServerResponse } from '../../../core/models/server-response';
import { MailingResponse, NewMailing, OldMailing } from '../../../core/models/direct';
import { filter } from 'rxjs/operators';

@Injectable()
export class DirectService {
    public sendSchedule: Subject<string> = new Subject();
    public sendScheduleState: Observable<string>;
    public updateMailing: Subject<void> = new Subject();
    public disableInput = new BehaviorSubject<boolean>(false);
    public updateMailingState: Observable<void>;
    constructor(private _httpClient: HttpClient) {
        this.sendScheduleState = this.sendSchedule.asObservable();
        this.updateMailingState = this.updateMailing.asObservable();
    }

    public getNewUserMailings(): Observable<ServerResponse<MailingResponse>> {
        return this._httpClient.get<ServerResponse<MailingResponse>>('mailing');
    }

    public postNewUserMailings(mailing: NewMailing) {
        return this._httpClient.post('mailing/new-user-mailing', mailing)
    }

    public postOldUserMailings(mailing: OldMailing) {
        return this._httpClient.post('mailing/old-user-mailing', mailing)
    }


    public uploadTxt(file: FormData): Observable<ServerResponse<string[]>> {
        return this._httpClient.post<ServerResponse<string[]>>('mailing/parse', file);
    }

    get disableInputState(): Observable<boolean> {
        return this.disableInput.asObservable()
            .pipe(
                filter((v) => v != null)
            )
    }
}