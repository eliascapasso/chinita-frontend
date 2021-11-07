import { Injectable, EventEmitter } from "@angular/core";
import { Order } from "../../models/order.model";
import { Customer } from "../../models/customer.model";
import { CartItem } from "../../models/cart-item.model";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class CheckoutService {
  private orderInProgress: Order;
  public orderInProgressChanged: EventEmitter<Order> =
    new EventEmitter<Order>();
  public stepChanged: EventEmitter<number> = new EventEmitter<number>();
  public activeStep: number;

  constructor(private httpClient: HttpClient) {
    this.orderInProgress = new Order(new Customer());
    this.activeStep = 0;
  }

  public gotoStep(number) {
    this.activeStep = number;
    this.stepChanged.emit(this.activeStep);
  }

  public nextStep() {
    this.activeStep++;
    this.stepChanged.emit(this.activeStep);
  }

  previousStep() {
    this.activeStep--;
    this.stepChanged.emit(this.activeStep);
  }

  public resetSteps() {
    this.activeStep = 0;
  }

  public setCustomer(customer: Customer) {
    this.orderInProgress.customer = customer;
    this.orderInProgressChanged.emit(this.orderInProgress);
  }

  public setShippingMethod(shippingMethod: string) {
    this.orderInProgress.shippingMethod = shippingMethod;
    this.orderInProgressChanged.emit(this.orderInProgress);
  }

  public setOrderItems(items: CartItem[]) {
    this.orderInProgress.items = items;
    this.orderInProgressChanged.emit(this.orderInProgress);
  }

  public getOrderInProgress() {
    return this.orderInProgress;
  }

  public setSurcharge(surcharge: number) {
    this.orderInProgress.surcharge = this.getPercentSurcharge(surcharge);
    this.orderInProgressChanged.emit(this.orderInProgress);
  }

  getPercentSurcharge(surcharge) {
    return (
      (surcharge / 100) *
      (this.orderInProgress.shippingCost + this.getSubTotal())
    );
  }

  public setPaymentCost(cost: number) {
    this.orderInProgress.shippingCost = cost;
    this.orderInProgressChanged.emit(this.orderInProgress);
  }

  public setPaymentMethod(paymentMethod: string) {
    this.orderInProgress.paymentMethod = paymentMethod;
    this.orderInProgressChanged.emit(this.orderInProgress);
  }

  private getSubTotal() {
    let subTotal = 0;
    for (let item of this.orderInProgress.items) {
      subTotal = subTotal + item.amount * item.product.price;
    }

    return subTotal;
  }
}
