import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { AuthService } from "../../../account/shared/auth.service";
import { User } from "../../../models/user.model";
import { ProductService } from "../../../products/shared/product.service";

@Component({
  selector: "app-navigation-main",
  templateUrl: "./navigation-main.component.html",
  styleUrls: ["./navigation-main.component.scss"],
})
export class NavigationMainComponent implements OnInit, OnDestroy {
  public user: User;
  private authSubscription: Subscription;
  public categories: string[] = [];
  displayCategories: boolean = false;
  public displayProducts: boolean;

  constructor(
    public authService: AuthService,
    public productService: ProductService
  ) {}

  ngOnInit() {
    this.authService.user.subscribe((user) => {
      this.user = user;
    });

    this.displayProducts = window.innerWidth < 1070;
    this.getCategories();
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.displayProducts = window.innerWidth < 1070;
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  getCategories() {
    this.productService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }
}
