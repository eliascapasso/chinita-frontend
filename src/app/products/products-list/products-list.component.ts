import { Component, OnDestroy, OnInit } from "@angular/core";

import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";

import { AuthService } from "../../account/shared/auth.service";
import { PagerService } from "../../pager/pager.service";
import { ProductsCacheService } from "../shared/products-cache.service";
import { ProductService } from "../shared/product.service";
import { UiService } from "../shared/ui.service";
import { SortPipe } from "../shared/sort.pipe";

import { Product } from "../../models/product.model";
import { User } from "../../models/user.model";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";

@Component({
  selector: "app-products",
  templateUrl: "./products-list.component.html",
  styleUrls: ["./products-list.component.scss"],
})
export class ProductsListComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject();
  products: Product[];
  productsPaged: Product[];
  pager: any = {};
  user: User;
  productsLoading: boolean;
  currentPagingPage: number;

  constructor(
    private productService: ProductService,
    private productsCacheService: ProductsCacheService,
    private pagerService: PagerService,
    private sortPipe: SortPipe,
    private authService: AuthService,
    public uiService: UiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((s: NavigationEnd) => {
        this.getProducts();
      });
  }

  ngOnInit() {
    this.authService.user
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        this.user = user;
      });
    this.uiService.currentPagingPage$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((page) => {
        this.currentPagingPage = page;
      });
    this.getProducts();
  }

  getProducts() {
    this.route.queryParams.subscribe((params) => {
      var category = "";
      category = params["category"];

      this.productsLoading = true;
      this.productService
        .getProducts()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((products) => {
          this.products = [];
          console.log(products);
          this.filterWithCat(products, category);
          this.setPage(this.currentPagingPage);
          this.productsLoading = false;
        });
    });
  }

  //////// IMPLEMENTAR ENUMERADOS Y CORREGIR VALIDACIONES  ////////
  filterWithCat(products, category) {
    for (let product of <any[]>products) {
      switch (category) {
        case "BLAZERS":
          if (product.categories.Bags) {
            this.products.push(product);
          }
          break;
        case "SWEATERS":
          if (product.categories.category) {
            this.products.push(product);
          }
          break;
        case "CAMISAS":
          if (product.categories.Jewelry) {
            this.products.push(product);
          }
          break;
        case "REMERAS":
          if (product.categories.Backpacks) {
            this.products.push(product);
          }
          break;
        case "JEANS":
          if (product.categories.Glasses) {
            this.products.push(product);
          }
          break;
        case "POLLERAS":
          if (product.categories.Clothes) {
            this.products.push(product);
          }
          break;
        case "VESTIDOS":
          if (product.categories.Shoes) {
            this.products.push(product);
          }
          break;
        default:
          this.products.push(product);
      }
    }
  }

  onDisplayModeChange(mode: string, e: Event) {
    this.uiService.displayMode$.next(mode);
    e.preventDefault();
  }

  setPage(page: number) {
    if (page < 1 || page > this.pager.totalPages) {
      return;
    }
    this.pager = this.pagerService.getPager(this.products.length, page, 8);
    this.productsPaged = this.products.slice(
      this.pager.startIndex,
      this.pager.endIndex + 1
    );
    this.uiService.currentPagingPage$.next(page);
  }

  onSort(sortBy: string) {
    this.sortPipe.transform(
      this.products,
      sortBy.replace(":reverse", ""),
      sortBy.endsWith(":reverse")
    );
    this.uiService.sorting$.next(sortBy);
    this.setPage(1);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
