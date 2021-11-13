import { Component, OnInit, Output, EventEmitter, Input, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SendMessageTypes } from 'src/app/com/annaniks/lift/core/models/direct';
import { DirectService } from '../../direct.service';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss']
})
export class SendMessageComponent implements OnInit, OnDestroy {
  @Output() onTextSend: EventEmitter<string> = new EventEmitter();
  @Output() onFileSend: EventEmitter<any> = new EventEmitter();
  @Input() type: any;
  @Input('foreignText')
  set setText(texts: string[]) {
    if (texts && this.messageForm) {
      this.messageForm.get('message').setValue([...texts])
      this._texts = texts
    }
  }
  @ViewChild('fileInput', { static: false }) fileInput;

  public messageForm: FormGroup;
  private _texts: string[] = []
  private _unsubscribe: Subject<void> = new Subject<void>();
  constructor(
    private _fb: FormBuilder,
    private _directService: DirectService
  ) { }

  ngOnInit() {
    this._initForm();
    this._subscribeToDisableInput();
  }

  private _initForm(): void {
    this.messageForm = this._fb.group({
      message: [null, Validators.required]
    })
  }

  public handleInputChange(e): void {
    var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    const pattern = this.type == SendMessageTypes.Direct ? /image.*/ : /text.*/;
    var reader = new FileReader();
    if (!file.type.match(pattern)) {
      alert(`Можно загружать только файлы в формате ${this.type === SendMessageTypes.Direct ? 'jpeg' : 'txt'} `);
      return;
    }
    if (this.type == SendMessageTypes.Schedule) {
      const formData: FormData = new FormData();
      formData.append('txt', file, file.name);
      this.onFileSend.emit(formData)
    } else if (SendMessageTypes.Direct) {
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsDataURL(file);
    }
    this.fileInput.nativeElement.value = '';
  }

  private _subscribeToDisableInput(): void {
    this._directService.disableInputState.pipe(
      takeUntil(this._unsubscribe)
    ).subscribe((state: boolean) => {
      if (state || this.type == 'direct') {
        this.messageForm.get('message').enable();
        this.messageForm.get('message').reset();
      } else {
        this.messageForm.get('message').disable()
        this.messageForm.get('message').setValue([...this._texts])
      }
    })
  }

  private _handleReaderLoaded(e): void {
    this.onFileSend.emit(e.target.result)
  }

  sendMessage(): void {
    this.onTextSend.emit(this.messageForm.get('message').value);
    this.messageForm.get('message').reset();
  }

  ngOnDestroy() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }
} 
