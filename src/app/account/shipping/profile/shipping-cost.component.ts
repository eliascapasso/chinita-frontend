import { Component, OnInit } from "@angular/core";
import { MessageService } from "../../../messages/message.service";
import { SharedService } from "../../../shared/shared.service";

@Component({
  selector: "app-shipping-cost",
  templateUrl: "./shipping-cost.component.html",
  styleUrls: ["./shipping-cost.component.scss"],
})
export class ShippingCostComponent implements OnInit {
  public cost: number;
  public min: number;
  public max: number;
  public surcharge: number;

  constructor(
    private sharedService: SharedService,
    private log: MessageService
  ) {}

  ngOnInit() {
    this.sharedService.getObject("ENVIO").subscribe((envio) => {
      this.surcharge = envio.recargo;
      this.cost = envio.valor;
      this.min = envio.min_time;
      this.max = envio.max_time;
    });
  }

  updateShipping() {
    let object = {
      valor: this.cost,
      recargo: this.surcharge,
      min_time: this.min,
      max_time: this.max,
    };

    this.sharedService
      .updateObject({ type: "shared/ENVIO", object: object })
      .then(() => {
        this.log.add("Configuración de pago y envío modificada");
      })
      .catch((error) => {
        this.log.addError("No pudo modificarse la configuración de envío");
        console.error(error.message);
      });
  }
}
