import { NgModule } from '@angular/core';
import { ArcticleDetailsRoutingModule } from './article-details.routing.module';
import { ArcticleDetailsComponent } from './article-details.component';
import { ArticleDetailsService } from './article-details.service';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        ArcticleDetailsComponent
    ],
    imports: [
        ArcticleDetailsRoutingModule,
        CommonModule
    ],
    providers: [
        ArticleDetailsService
    ]
})
export class ArcticleDetailsModule { }