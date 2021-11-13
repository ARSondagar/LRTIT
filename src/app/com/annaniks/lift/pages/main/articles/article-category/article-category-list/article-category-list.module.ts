import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArcticleCategoryListRoutingModule } from './article-category-list.routing.module';
import { ArticleCategoryListComponent } from './article-category-list.component';

// 3rd Part Modules
import { NgxPaginationModule } from 'ngx-pagination';
import { ArticlePreviewComponent } from './article-preview/article-preview.component';

@NgModule({
    declarations: [
        ArticleCategoryListComponent,
        ArticlePreviewComponent
    ],
    imports: [
        ArcticleCategoryListRoutingModule,
        CommonModule,
        NgxPaginationModule
    ],
})
export class ArcticleCategoryListModule { }