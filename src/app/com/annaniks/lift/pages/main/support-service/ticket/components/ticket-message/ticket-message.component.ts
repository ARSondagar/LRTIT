import { Component, Input, OnInit, OnDestroy, ViewEncapsulation, Inject } from '@angular/core';
import { TicketMessage, AttachedFile } from '../../../../../../core/models/support-service';
import { User } from '../../../../../../core/models/user';
import { AuthService } from '../../../../../../core/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { TicketService } from '../../ticket.service';
import { Store, select } from '@ngrx/store';
import { currentUserSelector } from '../../../../../auth/store/selectors';

@Component({
    selector: '[app-ticket-message]',
    templateUrl: 'ticket-message.component.html',
    styleUrls: ['ticket-message.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TicketMessageComponent implements OnInit, OnDestroy {
    private _unsubscribe$: Subject<void> = new Subject<void>();
    public user: User = {} as User;
    public attachedFiles: AttachedFile[] = [];
    @Input('message') public ticketMessage: TicketMessage = {} as TicketMessage;

    constructor(
        private _authService: AuthService,
        private store: Store,
        @Inject('BASE_URL') private baseUrl: string,
        private _ticketService: TicketService
    ) { }

    ngOnInit() {
        this.attachedFiles = this.ticketMessage.files || [];

        this.store.pipe(select(currentUserSelector)).subscribe(resp => {
          this.user = resp
        })
    }

    private _downloadFile(fileBlob: Blob): void {
        const url = window.URL.createObjectURL(fileBlob);
        window.open(url);
    }

    public onClickFileName(file: AttachedFile): void {
        this._ticketService.getAttachedFile(`download/${file.path}`)
            .pipe(takeUntil(this._unsubscribe$))
            .subscribe((data) => {
                this._downloadFile(data);
            })
    }

    ngOnDestroy() {
        this._unsubscribe$.next();
        this._unsubscribe$.complete();
    }
}
