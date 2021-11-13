
import { FormControl, ValidationErrors, FormGroup, AbstractControl } from '@angular/forms';

export class HashtagsCount {
    public static hastagsCountValidator(control: FormControl | AbstractControl): ValidationErrors {
        const value: string = control.value;
        const count = (value.match(/(^|\W)(#[a-z\d][\w-]*)/g) || []).length;

        if (count > 12) {
            return {
                maxCount: true
            }
        }
        return null;
    }
}
