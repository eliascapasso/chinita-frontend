import { NgModule } from '@angular/core';
import { AddEditComponent } from './add-edit/add-edit.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductsModule } from '../products/products.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AddEditCategoriesComponent } from './add-edit-categories/add-edit-categories.component';
import { EditServicesComponent } from './edit-services/edit-services.component';
import { OrderComponent } from './view-order/order.component';

@NgModule({
    declarations: [
        AddEditComponent,
        AddEditCategoriesComponent,
        EditServicesComponent,
        OrderComponent
    ],
    imports: [
        NgMultiSelectDropDownModule.forRoot(),
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        ProductsModule
    ],
    exports: [
        SharedModule,
        ProductsModule
    ]
})
export class AdminModule {}
