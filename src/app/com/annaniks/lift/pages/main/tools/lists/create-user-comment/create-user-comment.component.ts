import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatChipInputEvent } from '@angular/material';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { SLASH } from '@angular/cdk/keycodes';
import { Observable, Subject } from 'rxjs';
import { AutoSubscribeOrWatchStoryService } from 'src/app/com/annaniks/lift/shared/services/auto-subscribe-watch-story.service';
import { SearchTerm, Search } from 'src/app/com/annaniks/lift/core/models/search';
import { map, takeUntil } from 'rxjs/operators';
import { ListService } from '../list.service';
import { CommentsList, UsersList } from '../../../../../core/models/my-lists';

@Component({
  selector: 'app-create-user-comment',
  templateUrl: './create-user-comment.component.html',
  styleUrls: ['./create-user-comment.component.scss']
})
export class CreateUserCommentComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject();
  public searchStream$: Observable<Search>
  public userCommentForm: FormGroup;
  readonly selectable = true;
  readonly removable = true;
  readonly addOnBlur = true;
  readonly separatorKeysCodes: number[] = [SLASH];

  constructor(
    private _dialogRef: MatDialogRef<CreateUserCommentComponent>,
    private _fb: FormBuilder,
    private _listService: ListService,
    private _autoSubscribeOrWatchStoryService: AutoSubscribeOrWatchStoryService,
    @Inject(MAT_DIALOG_DATA) public data,
  ) { }

  ngOnInit() {
    this._initForm();
  }

  private _initForm(): void {
    this.userCommentForm = this._fb.group({
      name: ['', [Validators.required]],
    })
    this.userCommentForm.addControl(this.data == 'usersList' ? 'usersList' : 'commentsList', new FormControl([], Validators.required));

    this.userCommentForm.valueChanges.subscribe((data) => {
      console.log(data);
    })
  }

  public addComment(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value.trim();
    const oldValue = this.userCommentForm.get('commentsList').value;

    if ((value || '')) {
      oldValue.push(value);
      this.userCommentForm.get('commentsList').setValue(oldValue);
    }

    if (input) {
      input.value = '';
    }
  }

  public removeComment(comment: string): void {
    const oldValue = this.userCommentForm.get('commentsList').value;
    const index = oldValue.indexOf(comment);

    if (index >= 0) {
      oldValue.splice(index, 1)
      this.userCommentForm.get('commentsList').setValue(oldValue);
    }
  }

  public searchForAccounts(searchTerm: { originalEvent: any, query: string }): void {
    const sendingData: SearchTerm = { type: "user", query: searchTerm.query }

    this.searchStream$ = this._autoSubscribeOrWatchStoryService.searchFor(sendingData).pipe(
      takeUntil(this.unsubscribe$),
      map(search => search.data)
    )
  }

  private _postCommentsList(): void {
    const sendingData: CommentsList = {
      comment: JSON.stringify(this.userCommentForm.get('commentsList').value),
      name: this.userCommentForm.get('name').value
    }
    this._listService.addCommentsList(sendingData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        this._dialogRef.close('comments');
      })
  }

  private _postUsersList(): void {
    const sendingData: UsersList = {
      users: JSON.stringify(this.userCommentForm.get('usersList').value),
      name: this.userCommentForm.get('name').value
    }
    this._listService.addUsersList(sendingData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        this._dialogRef.close('users');
      })
  }

  public onSave(): void {
    if (this.userCommentForm.valid) {
      if (this.data == 'commentsList') {
        this._postCommentsList();
      } else {
        this._postUsersList()
      }
    }
  }

  public resetForm(): void {
    this.userCommentForm.reset();
    this.userCommentForm.get(this.data == 'commentsList' ? 'commentsList' : 'usersList').setValue([]);
  }

  public closeDialog(): void {
    this._dialogRef.close();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
