import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { AuthService } from '../../../account/shared/auth.service';

import { User } from '../../../models/user.model';
import { ProductService } from '../../../products/shared/product.service';

@Component({
  selector: 'app-navigation-main',
  templateUrl: './navigation-main.component.html',
  styleUrls: ['./navigation-main.component.scss']
})
export class NavigationMainComponent implements OnInit, OnDestroy {
  public user: User;
  private authSubscription: Subscription;
  public isProducts: boolean = false;
  public categories: string[] = [];

  constructor(public authService: AuthService, public productService: ProductService) {}

  ngOnInit() {
    this.authService.user.subscribe((user) => {
      this.user = user;
    });

    this.getCategories();
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  changeNav(isProducts){
    this.isProducts = isProducts;
  }

  getCategories(){
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }
}
