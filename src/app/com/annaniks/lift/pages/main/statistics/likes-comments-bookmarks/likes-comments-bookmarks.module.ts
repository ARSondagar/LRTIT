
// Angular Core Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material';

// Our Modules
import { LikesCommentsBookmarksRoutingModule } from './likes-comments-bookmarks.routing.module';
import { LikesCommentsBookmarksService } from './likes-comments-bookmarks.service';
import { SharedModule } from '../../../../shared/shared.module';

@NgModule({
    declarations: [
        LikesCommentsBookmarksRoutingModule.components,

    ],
    imports: [
        LikesCommentsBookmarksRoutingModule,
        CommonModule,
        SharedModule,
        MatDatepickerModule
    ],

    providers: [LikesCommentsBookmarksService]
})
export class LikesCommentsBookmarksModule { }
