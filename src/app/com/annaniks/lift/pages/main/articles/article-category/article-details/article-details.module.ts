import { NgModule } from '@angular/core';
import { ArcticleDetailsRoutingModule } from './article-details.routing.module';
import { ArcticleDetailsComponent } from './article-details.component';
import { ArticleDetailsService } from './article-details.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/com/annaniks/lift/shared/shared.module';

@NgModule({
    declarations: [
        ArcticleDetailsComponent
    ],
    imports: [
        ArcticleDetailsRoutingModule,
        CommonModule,
        SharedModule
    ],
    providers: [
        ArticleDetailsService
    ]
})
export class ArcticleDetailsModule { }