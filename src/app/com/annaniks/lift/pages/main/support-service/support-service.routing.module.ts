// Angular Core Modules
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Our Components
import { SupportServiceComponent } from './support-service.component';
import { AddQuestionComponent } from './add-question/add-question.component';

const supportServiceRoutes: Routes = [
    { path: '', component: SupportServiceComponent },

]

@NgModule({
    imports: [RouterModule.forChild(supportServiceRoutes)],
    exports: [RouterModule]
})
export class SupportServiceRoutingModule {
    static components = [SupportServiceComponent, AddQuestionComponent];
    static entryComponents = [AddQuestionComponent];
}