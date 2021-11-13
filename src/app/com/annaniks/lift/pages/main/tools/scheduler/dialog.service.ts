import { ElementRef, Injectable } from '@angular/core'
import { MatDialog, MatDialogRef } from '@angular/material'
import { CalendarEvent } from 'angular-calendar'
import { SchedulerDetailsComponent } from './scheduler-details/scheduler-details.component'

/**
 * Service to create modal dialog windows.
 */
@Injectable()
export class DialogService {

    constructor(public dialog: MatDialog) { }

    public openDialog(
        positionRelativeToElement: EventTarget,
        hasBackdrop = false,
        event: CalendarEvent,
        height = 'auto',
        width = '516px',
        minWidth = "300px",
        panelClass = 'scheduler-details'
    ): MatDialogRef<SchedulerDetailsComponent> {
        const dialogRef: MatDialogRef<SchedulerDetailsComponent> =
            this.dialog.open(SchedulerDetailsComponent, {
                hasBackdrop,
                height,
                width,
                minWidth,
                panelClass,
                data: { positionRelativeToElement, event }
            })
        return dialogRef
    }
}
