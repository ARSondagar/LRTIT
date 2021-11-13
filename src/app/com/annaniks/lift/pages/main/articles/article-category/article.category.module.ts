// Angular Core Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Our Modules
import { SharedModule } from '../../../../shared/shared.module';
import { ArticleCategoryRoutingModule } from './article-category.routing.module';


@NgModule({
    declarations: [
        ArticleCategoryRoutingModule.components,
    ],
    imports: [
        ArticleCategoryRoutingModule,
        CommonModule,
        SharedModule
    ]
})
export class ArticleCategoryModule { }
