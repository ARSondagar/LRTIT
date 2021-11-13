import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';

const mainRoutes: Routes = [
    {
        path: '',
          component: MainComponent,
          children: [
            { path: '', redirectTo: '/statistics/preview', pathMatch: 'full' },
            {
                path: 'statistics',
                loadChildren: () => import('./statistics/statistics.module').then(m => m.StatisticsModule)
            },
            {
                path: 'promotion',
                loadChildren: () => import('./promotion/promotion.module').then(m => m.PromotionModule)
            },
            {
                path: 'autoposting',
                loadChildren: () => import('./autoposting/autoposting.module').then(m => m.AutopostingModule)
            },
            {
                path: 'tools',
                loadChildren: () => import('./tools/tools.module').then(m => m.ToolsModule)
            },
            {
                path: 'support-service',
                loadChildren: () => import('./support-service/support-service.module').then(m => m.SupportServiceModule)
            },
            {
                path: 'profile',
                loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule)
            },
            {
                path: 'support',
                loadChildren: () => import('./support-service/support-service.module').then(m => m.SupportServiceModule)
            },
            {
                path: 'support/:id',
                loadChildren: () => import('./support-service/ticket/ticket.module').then(m => m.TicketModule)
            },
            // {
            //     path: 'affiliate-program',
            //     loadChildren: () => import('./affiliate-program/affiliate-program.module').then(m => m.AffiliateProgramModule)
            // },
            {
                path: "tariff",
                loadChildren: () => import('./tariff/tariff.module').then(m => m.TariffModule)
            },
            {
                path: 'articles',
                loadChildren: () => import('./articles/articles.module').then(m => m.ArticlesModule),
            },
            {
                path: 'ticket/:ticketId',
                loadChildren: () => import('./support-service/ticket/ticket.module').then(m => m.TicketModule)
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(mainRoutes)],
    exports: [RouterModule]
})
export class MainRoutingModule {
    static components = [MainComponent]
}
