import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArticleCategoryComponent } from './article-category.component';

const articleCategoryRoutes: Routes = [
    {
        path: '', component: ArticleCategoryComponent, children: [
            {
                path: '',
                redirectTo: '/articles/category/list',
                pathMatch: 'full'
            },
            {
                path: 'list',
                loadChildren: () => import('./article-category-list/article-category-list.module').then(m => m.ArcticleCategoryListModule)
            },
            {
                path: 'post/:id',
                loadChildren: () => import('./article-details/article-details.module').then(m => m.ArcticleDetailsModule)
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(articleCategoryRoutes)],
    exports: [RouterModule]
})
export class ArticleCategoryRoutingModule {
    static components = [ArticleCategoryComponent]
}