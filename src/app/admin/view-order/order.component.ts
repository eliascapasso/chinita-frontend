import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { OrderService } from "../../account/orders/shared/order.service";
import { MessageService } from "../../messages/message.service";
import { Customer } from "../../models/customer.model";
import { Order } from "../../models/order.model";
import { SharedService } from "../../shared/shared.service";

@Component({
  selector: "app-order",
  templateUrl: "./order.component.html",
  styleUrls: ["./order.component.scss"],
})
export class OrderComponent implements OnInit {
  public idOrder: string = "";
  public order: Order = new Order();

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private sharedService: SharedService,
    private log: MessageService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.idOrder = this.route.snapshot.paramMap.get("id");
    this.getOrder();
  }

  getOrder() {
    this.order.customer = new Customer();
    this.orderService.getOrder(this.idOrder).subscribe((order) => {
      this.order = order;
    });
  }

  goBack(){
    this.router.navigateByUrl("/account/orders");
  }

  public onSelectStatus(event) {
    this.order.status = event.target.value;
    this.orderService
      .updateOrder(this.order)
      .then((response) => {
        this.log.add("Estado de la orden modificado con éxito");
      })
      .catch((error) => {
        console.error(error);
        this.log.addError("No fue posible modificar ele estado de la orden");
      });
  }

  goProduct(idproduct) {
    this.router.navigateByUrl("productos/" + idproduct);
    window.scrollTo(0, 0);
  }
}
