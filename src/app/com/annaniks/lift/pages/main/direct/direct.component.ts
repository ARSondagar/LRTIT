import { InstagramAccount } from 'src/app/com/annaniks/lift/core/models/user';
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { NavbarService } from '../../../core/services/navbar.service';
import { MessagingService } from './messaging.service'
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { WriteDirectMessageData, DirectMessage } from '../../../core/models/direct.message';
import { DirectService } from './direct.service';
import { SendMessageTypes, Mailing } from '../../../core/models/direct';
import { LoadingService } from '../../../core/services/loading-service';
import { Store, select } from '@ngrx/store';
import { currentInstagramSelector } from '../../auth/store/selectors';


@Component({
  selector: 'app-direct',
  templateUrl: './direct.component.html',
  styleUrls: ['./direct.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DirectComponent implements OnInit, OnDestroy {
  private _unsubscribe$: Subject<void> = new Subject<void>();
  public allChats: any[] = [];
  public newMailings: Mailing[] = [];
  public oldMailings: Mailing[] = [];
  public activeChatMessages: DirectMessage[] = []
  public activeChat: any;
  public createChatOpened: boolean = false;
  public loading: boolean = false;
  public activeTab: number = 1;
  public files: string[] = [];
  public activeMailingTexts: string[];

  currentInstagram: InstagramAccount;

  constructor(
    private _navbarService: NavbarService,
    private _authService: AuthService,
    private _messagingService: MessagingService,
    private store: Store,
    private _directService: DirectService,
    private _loadingService: LoadingService
  ) {
    this.loading = true
    this._navbarService.setNavbarItems([]);
  }

  ngOnInit() {
    this._fetchMessages();
    this.subscribeToActiveChatEvent();
    this.getMoreMessages()
    this._immediatlyFetchMessages()
    this.getMoreInbox();
    this._getUnreadChats();
    this._fetchUserMailings();
    this._subscribeToMessageStatus();
    this._subscribeToUpdateMailings()

    this.store.pipe(select(currentInstagramSelector)).subscribe(resp => {
      this.currentInstagram = resp;
    })
  }

  private _subscribeToUpdateMailings(): void {
    this._directService.updateMailingState
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(() => {
        this._fetchUserMailings();
      })
  }

  private _immediatlyFetchMessages(): void {
    this._messagingService.immediatlyFetchMessages();
  }

  private _fetchMessages(): void {
    this._messagingService.getMessage()
      .pipe(
        takeUntil(this._unsubscribe$),
      )
      .subscribe((data) => {
        this.allChats = data;
        this.setActiveChat(this.allChats[0])
      })
  }

  private _fetchUserMailings(): void {
    this._loadingService.showLoading();
    this._directService.getNewUserMailings()
      .pipe(
        takeUntil(this._unsubscribe$),
        finalize(() => this._loadingService.hideLoading()),
      )
      .subscribe((data) => {
        this.newMailings = data.data.newMailing;
        this.oldMailings = data.data.oldMailing;
      })
  }

  public setActiveMailingText(text: string[]): void {
    this.activeMailingTexts = [...text]
  }

  private _getUnreadChats(): void {
    this._messagingService.getUnreads()
      .pipe(
        takeUntil(this._unsubscribe$)
      )
      .subscribe(chats => {
        const chatsArray = [];
        chatsArray.push(...chats.items);
        this.allChats.map((data) => {
          const chatIndex = chatsArray.findIndex((element) => element.thread_id === data.thread_id);
          if (chatIndex == -1) {
            chatsArray.push(data);
          }
        })
        this.allChats = chatsArray;
      })
  }

  public sendMessage(message: string, type): void {
    if (type == SendMessageTypes.Direct) {
      const writeMessageData: WriteDirectMessageData = {
        thread_id: this.activeChat.thread_id,
        message: message,
      }
      this._messagingService.sendMessage(writeMessageData);
    } else if (type == SendMessageTypes.Schedule) {
      this._directService.sendSchedule.next(message);
    }

  }

  public setActiveTab(tabNumber?: number): void {
    this.activeTab = tabNumber;
  }

  public getPhotoByUserIdAndCheckIfIncoming(userId: number): { picture: string, isIncoming: boolean } {
    let profilePicture: string = this.currentInstagram.avatar || 'assets/icons/avatar.png'
    let isIncoming: boolean = false;
    this.activeChat.users.map(user => {
      if (user.pk == userId) {
        profilePicture = user.profile_pic_url
      }
    })
    if (userId.toString() == this.currentInstagram.instagramId) {
      isIncoming = true
    }
    return { picture: profilePicture, isIncoming }
  }

  public setActiveChat(thread) {
    this.loading = true;
    this.activeChat = thread;
    this.activeChatMessages = [];
    if (thread) {
      this._messagingService.setActiveChat(thread)
    }
  }

  private _subscribeToMessageStatus(): void {
    this._messagingService.messageSuccessfullySent()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((data) => {
        this.activeChatMessages.unshift(data.item)
      })
  }


  public handleFileSend(file: String | FormData): void {
    if (file instanceof FormData) {
      this._uploadTxt(file);
    } else {
      this._messagingService.uploadBase64(file.toString())
    }
  }

  private _uploadTxt(file: FormData): void {
    this._loadingService.showLoading();
    this._directService.uploadTxt(file).pipe(
      finalize(() => this._loadingService.hideLoading()),
      takeUntil(this._unsubscribe$)
    ).subscribe((data) => {
      this.files = [...data.data]
    })
  }

  public subscribeToActiveChatEvent(): void {
    this._messagingService.subscribeToActiveThread()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((data) => {
        let index: number;
        this.allChats.map((chat, ind: number) => {
          if (chat.thread_id == data.threed.thread_id) {
            index = ind
          }
        })
        this.allChats[index] = data.threed
        this.activeChatMessages = data.items;
        this.loading = false
      })
  }

  public onScrolledUp(): void {
    this._messagingService.emitMoreMessages();
  }

  public moreInbox(): void {
    this._messagingService.emitMoreInbox()
  }



  public getMoreInbox(): void {
    this._messagingService.getMoreInbox()
      .pipe(
        takeUntil(this._unsubscribe$)
      )
      .subscribe((moreInbox) => {
        if (moreInbox.messages.length > 0) {
          this.allChats.push(...moreInbox.messages)
        }
      })
  }

  public getMoreMessages(): void {
    this._messagingService.getMoreMessages()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(moreMessages => {
        this.activeChatMessages.push(...moreMessages.items)

        // this.allChats[this.activeChatIndex].items.push(...moreMessages.items)
      })
  }

  public onClickedOutside(): void {
    if (this.createChatOpened) {
      this.createChatOpened = false;
    }
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
    this._messagingService.socket.removeAllListeners();
    this._messagingService.socket.disconnect();
  }

}
