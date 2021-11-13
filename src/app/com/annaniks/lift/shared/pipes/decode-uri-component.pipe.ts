import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decodeURIComponent',
})
export class DecodeURIComponentPipe implements PipeTransform {
  transform(input: string) {
    return decodeURIComponent(input);
  }
}
