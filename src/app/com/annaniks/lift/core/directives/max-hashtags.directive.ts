import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Directive({
    selector: '[MaximumHashtags]'
})
export class MaxHashtags {
    @Input() public hashtagsCount: number;
    @Input() public inputControl: FormControl;
    constructor(private el: ElementRef) { }

    @HostListener('keydown', ['$event']) onKeyDown(event) {
        let e = <KeyboardEvent>event;
        let word = '';
        const myElement = document.getElementById('QWERTY') as any
        const startPosition = myElement.selectionStart;
        let count = startPosition;
        while (count > 0) {
            const element = this.inputControl.value[count];
            if (element != ' ') {
                word = element + word
            } else {
                break;
            }
            count--
        }
        if (
            (this.inputControl.value.match(/(^|\W)(#[a-z\d][\w-]*)/g) || []).length > this.hashtagsCount &&
            e.keyCode !== 8 &&
            word.includes('#')
        ) {
            e.preventDefault();
        }

    }
}