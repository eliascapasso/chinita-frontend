import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './core/home/home.component';
import { CartComponent } from './cart/cart.component';
import { AddEditComponent } from './admin/add-edit/add-edit.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AdminGuard } from './admin/shared/admin.guard';
import { CheckoutComponent } from './checkout/checkout.component';
import { RegisterLoginComponent } from './account/register-login/register-login.component';
import { OrdersComponent } from './account/orders/orders.component';
import { ProfileComponent } from './account/profile/profile.component';
import { AccountComponent } from './account/account.component';
import { ProductsListComponent } from './products/products-list/products-list.component';
import { ProductDetailComponent } from './products/product-detail/product-detail.component';
import { CompleteComponent } from './checkout/complete/complete.component';
import { AddEditCategoriesComponent } from './admin/add-edit-categories/add-edit-categories.component';
import { EditServicesComponent } from './admin/edit-services/edit-services.component';

const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'inicio', component: HomeComponent },
  { path: 'productos', component: ProductsListComponent },
  { path: 'productos/:id', component: ProductDetailComponent },
  { path: 'carrito', component: CartComponent },
  { path: 'admin/add', component: AddEditComponent, canActivate: [AdminGuard] },
  {
    path: 'admin/edit/:id',
    component: AddEditComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/categories',
    component: AddEditCategoriesComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/services',
    component: EditServicesComponent,
    canActivate: [AdminGuard]
  },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'register-login', component: RegisterLoginComponent },
  {
    path: 'account',
    component: AccountComponent,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'orders', component: OrdersComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  },
  { path: 'order-complete', component: CompleteComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    AdminGuard,
  ]
})
export class AppRoutingModule { }
