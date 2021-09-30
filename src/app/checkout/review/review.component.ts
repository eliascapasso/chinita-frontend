import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { AuthService } from "../../account/shared/auth.service";
import { CheckoutService } from "../shared/checkout.service";
import { CartService } from "../../cart/shared/cart.service";
import { MessageService } from "../../messages/message.service";
import { OrderService } from "../../account/orders/shared/order.service";

import { CartItem } from "../../models/cart-item.model";
import { Customer } from "../../models/customer.model";
import { Order } from "../../models/order.model";
import { User } from "../../models/user.model";

@Component({
  selector: "app-checkout-review",
  templateUrl: "./review.component.html",
  styleUrls: ["./review.component.scss"],
})
export class ReviewComponent implements OnInit, OnDestroy {
  items: CartItem[];
  total: number = 0;
  customer: Customer = new Customer();
  paymentMethod: string;
  unsubscribe$ = new Subject();
  user: User;
  loading: boolean;

  constructor(
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private orderService: OrderService,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.authService.user.subscribe((user) => (this.user = user));

    this.items = this.cartService.getItems();
    this.total = this.cartService.getTotal();
    this.cartService.itemsChanged
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((items: CartItem[]) => {
        this.items = items;
        this.total = this.cartService.getTotal();
      });
    this.customer = this.checkoutService.getOrderInProgress().customer;
    this.checkoutService.orderInProgressChanged
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((order: Order) => {
        this.customer = order.customer;
        this.paymentMethod = order.paymentMethod;
      });

    this.loading = false;
  }

  public onBack(event) {
    this.checkoutService.previousStep();
  }

  public onCompleteOrder(event) {
    this.loading = true;
    const userUid = this.user ? this.user.uid : false;
    const order = this.checkoutService.getOrderInProgress();
    const total = this.cartService.getTotal();

    this.checkoutService.setOrderItems(this.cartService.getItems());

    if (userUid) {
      this.submitUserOrder(order, total, userUid);
    } else {
      this.submitAnonOrder(order, total);
    }
  }

  private submitUserOrder(order, total, userUid) {
    if (this.cartService.getShipping() <= 0) {
      this.orderService
        .addUserOrder(order, total, userUid, true)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          (response) => {
            this.loading = false;
            this.cartService.clearCart();
            this.checkoutService.resetSteps();
            this.router.navigate(["/order-complete"]);
          },
          (error) => {
            this.loading = false;
            this.messageService.addError(
              "No se pudo enviar el pedido, inténtelo de nuevo."
            );
          }
        );
    } else {
      this.orderService.goCheckoutMP(order).subscribe((resp) => {
        window.open(resp, '_blank');
        //window.location.replace(resp);

        this.orderService
          .addUserOrder(order, total, userUid, false)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(
            (response) => {
              this.loading = false;
              this.cartService.clearCart();
              this.checkoutService.resetSteps();
              //this.router.navigate(["/order-complete"]);
            },
            (error) => {
              this.loading = false;
              this.messageService.addError(
                "No se pudo enviar el pedido, inténtelo de nuevo."
              );
            }
          );
      });
    }
  }

  private submitAnonOrder(order, total) {
    if (this.cartService.getShipping() <= 0) {
      this.orderService
        .addAnonymousOrder(order, total, true)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          (response) => {
            this.loading = false;
            this.cartService.clearCart();
            this.checkoutService.resetSteps();
            this.router.navigate(["/order-complete"]);
          },
          (error) => {
            this.loading = false;
            this.messageService.addError(
              "No se pudo enviar el pedido, inténtelo de nuevo."
            );
          }
        );
    } else {
      this.orderService.goCheckoutMP(order).subscribe((resp) => {
        window.open(resp, '_blank');
        //window.location.replace(resp);

        this.orderService
          .addAnonymousOrder(order, total, false)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(
            (response) => {
              this.loading = false;
              this.cartService.clearCart();
              this.checkoutService.resetSteps();
              //this.router.navigate(["/order-complete"]);
            },
            (error) => {
              this.loading = false;
              this.messageService.addError(
                "No se pudo enviar el pedido, inténtelo de nuevo."
              );
            }
          );
      });
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
