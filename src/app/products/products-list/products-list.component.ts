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
  products: Product[] = [];
  productsPaged: Product[];
  pager: any = {};
  user: User;
  productsLoading: boolean;
  currentPagingPage: number;
  noProducts: boolean = false;
  title: string = "Productos";

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
      var category = params["categoria"];
      this.productsLoading = true;

      this.productService
        .getProducts()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((products) => {
          this.filterWithCat(products, category);
          this.setPage(this.currentPagingPage);
          this.productsLoading = false;
        });
    });
  }

  filterWithCat(products, category) {
    this.products = [];
    this.noProducts = false;
    if (category == undefined || category == "") {
      this.products = products;
      this.title = "Productos";
    } else {
      this.title = category;
      for (let product of <any[]>products) {
        if (product.categories.includes(category)) {
          this.products.push(product);
        }
      }
    }

    this.products.length == 0 ? (this.noProducts = true) : "";
    this.products.length == 0 ? (this.products = products) : "";
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
    window.scrollTo(0, 0);
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
