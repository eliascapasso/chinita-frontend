import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MessageService } from '../../messages/message.service';
import { ProductService } from '../../products/shared/product.service';
import { ProductsCacheService } from '../../products/shared/products-cache.service';
import { PromoService } from '../shared/promo.service';

import { Product } from '../../models/product.model';
import { Promo } from '../../models/promo.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../account/shared/auth.service';
import { SharedService } from '../../shared/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  public products: Product[];
  public productsFeatured: any;
  public productsNewArrivals: Product[];
  public productsOnSale: Product[];
  public productsBestRated: Product[];
  public promos: Promo[];
  public services = {
    GARANTIA: {
      imagen: "",
      habilitado: false,
      titulo: "",
      cuerpo: ""
    },
    ENVIO: {
      imagen: "",
      habilitado: false,
      titulo: "",
      cuerpo: ""
    },
    ATENCION: {
      imagen: "",
      habilitado: false,
      titulo: "",
      cuerpo: ""
    },
    PAGO: {
      imagen: "",
      habilitado: false,
      titulo: "",
      cuerpo: ""
    },
  };

  private userSubscription: Subscription;
  public user: User;

  constructor(
    private messageService: MessageService,
    private productsCache: ProductsCacheService,
    private productService: ProductService,
    private promoService: PromoService,
    private authService: AuthService,
    private sharedServive: SharedService
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.user.subscribe((user) => {
      this.user = user;
    });

    this.productService
      .getProducts()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((products) => {
        this.products = <Product[]>products;
      });

    this.productService
      .getProducts()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (products) => {
          this.productsFeatured = products;
        },
        (err) => console.error(err)
      );

    this.productService
      .getProductsByDate(3)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (products) => {
          this.productsNewArrivals = products;
        },
        (err) => console.error(err)
      );

    this.productService
      .getProductsByRating(3)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (products) => {
          this.productsBestRated = products;
        },
        (err) => console.error(err)
      );

    this.productService
      .getProductsQuery('sale', true, 3)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (products) => {
          this.productsOnSale = products;
        },
        (err) => console.error(err)
      );

    this.promoService
      .getPromos()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((promos) => {
        this.promos = promos;
      });

      this.sharedServive.getObject("SERVICIOS").subscribe(services => {
        this.services = services;
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.userSubscription.unsubscribe();
  }
}
