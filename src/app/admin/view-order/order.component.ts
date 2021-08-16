import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { OrderService } from "../../account/orders/shared/order.service";
import { MessageService } from "../../messages/message.service";
import { SharedService } from "../../shared/shared.service";

@Component({
  selector: "app-order",
  templateUrl: "./order.component.html",
  styleUrls: ["./order.component.scss"],
})
export class OrderComponent implements OnInit {
  public numOrder: string = "";

  constructor(
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
    
  }
}
