import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArticleCategoryListComponent } from './article-category-list.component';

const arcticleCategoryListRoutes: Routes = [
    { path: '', component: ArticleCategoryListComponent }
]

@NgModule({
    imports: [RouterModule.forChild(arcticleCategoryListRoutes)],
    exports: [RouterModule]
})
export class ArcticleCategoryListRoutingModule { }