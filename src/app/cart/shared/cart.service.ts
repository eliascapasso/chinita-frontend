import { EventEmitter, Injectable, Output } from "@angular/core";
import { Product } from "../../models/product.model";
import { CartItem } from "../../models/cart-item.model";
import { MessageService } from "../../messages/message.service";

@Injectable()
export class CartService {
  // Init and generate some fixtures
  private cartItems: CartItem[];
  private shipping: number = 0;
  public itemsChanged: EventEmitter<CartItem[]> = new EventEmitter<
    CartItem[]
  >();
  @Output() shippingChanged: EventEmitter<number> = new EventEmitter<number>();

  constructor(private messageService: MessageService) {
    this.cartItems = [];
    this.shipping = 0;
  }

  public getShipping(): number {
    return this.shipping;
  }

  public setShipping(value: number) {
    this.shipping = value;
    this.shippingChanged.emit(this.shipping);
  }

  public getItems() {
    return this.cartItems.slice();
  }

  // Get Product ids out of CartItem[] in a new array
  private getItemIds() {
    return this.getItems().map((cartItem) => cartItem.product.id);
  }

  public addItem(item: CartItem) {
    // If item is already in cart, add to the amount, otherwise push item into cart
    // if (this.getItemIds().includes(item.product.id) && item.size) {
    //   this.cartItems.forEach(function (cartItem) {
    //     if (cartItem.product.id === item.product.id) {
    //       cartItem.amount += item.amount;
    //     }
    //   });
    //   this.messageService.add(
    //     "Cantidad en carrito cambiada por: " + item.product.name
    //   );
    // } else {
    //   this.cartItems.push(item);
    //   this.messageService.add("Añadido al carrito: " + item.product.name);
    // }

    this.cartItems.push(item);
    this.messageService.add("Añadido al carrito: " + item.product.name);
    this.itemsChanged.emit(this.cartItems.slice());
  }

  public addItems(items: CartItem[]) {
    items.forEach((cartItem) => {
      this.addItem(cartItem);
    });
  }

  public removeItem(item: CartItem) {
    const indexToRemove = this.cartItems.findIndex(
      (element) => element === item
    );
    this.cartItems.splice(indexToRemove, 1);
    this.itemsChanged.emit(this.cartItems.slice());
    this.messageService.add("Eliminado del carrito: " + item.product.name);
  }

  public updateItemAmount(item: CartItem, newAmount: number) {
    this.cartItems.forEach((cartItem) => {
      if (cartItem.product.id === item.product.id) {
        cartItem.amount = newAmount;
      }
    });
    this.itemsChanged.emit(this.cartItems.slice());
    this.messageService.add("Importe actualizado por: " + item.product.name);
  }

  public clearCart() {
    this.cartItems = [];
    this.shipping = 0;
    this.itemsChanged.emit(this.cartItems.slice());
    this.shippingChanged.emit(this.shipping);
    this.messageService.add("Carrito limpiado");
  }

  public getTotal() {
    let total = 0;
    this.cartItems.forEach((cartItem) => {
      total += cartItem.amount * cartItem.product.price;
    });
    return total;
  }

  public getEnvio() {
    let envio = 0;
    this.cartItems.forEach((cartItem) => {
      envio += cartItem.amount * cartItem.product.price;
    });
    return envio;
  }
}
