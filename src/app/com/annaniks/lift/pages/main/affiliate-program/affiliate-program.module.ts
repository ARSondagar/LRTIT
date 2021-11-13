import { NgModule } from '@angular/core';
import { AffiliateProgramRoutingModule } from './affiliate-program.routing.module';
import { AffiliateProgramComponent } from './affiliate-program.component';
import { AffiliateProgramService } from './affiliate-program.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
    declarations: [AffiliateProgramComponent],
    imports: [AffiliateProgramRoutingModule,
              CommonModule,
              FormsModule,
              ReactiveFormsModule,
              SharedModule,
              MatProgressSpinnerModule
    ],
    providers: [AffiliateProgramService]
})
export class AffiliateProgramModule { }
