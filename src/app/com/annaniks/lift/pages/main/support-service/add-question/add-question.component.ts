import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MainService } from '../../main.service';
import { takeUntil, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SupportService } from '../support-service.service';
import { CreateTicketData } from '../../../../core/models/support-service';
import { SupportTicketCategory } from '../../../../core/models/account-settings';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.scss']
})
export class AddQuestionComponent implements OnInit {
  private _unsubscribe$: Subject<void> = new Subject<void>();
  public loading: boolean = false;
  public questionForm: FormGroup;
  public supportCategories: SupportTicketCategory[] = [];
  public errorMessage: string;
  public attachedFiles: File[] = [];


  constructor(
    private _dialogRef: MatDialogRef<AddQuestionComponent>,
    private _fb: FormBuilder,
    private _mainService: MainService,
    private _supportService: SupportService,
    private _toastrService: ToastrService
  ) { }

  ngOnInit() {
    this._formBuilder();
    this._getSettingsVariants();
  }

  public closeModal(): void {
    this._dialogRef.close();
  }

  private _formBuilder(): void {
    this.questionForm = this._fb.group({
      subject: [null, Validators.required],
      questionCategory: [null, Validators.required],
      message: [null, Validators.required]
    })
  }

  private _getSettingsVariants(): void {
    this._mainService.getAccountSettingsVariants()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(
        (settings) => {
          this.supportCategories = settings.supportTicketCategores.map(item => {item['value'] = item.id; return item});
        })
  }

  private _createTicket(): void {
    this.loading = true;
    const createTicketData: CreateTicketData = {
      categoryId: this.questionForm.get('questionCategory').value || 0,
      title: this.questionForm.get('subject').value,
      message: this.questionForm.get('message').value,
    }
    this._supportService.createTicket(createTicketData,this.attachedFiles)
      .pipe(
        takeUntil(this._unsubscribe$),
        finalize(() => this.loading = false)
      )
      .subscribe((data) => {
        this._toastrService.success('Ваше сообщение успешно отправлено');
        this._dialogRef.close({
          isCreatedTicket: true
        });
      },
        (err) => {
          const error = err.error;
          this.errorMessage = error.message || 'Ошибка';
          this._toastrService.error(this.errorMessage)
        })
  }

  public onClickSend(): void {
    if (this.questionForm.valid) {
      this._createTicket();
    }
  }

  public onChangeFiles($event, fileInput): void {
    const files = $event;
    const fileList: FileList = files.target.files;
    for (let i = 0; i < fileList.length; i++) {
      const file: File = fileList[i];
      this.attachedFiles.push(file);
    }
    fileInput.value = null;
    $event.preventDetault();
  }

  public onClickRemoveAttachedFile(index: number): void {
    this.attachedFiles.splice(index, 1);
  }

  public checkIsValid(controlName): boolean {
    return this.questionForm.get(controlName).hasError('required') && this.questionForm.get(controlName).touched;
  }

}
