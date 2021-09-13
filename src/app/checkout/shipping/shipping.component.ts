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
        method: "Retiro en local",
        time: "en el momento",
        fee: 0,
        value: "retira",
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
          method: "Coordinar entrega y pago con el vendedor",
          time: "En el momento",
          fee: 0,
          value: "coordina",
        },
        {
          method: "Entrega a domicilio",
          time: value.min_time + " - " + value.max_time + " días hábiles",
          fee: value.valor,
          value: "a domicilio",
        },
      ];
    });
  }

  updateFee(sMethod){
    this.selectShip = true;
    if(sMethod == "a domicilio"){
      this.cartService.setShipping(this.shippingMethods[1].fee);
      this.checkoutService.setPaymentCost(this.shippingMethods[1].fee);
    }
    else if(sMethod == "coordina"){
      this.cartService.setShipping(this.shippingMethods[0].fee);
      this.checkoutService.setPaymentCost(this.shippingMethods[0].fee);
    }
    else{
      this.cartService.setShipping(0);
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
