import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class EventBusService {
    private _subject = new Subject()

    // TODO: Need Typing
    public emit(event): void {
        this._subject.next(event)
    }
    // TODO: Need Typing
    public on(event: Event, action: any): Subscription {
        return this._subject.pipe(
            filter((e: any) => e.name === event),
            map((e: any) => e.value)
        ).subscribe(action)
    }
}