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
  public numOrder: string = "";
  public order: Order = new Order();

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private sharedService: SharedService,
    private log: MessageService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.numOrder = this.route.snapshot.paramMap.get("id");
    this.getOrder();
  }

  getOrder(){
    this.order.customer = new Customer();
    this.orderService.getOrders().subscribe(orders =>{
        for(let order of orders){
          if(order.number == this.numOrder){
            this.order = order;
            console.log(order);
            break;
          }
        }
    });
  }

  goProduct(idproduct){
    this.router.navigateByUrl('productos/' + idproduct);
    window.scrollTo(0, 0);
  }
}
