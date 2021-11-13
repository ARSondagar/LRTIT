import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListsComponent } from './lists.component';

const listsRoute: Routes = [
    { path: '', component: ListsComponent }
]

@NgModule({
    imports: [RouterModule.forChild(listsRoute)],
    exports: [RouterModule]
})
export class ListRoutingModule { }