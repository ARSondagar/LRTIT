// Angular Core Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular files
import { SharedModule } from '../../../../shared/shared.module';
import { ListRoutingModule } from './lists.routing.module';
import { ListsComponent } from './lists.component';
import { CreateUserCommentComponent } from './create-user-comment/create-user-comment.component';
import { ListService } from './list.service';

@NgModule({
    declarations: [
        ListsComponent,
        CreateUserCommentComponent
    ],
    imports: [
        ListRoutingModule,
        CommonModule,
        SharedModule,
    ],
    entryComponents: [CreateUserCommentComponent],
    providers: [ListService]
})
export class ListModule { }