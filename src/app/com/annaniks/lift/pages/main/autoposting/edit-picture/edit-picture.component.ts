import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ToastUiImageEditorComponent } from 'ngx-tui-image-editor';

@Component({
  selector: 'app-edit-picture',
  templateUrl: './edit-picture.component.html',
  styleUrls: ['./edit-picture.component.scss']
})
export class EditPictureComponent implements OnInit, AfterViewInit {
  @ViewChild(ToastUiImageEditorComponent, { static: false }) editorComponent: ToastUiImageEditorComponent;

  constructor(
    private _dialogRef: MatDialogRef<EditPictureComponent>,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      console.log(this.editorComponent);
    }, 5000);
  }

  closeDialog(confirm: boolean): void {
    if (confirm) {
      this._dialogRef.close(this.editorComponent.editorInstance.toDataURL());
    } else {
      this._dialogRef.close();
    }
  }
}
