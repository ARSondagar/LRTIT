import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArticlesComponent } from './articles.component';

const articlesRoutes: Routes = [
    {
        path: '', component: ArticlesComponent, children: [
            {
                path: '',
                redirectTo: '/articles/most-popular',
                pathMatch: 'full'
            },
            {
                path: 'most-popular',
                loadChildren: () => import('./most-popular/most-popular.module').then(m => m.MostPopularModule)
            },
            {
                path: 'category',
                loadChildren: () => import('./article-category/article.category.module').then(m => m.ArticleCategoryModule)
            }

        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(articlesRoutes)],
    exports: [RouterModule]
})
export class ArticlesRoutingModule { }