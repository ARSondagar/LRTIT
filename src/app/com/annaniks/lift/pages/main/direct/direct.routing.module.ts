import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DirectComponent } from './direct.component';
import { MessageItemComponent } from './components';
import { CreateChatComponent } from './components/create-chat/create-chat.component';


const directRoutes: Routes = [
    { path: '', component: DirectComponent }
]

@NgModule({
    imports: [RouterModule.forChild(directRoutes)],
    exports: [RouterModule]
})
export class DirectRoutingModule {
    static components = [DirectComponent, CreateChatComponent, MessageItemComponent]
}