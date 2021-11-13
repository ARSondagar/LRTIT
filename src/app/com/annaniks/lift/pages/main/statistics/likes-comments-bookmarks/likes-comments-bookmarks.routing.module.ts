import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LikesCommentsBookmarksComponent } from './likes-comments-bookmarks.component';

const likesCommentsBookmarksRoutes: Routes = [
    { path: '', component: LikesCommentsBookmarksComponent }
]

@NgModule({
    imports: [RouterModule.forChild(likesCommentsBookmarksRoutes)],
    exports: [RouterModule]
})
export class LikesCommentsBookmarksRoutingModule {
    static components = [LikesCommentsBookmarksComponent]
}