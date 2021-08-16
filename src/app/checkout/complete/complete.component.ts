import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-complete",
  templateUrl: "./complete.component.html",
  styleUrls: ["./complete.component.scss"],
})
export class CompleteComponent implements OnInit {
  public type: string;

  constructor(public route: ActivatedRoute) {}

  ngOnInit(): void {
    this.type = this.route.snapshot.paramMap.get("type"); //complete or pending
  }
}
