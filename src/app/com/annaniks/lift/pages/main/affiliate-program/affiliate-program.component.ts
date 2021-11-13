import { currentUserSelector } from './../../auth/store/selectors';
import { Component, OnInit, Inject } from '@angular/core';
import { AffiliateProgramService } from './affiliate-program.service';
import { AffiliateProgramOperation } from '../../../core/models/affiliate-program';
import { FormControl } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../../core/models/user';
import { DOCUMENT } from '@angular/common';
import { select, Store } from '@ngrx/store';
import { AppService } from 'src/app/app.service';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-affiliate-program',
  templateUrl: 'affiliate-program.component.html',
  styleUrls: ['affiliate-program.component.scss'],
})
export class AffiliateProgramComponent implements OnInit {
  private _unsubscribe$: Subject<void> = new Subject<void>();
  public referalCodeControl = new FormControl();
  public affiliateProgramOperation: AffiliateProgramOperation[] = [];
  public page = 1;
  public pageLength = 10;
  public loading = false;

  public showPreviewBlock$: Observable<number>;

  constructor(
    private _affiliateProgramService: AffiliateProgramService,
    private _authService: AuthService,
    private _appSvc: AppService,
    private store: Store,
    private router: Router,
    private _toastrService: ToastrService,
    @Inject(DOCUMENT) private _document: Document
  ) {
    this.showPreviewBlock$ = _appSvc.headerIsVisible$;
    this.router.events.pipe(
      filter(evt => evt instanceof NavigationStart)
    ).subscribe(() => {
      _appSvc.setHeaderFlag(0);
    });
  }

  ngOnInit() {
    this._getUser();
    this._getAffiliateProgramOperation();
  }

  private _getUser(): void {
    this.store.pipe(select(currentUserSelector)).subscribe((user) => {
      const refferalCode: string = user.refferalCode;
      const origin: string = this._document.location.origin;
      const url = `${origin}/join/${refferalCode}`;
      this.referalCodeControl.patchValue(url);
    });
  }

  public copyInputMessage(inputElement): void {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    this._toastrService.success('Скопировано в буфер обмена');
  }

  public onClickSeeMore(): void {
    this.page = this.page + 1;
    this._getAffiliateProgramOperation();
  }

  private _getAffiliateProgramOperation(): void {
    this.loading = true;
    this._affiliateProgramService
      .getAffiliateProgramOperation(
        (this.page - 1) * this.pageLength,
        this.page * this.pageLength
      )
      .subscribe((data) => {
        this.affiliateProgramOperation.push(...data.data);
        this.loading = false;
      });
  }
}
