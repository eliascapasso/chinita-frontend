import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '../../account/shared/auth.service';
import { OffcanvasService } from '../shared/offcanvas.service';

import { User } from '../../models/user.model';
import { ProductService } from '../../products/shared/product.service';

@Component({
  selector: 'app-navigation-off-canvas',
  templateUrl: './navigation-off-canvas.component.html',
  styleUrls: ['./navigation-off-canvas.component.scss']
})
export class NavigationOffCanvasComponent implements OnInit, OnDestroy {
  private authSubscription: Subscription;
  public user: User;
  public categories: string[] = [];

  constructor(
    public offcanvasService: OffcanvasService,
    public authService: AuthService,
    private router: Router,
    public productService: ProductService
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.user.subscribe((user) => {
      this.user = user;
    });

    this.getCategories();
  }

  getCategories(){
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  public onLogout(e: Event) {
    this.offcanvasService.closeOffcanvasNavigation();
    this.authService.signOut();
    this.router.navigate(['/register-login']);
    e.preventDefault();
  }

  public onNavigationClick() {
    this.offcanvasService.closeOffcanvasNavigation();
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }
}
