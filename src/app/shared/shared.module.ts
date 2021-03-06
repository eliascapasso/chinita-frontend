import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule } from '@angular/forms';

import { PriceComponent } from './price/price.component';
import { PageTitleComponent } from '../core/page-title/page-title.component';
import { SharedService } from './shared.service';

@NgModule({
    declarations: [
        PriceComponent,
        PageTitleComponent
    ],
    imports: [
        CommonModule,
        AppRoutingModule,
        FormsModule
    ],
    exports: [
        PriceComponent,
        PageTitleComponent,
        CommonModule,
        AppRoutingModule,
        FormsModule
    ],
    providers: [
        SharedService
    ]
})
export class SharedModule {}
