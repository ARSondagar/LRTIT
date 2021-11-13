import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'takeWords',
})
export class TakeWordsPipe implements PipeTransform {
  transform(value: string, count = 5): any {
    return value.split(' ').slice(0, count).join(' ');
  }
}
