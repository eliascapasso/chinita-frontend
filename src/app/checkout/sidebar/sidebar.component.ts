import { Component, OnInit } from "@angular/core";

import { CartService } from "../../cart/shared/cart.service";

@Component({
  selector: "app-checkout-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  public cartSubtotal: number;
  public shipping: number = 0;
  public surcharge: number = 0;
  public percent: number = 0;
  public orderTotal: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartSubtotal = this.cartService.getTotal();
    this.shipping = this.cartService.getShipping();
    this.surcharge = this.cartService.getPercentSurcharge();
    this.percent = this.cartService.getSurcharge();
    this.orderTotal = this.cartSubtotal + this.shipping + this.surcharge;

    this.cartService.shippingChanged.subscribe((value) => {
      this.shipping = value;
      this.orderTotal = this.cartSubtotal + this.shipping + this.surcharge;
    });

    this.cartService.surchargeChanged.subscribe((value) => {
      this.surcharge = value;
      this.percent = this.cartService.getSurcharge();
      this.orderTotal = this.cartSubtotal + this.shipping + this.surcharge;
    });
  }
}
