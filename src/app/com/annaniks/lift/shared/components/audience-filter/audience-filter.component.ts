import { Component, OnInit, OnDestroy, Input, Inject, Injector } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SubSink } from 'subsink'
import { AutoSubscribeOrWatchStoryService } from '../../services/auto-subscribe-watch-story.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-audience-filter',
  templateUrl: './audience-filter.component.html',
  styleUrls: ['./audience-filter.component.scss']
})
export class AudienceFilterComponent implements OnInit, OnDestroy {
  countFilters: number;
  @Input('massData')
  set _massData(event) {
    if (event && event.filter && event.filter.hasOwnProperty('haveSite')) {
      this._bindMassfollowing(event)
    }
  }
  @Input('expanded') public expanded = true;

  public filterAudienceForm: FormGroup
  private _subs = new SubSink();

  constructor(
    private _formBuilder: FormBuilder,
    private _autoSubscribeOrWatchStoryService: AutoSubscribeOrWatchStoryService,
    // public dialogRef: MatDialogRef<AudienceFilterComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: { showButton: boolean }
  ) {


  }

  ngOnInit() {
    this._initForm()
  }

  public closeModal(): void {
    // this.dialogRef.close()
  }
  getCountFilter() {
    const count = this.countFilters;
    let result: string;
    if (count === 1) {
      result = 'фильтр включен';
    } else if (count > 1 && count < 5) {
      result = 'фильтра включено';
    } else {
      result = 'фильтров включено';
    }
    return `${count} ${result}`;
  }
  private _initForm(): void {
    this.filterAudienceForm = this._formBuilder.group({
      followers: this._formBuilder.group({ status: false, min: 0, max: 0 }),
      folowings: this._formBuilder.group({ status: false, min: 0, max: 0 }),
      likeInPhoto: this._formBuilder.group({ status: false, min: 0, max: 0 }),
      postCount: this._formBuilder.group({ status: false, min: 0, max: 0 }),
      haveAvatar: false,
      lastPostAge: this._formBuilder.group({ status: false, age: 0 }),
      lastStoryAge: this._formBuilder.group({ status: false, age: 0 }),
      profileDescription: false,
      haveSite: false,
      descriptionInclude: this._formBuilder.group({ status: '', text: '' }),
      descriptionExclude: this._formBuilder.group({ status: '', text: '' })

    })
    this.filterAudienceForm.valueChanges.subscribe((data) => {
      const formValue = this.filterAudienceForm.value
      const countFilters = {
        followers: formValue.followers.status,
        folowings: formValue.folowings.status,
        likeInPhoto: formValue.likeInPhoto.status,
        postCount: formValue.postCount.status,
        haveAvatar: formValue.haveAvatar,
        lastPostAge: formValue.lastPostAge.status,
        lasStoryAge: formValue.lastStoryAge.status,
        profileDescription: formValue.profileDescription,
        descriptionInclude: formValue.descriptionInclude.status,
        descriptionExclude: formValue.descriptionExclude.status,
        haveSite: formValue.haveSite,
      }
      const filters = {
        followers: formValue.followers.status ? { min: formValue.followers.min, max: formValue.followers.max } : null,
        folowings: formValue.folowings.status ? { min: formValue.folowings.min, max: formValue.folowings.max } : null,
        likeInPhoto: formValue.likeInPhoto.status ? { min: formValue.likeInPhoto.min, max: formValue.likeInPhoto.max } : null,
        postCount: formValue.postCount.status ? { min: formValue.postCount.min, max: formValue.postCount.max } : null,
        haveAvatar: formValue.haveAvatar,
        lastPostAge: formValue.lastPostAge.status ? formValue.lastPostAge.age : 0,
        lasStoryAge: formValue.lastStoryAge.status ? formValue.lastStoryAge.age : 0,
        profileDescription: formValue.profileDescription,
        description: {
          include: formValue.descriptionInclude.status ? formValue.descriptionInclude.text.trim().split(',') : null,
          exclude: formValue.descriptionExclude.status ? formValue.descriptionExclude.text.trim().split(',') : null,
        },
        haveSite: formValue.haveSite,
        // gender?: 'string',
        // language?: 'string',
      }
      this.countFilters = Object.values(countFilters).filter(x => x).length;
      this._autoSubscribeOrWatchStoryService.settings.filter = filters;
    })
  }

  private _bindMassfollowing(event): void {
    this.filterAudienceForm.patchValue({
      followers: {
        status: event.filter.followers ? true : false,
        min: event.filter.followers ? event.filter.followers.min : 0,
        max: event.filter.followers ? event.filter.followers.max : 0
      },
      folowings: {
        status: event.filter.folowings ? true : false,
        min: event.filter.folowings ? event.filter.folowings.min : 0,
        max: event.filter.folowings ? event.filter.folowings.max : 0
      },
      likeInPhoto: {
        status: event.filter.likeInPhoto ? true : false,
        min: event.filter.likeInPhoto ? event.filter.likeInPhoto.min : 0,
        max: event.filter.likeInPhoto ? event.filter.likeInPhoto.max : 0
      },
      postCount: {
        status: event.filter.postCount ? true : false,
        min: event.filter.postCount ? event.filter.postCount.min : 0,
        max: event.filter.postCount ? event.filter.postCount.max : 0
      },
      haveAvatar: event.filter.haveAvatar ? true : false,
      lastPostAge: {
        status: event.filter.lastPostAge ? true : false,
        age: event.filter.lastPostAge
      },
      lastStoryAge: {
        status: event.filter.lasStoryAge ? true : false,
        age: event.filter.lasStoryAge
      },
      profileDescription: event.filter.profileDescription ? true : false,
      haveSite: event.filter.haveSite ? true : false,
      descriptionInclude: {
        status: event.filter.description.include ? true : false,
        text: event.filter.description.include ? event.filter.description.include.toString() : ''
      },
      descriptionExclude: {
        status: event.filter.description.exclude ? true : false,
        text: event.filter.description.exclude ? event.filter.description.exclude.toString() : ''
      }
    });

  }

  ngOnDestroy() {
    this._subs.unsubscribe();
  }
}
