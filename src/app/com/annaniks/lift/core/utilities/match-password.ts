import { FormGroup } from '@angular/forms';

export class MatchPassword {
    public check(passwordKey: string, confirmPasswordKey: string) {
        return (group: FormGroup): { [key: string]: boolean } | null => {
            const password = group.controls[passwordKey];
            const confirmPassword = group.controls[confirmPasswordKey];

            if (password.value !== confirmPassword.value) {
                return {
                    mismatchedPasswords: true
                };
            }
        };
    }
}