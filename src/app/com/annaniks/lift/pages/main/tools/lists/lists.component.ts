import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatChipInputEvent, MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material';
import { CreateUserCommentComponent } from './create-user-comment/create-user-comment.component';
import { ListService } from './list.service';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, finalize, map, switchMap, filter, debounceTime } from 'rxjs/operators';
import { CommentsList, UsersList } from '../../../../core/models/my-lists';
import { FormControl } from '@angular/forms';
import { SLASH, COMMA, AT_SIGN } from '@angular/cdk/keycodes';
import { LoadingService } from '../../../../core/services';
import { SearchTerm, Search } from '../../../../core/models/search';
import { AutoSubscribeOrWatchStoryService } from '../../../../shared/services/auto-subscribe-watch-story.service';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss']
})
export class ListsComponent implements OnInit, OnDestroy {

  @ViewChild('instaAccountInput', { static: false }) instaAccountInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  public listTypeControlOption = [
    {value: 'usersList', name: 'Пользователи'},
    {value: 'commentsList', name: 'Коментарии'},
  ];
  public searchStream$: Observable<Search>
  private _unsubscribe$ = new Subject();
  private _commentsLists: CommentsList[] = [];
  private _usersLists: UsersList[] = [];
  public showingList: any = [];
  public listTypeControl = new FormControl(this.listTypeControlOption[0]);
  public searchControl = new FormControl('');
  public instaSearchControl = new FormControl('');
  readonly selectable = true;
  readonly removable = true;
  readonly addOnBlur = true;
  readonly usersSeparatorKeyCodes: number[] = [COMMA, AT_SIGN]
  readonly separatorKeysCodes: number[] = [SLASH];

  constructor(
    private _dialog: MatDialog,
    private _listService: ListService,
    private _loadingService: LoadingService,
    private _autoSubscribeOrWatchStoryService: AutoSubscribeOrWatchStoryService
  ) { }

  ngOnInit() {
    this._subscribeToListTypeChange()
    this._getAllUsersLists();
    this._searchForAccounts();
  }

  public openCreateUserComment(event?): void {
    const dialogRef = this._dialog.open(CreateUserCommentComponent, {
      maxWidth: '860px',
      width: '90%',
      panelClass: 'events-scheduler-dialog',
      data: this.listTypeControl.value
    });
    dialogRef.afterClosed().subscribe((v) => {
      if (v === 'comments') {
        this._getAllCommentsLists();
      } else if (v === 'users') {
        this._getAllUsersLists();
      }
    })
  }

  private _getAllUsersLists(): void {
    this._listService.getAllUsersLists()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((response) => {
        response.data.forEach(element => element.users = JSON.parse(element.users))
        this._usersLists = response.data;
        this.showingList = response.data;

      })
  }

  private _getAllCommentsLists(): void {
    this._listService.getAllCommentsLists()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((response) => {
        response.data.forEach(element => element.comment = JSON.parse(element.comment))
        this._commentsLists = response.data
        this.showingList = response.data
      })
  }

  private _subscribeToListTypeChange(): void {
    this.listTypeControl.valueChanges.subscribe(data => {
      if (data == 'usersList') {
        if (this._usersLists.length > 0) {
          this.showingList = this._usersLists;
        }
      } else {
        if (this._commentsLists.length > 0) {
          this.showingList = this._commentsLists;
          return
        }
        this._getAllCommentsLists();
      }
    })
  }


  public addComment(event: MatChipInputEvent, index: number, type: string): void {
    const input = event.input;
    const value = event.value.trim();

    if ((value || '')) {
      if (type == 'commentsList') {
        this.showingList[index].comment.push(value);
      } else {
        this.showingList[index].users.push(value);
      }
    }

    if (input) {
      input.value = '';
    }
  }

  public removeComment(comment: string, ind: number, type: string): void {
    const oldValue = type == 'commentsList' ? this.showingList[ind].comment : this.showingList[ind].users;
    const index = oldValue.indexOf(comment);

    if (index >= 0) {
      if (type == 'commentsList') {
        this.showingList[ind].comment.splice(index, 1)
      } else {
        this.showingList[ind].users.splice(index, 1)
      }
    }
  }

  public editCommentsList(comment: CommentsList): void {
    this._loadingService.showLoading();
    this._listService.editCommentsList(comment)
      .pipe(
        finalize(() => this._loadingService.hideLoading()),
        takeUntil(this._unsubscribe$)
      )
      .subscribe(response => {
        console.log(response);
      })
  }


  public editUsersList(user: UsersList): void {
    this._loadingService.showLoading();
    this._listService.editUsersList(user)
      .pipe(
        finalize(() => this._loadingService.hideLoading()),
        takeUntil(this._unsubscribe$)
      )
      .subscribe(response => {
        console.log(response);
      })
  }

  private _deleteCommentsList(comment: CommentsList, index: number): void {
    this._loadingService.showLoading();
    this._listService.deleteCommentsList(comment.id)
      .pipe(
        finalize(() => this._loadingService.hideLoading()),
        takeUntil(this._unsubscribe$)
      )
      .subscribe(() => {
        this.showingList.splice(index, 1);
      })
  }

  private _deleteUsersList(userList: UsersList, index: number): void {
    this._loadingService.showLoading();
    this._listService.deleteUsersList(userList.id)
      .pipe(
        finalize(() => this._loadingService.hideLoading()),
        takeUntil(this._unsubscribe$)
      )
      .subscribe(() => {
        this.showingList.splice(index, 1);
      })
  }

  public onEditList(item: any): void {
    if (this.listTypeControl.value == 'commentsList') {
      this.editCommentsList(item);
    } else {
      this.editUsersList(item)
    }

  }

  public onListDelete(item: any, index: number): void {
    if (this.listTypeControl.value == 'commentsList') {
      this._deleteCommentsList(item, index);
    } else {
      this._deleteUsersList(item, index);
    }
  }

  private _searchForAccounts(): void {
    this.searchStream$ = this.instaSearchControl.valueChanges
      .pipe(
        takeUntil(this._unsubscribe$),
        debounceTime(500),
        switchMap((data) => {
          const sendingData: SearchTerm = { type: 'user', query: data }
          if (typeof sendingData.query != 'string') {
            return of<Search>()
          }
          return this._autoSubscribeOrWatchStoryService.searchFor(sendingData).pipe(map(search => search.data)
          )
        })
      )
  }

  public selected(event: MatAutocompleteSelectedEvent, index: number): void {
    this.showingList[index].users.push(event.option.value);
    this.instaAccountInput.nativeElement.value = '';
    this.instaSearchControl.setValue(null);
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
}
