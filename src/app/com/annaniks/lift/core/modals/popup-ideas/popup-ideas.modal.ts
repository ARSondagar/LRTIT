import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({

    selector: 'popup-ideas',
    templateUrl: 'popup-ideas.modal.html',
    styleUrls: ['popup-ideas.modal.scss']
})

export class PopUpModal implements OnInit {

    public popUpGroup: FormGroup;

    constructor(private _dialogRef: MatDialogRef<PopUpModal>, private _fb: FormBuilder) { }

    ngOnInit() {
        this._formBuilder();
    }


    public closeModal(): void {
        this._dialogRef.close();
    }

    private _formBuilder(): void {
        this.popUpGroup = this._fb.group({
            search: ['', Validators.required]
        })
    }
}