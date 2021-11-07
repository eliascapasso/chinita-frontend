import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { CheckoutService } from "../shared/checkout.service";
import { Customer } from "../../models/customer.model";
import { SharedService } from "../../shared/shared.service";
import { CartService } from "../../cart/shared/cart.service";

@Component({
  selector: "app-checkout-shipping",
  templateUrl: "./shipping.component.html",
  styleUrls: ["./shipping.component.scss"],
})
export class ShippingComponent implements OnInit {
  public selectShip: boolean = false;
  public formShipping: FormGroup;
  public shippingMethods: {
    method: string;
    time: string;
    fee: number;
    surcharge: number;
    value: string;
  }[];
  private fee: number = 0;

  constructor(
    private checkoutService: CheckoutService,
    private sharedService: SharedService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.shippingMethods = [
      {
        method: "Coordinar pago y entrega con el vendedor",
        time: "A coordinar",
        fee: 0,
        surcharge: 0,
        value: "coordina",
      },
    ];

    this.initMethods();

    this.formShipping = new FormGroup({
      shippingMethod: new FormControl(
        this.shippingMethods[0].value,
        Validators.required
      ),
    });
  }

  initMethods() {
    this.sharedService.getObject("ENVIO").subscribe((value) => {
      this.shippingMethods = [
        {
          method: "Coordinar pago y entrega con el vendedor",
          time: "A coordinar",
          fee: 0,
          surcharge: 0,
          value: "coordina",
        },
        {
          method: "Pagar ahora y recibir en domicilio",
          time: value.min_time + " - " + value.max_time + " días hábiles",
          fee: value.valor,
          surcharge: value.recargo,
          value: "a domicilio",
        },
      ];
    });
  }

  updateFeeSurcharge(sMethod) {
    this.selectShip = true;
    if (sMethod == "a domicilio") {
      this.cartService.setShipping(this.shippingMethods[1].fee);
      this.cartService.setSurcharge(this.shippingMethods[1].surcharge);
      this.checkoutService.setPaymentCost(this.shippingMethods[1].fee);
    } else if (sMethod == "coordina") {
      this.cartService.setShipping(this.shippingMethods[0].fee);
      this.cartService.setSurcharge(this.shippingMethods[0].surcharge);
      this.checkoutService.setPaymentCost(this.shippingMethods[0].fee);
    } else {
      this.cartService.setShipping(0);
      this.cartService.setSurcharge(0);
      this.checkoutService.setPaymentCost(0);
    }
  }

  public onBack() {
    this.checkoutService.previousStep();
  }

  public onContinue() {
    this.checkoutService.setShippingMethod(
      this.formShipping.controls.shippingMethod.value
    );
    this.checkoutService.nextStep();
  }
}
