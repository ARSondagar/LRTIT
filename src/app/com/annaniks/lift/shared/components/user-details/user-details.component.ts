import { currentInstagramSelector } from './../../../pages/auth/store/selectors';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import {
  InstagramAccount,
  InstagramAccountStatistics,
} from '../../../core/models/user';
import { of, Subject } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  private _unsubscribe$ = new Subject<void>();
  public activeAccount: InstagramAccount = {} as InstagramAccount;
  public statistics: InstagramAccountStatistics;
//  public localImage1: any;

  public localImage = '/assets/images/boy.png';
  public imageToShow: string | ArrayBuffer;
  public hasImage = false;

  constructor(
    private _authService: AuthService,
    private store: Store) {
  }

  // https://stackoverflow.com/questions/40511173/angular-2-image-src-as-function-return
  ngOnInit() {
    this.store.pipe(select(currentInstagramSelector)).subscribe((resp) => {
      this.activeAccount = resp;
      this.statistics = this.activeAccount.statistica;
      const localImage1 = this.activeAccount.avatar
        ?  `getPicture?link=${encodeURIComponent(this.activeAccount.avatar)}`
        : '/assets/images/boy.png';
      this._authService.getUserImage(localImage1).subscribe(
        x => {
          if (x.type === 'text/plain') {
            this.hasImage = false;
          } else {
            this.createImageFromBlob(x);
            this.hasImage = true;
            }
        },
        err => {
          console.log(err);
          this.hasImage = false;
      });
    });
  }

  createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
       this.imageToShow = reader.result;
    }, false);

    if (image) {
       reader.readAsDataURL(image);
    }
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
}
