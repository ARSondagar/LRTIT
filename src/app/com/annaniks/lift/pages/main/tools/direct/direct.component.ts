import { InstagramAccount } from 'src/app/com/annaniks/lift/core/models/user';
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MessagingService } from './messaging.service'
import { Subject, timer } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { DirectService } from './direct.service';
import { Mailing, SendMessageTypes } from '../../../../core/models/direct';
import { DirectMessage, WriteDirectMessageData } from '../../../../core/models/direct.message';
import { LoadingService } from '../../../../core/services';
import { Store, select } from '@ngrx/store';
import { currentInstagramSelector } from '../../../auth/store/selectors';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';



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
  public createChatOpened = false;
  public threadsLoading = true;
  public messagesLoading = true;
  public activeTab = 1;
  public files: string[] = [];
  public activeMailingTexts: string[];
  public isToggleOpen = true;

  public currentInstagram: InstagramAccount;

  constructor(
    private _messagingService: MessagingService,
    public appSvc: AppService,
    private _directService: DirectService,
    private store: Store,
    private _loadingService: LoadingService,
    private router: Router
  ) { }

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
        this.threadsLoading = false;
        if (this.allChats && this.allChats.length > 0) {
          this.setActiveChat(this.allChats[0])
        } else {
          this.messagesLoading = false;
        }
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
        this.threadsLoading = false;
        this.messagesLoading = false;
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
        console.log('Unread message', chats);
        chats.messages = this._sortMessagesByDate(chats.messages)
        chats.messages.forEach(chat => {
          if (String(chat.user_id) !== this.currentInstagram.instagramId) {
            this.activeChatMessages.push(chat)

          }
        });
        this.allChats.forEach((data) => {
          const chatIndex = chatsArray.findIndex((element) => element.thread_id === data.thread_id);
          if (chatIndex === -1) {
            chatsArray.push(data);
          }
        })
        this.allChats = chatsArray;
        // this._scroolIntoVeryBottomOfMessagesContainer()
      })
  }

  public sendMessage(message: string, type): void {
    if (type === SendMessageTypes.Direct) {
      if (!this.threadsLoading && !this.messagesLoading) {
        this._loadingService.showLoading();
        const writeMessageData: WriteDirectMessageData = {
          thread_id: this.activeChat.thread_id,
          message: message,
        }
        this._messagingService.sendMessage(writeMessageData);
      }
    } else if (type === SendMessageTypes.Schedule) {
      this._directService.sendSchedule.next(message);
    }

  }

  public setActiveTab(tabNumber?: number): void {
    this.activeTab = tabNumber;
  }

  public getPhotoByUserIdAndCheckIfIncoming(userId: number): { picture: string, isIncoming: boolean } {
    let profilePicture: string = this.currentInstagram.avatar || 'assets/icons/avatar.png'
    let isIncoming = false;
    this.activeChat.users.map(user => {
      if (user.pk === userId) {
        profilePicture = user.profile_pic_url
      }
    })
    if (userId.toString() === this.currentInstagram.instagramId) {
      isIncoming = true
    }
    return { picture: profilePicture, isIncoming }
  }

  public setActiveChat(thread) {
    this.messagesLoading = true;
    this.activeChat = thread;
    this.activeChatMessages = [];
    if (thread) {
      this._messagingService.setActiveChat(thread);
    }
  }

  private _subscribeToMessageStatus(): void {
    this._messagingService.messageSuccessfullySent()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((data) => {
        this.activeChatMessages.push(data.item)
        this._scroolIntoVeryBottomOfMessagesContainer();
        this._loadingService.hideLoading();
      })
  }

  public handleToggleClick() {
    this.isToggleOpen = !this.isToggleOpen;
  }

  public handleFileSend(file: String | FormData): void {
    if (file instanceof FormData) {
      this._uploadTxt(file);
    } else {
      if (!this.threadsLoading && !this.messagesLoading) {
        this._loadingService.showLoading();
        this._messagingService.uploadBase64(file.toString())
      }
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
        this.allChats.forEach((chat, ind: number) => {
          if (chat.thread_id === data.threed.thread_id) {
            index = ind
          }
        })
        this.allChats[index] = data.threed
        if (this.activeChat.thread_id === this.allChats[index].thread_id) {
          this.activeChatMessages = this._sortMessagesByDate(data.items);
          this.allChats[index].read_state = 0;
        }
        this.messagesLoading = false;
      })
  }

  public onScrolledUp(): void {
    this._loadingService.showLoading()
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
        this._loadingService.hideLoading();
        const sortedMessage = this._sortMessagesByDate(moreMessages.items);
        this.activeChatMessages.unshift(...sortedMessage);
      })
  }

  public onClickedOutside(): void {
    if (this.createChatOpened) {
      this.createChatOpened = false;
    }
  }

  private _scroolIntoVeryBottomOfMessagesContainer(): void {
    timer(1000)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(() => {

        const messagesContainer = document.getElementById(`message-item-${String(this.activeChatMessages.length - 1)}`);
        messagesContainer.scrollIntoView({ behavior: 'smooth' })
        console.log(messagesContainer);
      })
  }

  private _sortMessagesByDate(messages) {
    return [...messages].sort(function (a, b) {
      return Number(a.timestamp) - Number(b.timestamp);
    });
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
    this._messagingService.socket.removeAllListeners();
    this._messagingService.socket.disconnect();
  }

  goToPayment() {
    this.router.navigateByUrl('tariff/tarif_new');
  }

}
