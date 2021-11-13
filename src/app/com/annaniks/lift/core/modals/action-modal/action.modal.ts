import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'action-modal',
    templateUrl: 'action.modal.html',
    styleUrls: ['action.modal.scss']
})

export class ActionModal implements OnInit {

    constructor(private _dialogRef: MatDialogRef<ActionModal>) { }

    ngOnInit() { }

    public closeModal(): void {
        this._dialogRef.close('no');
    }

    public onclickSave(): void {
        this._dialogRef.close('yes');
    }
}