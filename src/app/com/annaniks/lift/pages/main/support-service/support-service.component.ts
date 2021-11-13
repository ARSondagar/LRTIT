import {Component, OnInit, OnDestroy} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AddQuestionComponent} from './add-question/add-question.component';
import {Observable, Subject} from 'rxjs';
import {SupportService} from './support-service.service';
import {takeUntil, finalize, filter} from 'rxjs/operators';
import {Ticket} from '../../../core/models/support-service';
import {MainService} from '../main.service';
import {SupportTicketStatus, SupportTicketCategory} from '../../../core/models/account-settings';
import { AppService } from 'src/app/app.service';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-support-service',
  templateUrl: './support-service.component.html',
  styleUrls: ['./support-service.component.scss']
})
export class SupportServiceComponent implements OnInit, OnDestroy {
  private _unsubscribe$ = new Subject<void>();
  public loading = false;
  public openedTickets: Ticket[] = [];
  public closedTickets: Ticket[] = [];
  public open = false;

  public showPreviewBlock$: Observable<number>;

  constructor(
    private _matDialog: MatDialog,
    private _appSvc: AppService,
    private _supportService: SupportService,
    private router: Router
  ) {
    this.showPreviewBlock$ = _appSvc.headerIsVisible$;
    this.router.events.pipe(
      filter(evt => evt instanceof NavigationStart)
    ).subscribe(() => {
      _appSvc.setHeaderFlag(0);
    });
}

  ngOnInit() {
    this._getAllTickets();
  }

  private _getAllTickets(): void {
    this.loading = true;
    this._supportService.getAllTickets()
      .pipe(
        takeUntil(this._unsubscribe$),
        finalize(() => this.loading = false)
      )
      .subscribe((data) => {
        const tickets = data.data;
        this.openedTickets = tickets.openTickets;
        this.closedTickets = tickets.closeTickets;
      })
  }

  public onClickAddQuestion(): void {
    const dialogRef = this._matDialog.open(AddQuestionComponent, {
      maxWidth: '80vw',
      width: '900px',
      maxHeight: '80vh'
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data && data.isCreatedTicket) {
        this._getAllTickets();
      }
    })
  }

  public toggle(): void {
    this.open = !this.open;
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }


}
