import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MessagingService } from '../../messaging.service';
import { SearchTerm, Search } from 'src/app/com/annaniks/lift/core/models/search';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AutoSubscribeOrWatchStoryService } from 'src/app/com/annaniks/lift/shared/services/auto-subscribe-watch-story.service';


@Component({
  selector: 'app-create-chat',
  templateUrl: './create-chat.component.html',
  styleUrls: ['./create-chat.component.scss'],
})
export class CreateChatComponent implements OnInit {

  @Input() allChats: any;
  @Input() activeChat: any;
  @Input() createChatOpened: boolean;

  @Output() allChatsChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() activeChatChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() createChatOpenedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public chatMembers: FormControl = new FormControl('');
  public searchStream$: Observable<Search>;
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _messagingService: MessagingService,
    private _autoSubscribeOrWatchStoryService: AutoSubscribeOrWatchStoryService,
  ) {
  }

  ngOnInit() {
    this.subscribeToChatCreating();
  }

  public createChat(): void {
    let memebers: number[] = []
    this.chatMembers.value.filter(element => {
      memebers.push(Number(element.pk));
    });
    this._messagingService.createChat(memebers);
  }

  public searchFor(searchEvent): void {
    let searchTerm: SearchTerm = {
      query: searchEvent.query,
      type: 'user'
    }
    searchTerm.type = 'user';
    this.searchStream$ = this._autoSubscribeOrWatchStoryService.searchFor(searchTerm).pipe(map(search => search.data))
  }

  public subscribeToChatCreating(): void {
    this._messagingService.subscribeToChat()
      .pipe(
        takeUntil(this._unsubscribe$)
      )
      .subscribe(data => {
        let isChatExists: boolean = false
        let chatIndex: number = 0;
        this.allChats.map((chat, index: number) => {
          if (chat.thread_id == data.newThreed.thread_id) {
            isChatExists = true;
            chatIndex = index
          }
        })
        if (!isChatExists) {
          this.allChats.unshift(data.newThreed)
          this._actionsAfterChatCreating(this.allChats[chatIndex])
          this.allChatsChange.emit(this.allChats)
        } else {
          this._actionsAfterChatCreating(this.allChats[chatIndex])
        }
      })
  }

  private _actionsAfterChatCreating(chatIndex): void {
    this._messagingService.setActiveChat(this.allChats[chatIndex])
    this.activeChat = chatIndex;
    this.createChatOpened = false;
    this.activeChatChange.emit(this.activeChat);
    this.createChatOpenedChange.emit(this.createChatOpened)
  }
}
