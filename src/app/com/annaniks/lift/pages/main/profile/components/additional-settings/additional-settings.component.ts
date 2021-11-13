import { Store } from '@ngrx/store';
import { getCurrentUserAction } from './../../../../auth/store/actions/getCurrentUser.action';
import { Component, OnInit, OnDestroy, Input, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProfileService } from '../../profile.service';
import { takeUntil, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ChangeMe } from '../../../../../core/models/change-me';
import { MainService } from '../../../main.service';
import {AccountSettings, GoalUsing, Occupation} from '../../../../../core/models/account-settings';

@Component({
    selector: 'additional-settings',
    templateUrl: 'additional-settings.component.html',
    styleUrls: ['additional-settings.component.scss']
})

export class AdditionalSettings implements OnInit, OnDestroy {
    @Input('user')
    set _userData(event) {
        this._formBuilder();
        if (event) {
            this._bindPersonalSettings(event);
        }
    }
    private _unsubscribe$: Subject<void> = new Subject<void>();
    public additionalForm: FormGroup;
    public pagesForm: FormGroup;
    public loading: boolean = false;
    public settingVariants: AccountSettings
    public goalUsingsId: number;
    private occupationsId: number;
    public goalUsingsValue: GoalUsing;
    public occupationsValue: Occupation;
    constructor(
        private _fb: FormBuilder,
        private _profileService: ProfileService,
        private store: Store,
        private _mainService: MainService
    ) { }

    ngOnInit() {
        this._fetchAccountSettingsVariants();
    }

    private _formBuilder(): void {
        this.additionalForm = this._fb.group({
            service: [null],
            occupation: [null],
            activity: [null],
            description: ['', Validators.required]
        })
        this.pagesForm = this._fb.group({
            instagram: ['', Validators.required],
            facebook: ['', Validators.required]
        })
    }

    public checkIsValid(formGroup, controlName): boolean {
        return formGroup.get(controlName).hasError('required') && formGroup.get(controlName).touched;
    }

    public changeMe(): void {
        this.loading = true
        const additionalForm = this.additionalForm.value;
        const pageForm = this.pagesForm.value;
        const sendingData: ChangeMe = {
            goalUsing: this.goalUsingsValue.id,
            occupation: this.occupationsValue.id || 0,
            aboutYourself: additionalForm.description,
            facebookLink: pageForm.facebook,
            instagramLink: pageForm.instagram
        }
        this._profileService.changeMe(sendingData)
            .pipe(
                takeUntil(this._unsubscribe$),
                finalize(() => {
                  this.store.dispatch(getCurrentUserAction())
                  this.loading = false
                })
            ).
            subscribe()
    }

    private _bindPersonalSettings(settings): void {
        this.goalUsingsId = settings.goalUsing;
        this.occupationsId = settings.occupation;
        this.pagesForm.patchValue({
            instagram: settings.instagramLink,
            facebook: settings.facebookLink
        })
        this.additionalForm.patchValue({
            service: settings.goalUsing,
            occupation: settings.occupation,
            description: settings.aboutYourself
        })

    }

    private _fetchAccountSettingsVariants(): void {
        this._mainService.getAccountSettingsVariants().pipe(
            takeUntil(this._unsubscribe$)
        ).subscribe(data => {
            this.settingVariants = data;
            this.goalUsingsValue = data.goalUsings.find(item => item.id === this.goalUsingsId);
            this.occupationsValue = data.occupations.find(item => item.id === this.occupationsId);
        })
    }

    ngOnDestroy() {
        this._unsubscribe$.next();
        this._unsubscribe$.unsubscribe();
    }
}
