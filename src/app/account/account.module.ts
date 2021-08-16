import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

import { ProfileComponent } from './profile/profile.component';
import { OrdersComponent } from './orders/orders.component';
import { RegisterLoginComponent } from './register-login/register-login.component';
import { AccountComponent } from './account.component';
import { ShippingCostComponent } from './shipping/profile/shipping-cost.component';

@NgModule({
    declarations: [
        AccountComponent,
        ProfileComponent,
        OrdersComponent,
        RegisterLoginComponent,
        ShippingCostComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        SharedModule
    ]
})
export class AccountModule {}
