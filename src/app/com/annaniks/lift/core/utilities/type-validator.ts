import { AbstractControl } from '@angular/forms';

export function RequireMatchOfType(control: AbstractControl) {
    const selection: any = control.value;

    if (typeof selection === 'string' && selection.length > 0) {
        return { autocomplete: true };
    }
    return null;
}
