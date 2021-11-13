import { NgModule } from '@angular/core';
import { JoinComponent } from './join.component';
import { JoinRoutingModule } from './join.routing.module';
import { JoinService } from './join.service';

@NgModule({
    declarations: [JoinComponent],
    imports: [JoinRoutingModule],
    providers: [JoinService]
})
export class JoinModule { }