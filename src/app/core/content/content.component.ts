import { Component } from "@angular/core";
import { Subscription } from "rxjs";
import { AuthService } from "../../account/shared/auth.service";
import { User } from "../../models/user.model";
import { ContactService } from "../shared/contact.service";

import { OffcanvasService } from "../shared/offcanvas.service";

@Component({
  selector: "app-content",
  templateUrl: "./content.component.html",
  styleUrls: ["./content.component.scss"],
})
export class ContentComponent {
  private userSubscription: Subscription;
  public user: User;
  public wsp: string = "";

  constructor(
    public contactService: ContactService,
    private offcanvasService: OffcanvasService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.user.subscribe((user) => {
      this.user = user;
    });

    this.contactService.getContact().subscribe((contact) => {
      this.wsp = contact.wsp;
    });
  }

  onMenuClose(e: Event) {
    this.offcanvasService.closeOffcanvasNavigation();
  }
}
