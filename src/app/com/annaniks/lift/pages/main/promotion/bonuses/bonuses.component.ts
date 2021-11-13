import { InstagramAccount } from 'src/app/com/annaniks/lift/core/models/user';
import { currentInstagramSelector } from './../../../auth/store/selectors';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BonusesService } from './bonuses.service';
import { catchError, takeUntil, finalize } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { BonusSettings } from '../../../../core/models/bonus-settings';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingService } from '../../../../core/services/loading-service';
import { Store, select } from '@ngrx/store';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bonuses',
  templateUrl: './bonuses.component.html',
  styleUrls: ['./bonuses.component.scss']
})
export class BonusesComponent implements OnInit, OnDestroy {

  public bonusesForm: FormGroup;
  private _unsubscribe$: Subject<void> = new Subject<void>();
  public isUploaded = true;
  public currentInstagram: InstagramAccount;
  files: string[];
  @ViewChild('fileInput', { static: false }) fileInput;

  constructor(
    private _bonusesService: BonusesService,
    public appSvc: AppService,
    private _fb: FormBuilder,
    private store: Store,
    private _loadingService: LoadingService,
    private router: Router
  ) { }

  ngOnInit() {

    this.store.pipe(select(currentInstagramSelector)).subscribe(resp => {
      this.currentInstagram = resp;
      this._initForm();
      this._getCurrentBonuses();

    })
  }

  private _initForm(): void {
    this.bonusesForm = this._fb.group({
      comment: [null],
      like: [null],
      save: [null],
      commentStatus: [false],
      likeStatus: [false],
      saveStatus: [false],
      comments: [null]
    });
  }

  public addActivity(): void {
    this._loadingService.showLoading();
    const bonusesForm = this.bonusesForm.value;
    const sendingData: BonusSettings = {
      instagramAccountId: this.currentInstagram.id,
      comment: bonusesForm.commentStatus ? bonusesForm.comment : 0,
      like: bonusesForm.likeStatus ? bonusesForm.like : 0,
      save: bonusesForm.saveStatus ? bonusesForm.save : 0,
      comments: {
        list: this.isUploaded ? this.files : bonusesForm.comments.split(';')
      }
    }
    this._bonusesService.saveBonusesConfig(sendingData).pipe(
      finalize(() => this._loadingService.hideLoading()),
      takeUntil(this._unsubscribe$)
    ).subscribe(response => {
      console.log(response);
      this._bindCurrentState(response.data);
    })
  }

  private _getCurrentBonuses(): void {
    this._loadingService.showLoading();
    this._bonusesService.getBonusesConfig(this.currentInstagram.id).pipe(
      finalize(() => this._loadingService.hideLoading()),
      takeUntil(this._unsubscribe$)
    ).subscribe((response) => {
      console.log(response);
      this._bindCurrentState(response.data)
    })
  }

  private _bindCurrentState(value: BonusSettings): void {
    this.bonusesForm.patchValue({
      comment: value.comment,
      like: value.like,
      save: value.save,
      commentStatus: value.comment > 0 ? true : false,
      likeStatus: value.like > 0 ? true : false,
      saveStatus: value.save > 0 ? true : false,
    })
    this.files = (!value || !value.comments) ? [] : value.comments.list;
  }

  public handleInputChange(e): void {
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    const pattern = /text.*/;
    if (!file.type.match(pattern)) {
      alert(`Можно загружать только файлы в формате 'txt'`);
      return;
    }
    const formData: FormData = new FormData();
    formData.append('txt', file, file.name);
    this._uploadTxt(formData)
  }

  private _uploadTxt(file: FormData): void {
    this._loadingService.showLoading();
    this._bonusesService.uploadTxt(file).pipe(
      finalize(() => this._loadingService.hideLoading()),
      takeUntil(this._unsubscribe$)
    ).subscribe((data) => {
      this.files = [...data.data]
      this.fileInput.nativeElement.value = '';
      this.isUploaded = true
    })
  }

  public toggleIsUploaded(): void {
    this.isUploaded = !this.isUploaded
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  goToPayment() {
    this.router.navigateByUrl('tariff/tarif_new');
  }
}
