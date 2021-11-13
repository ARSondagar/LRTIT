import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { ToolsComponent } from './tools.component';
import { ToolsRoutingModule } from './tools.routing.module';
import { ToolsService } from './tools.service';

@NgModule({
    declarations: [ToolsComponent],
    imports: [ToolsRoutingModule, CommonModule],
    providers: [ToolsService]
})

export class ToolsModule { }