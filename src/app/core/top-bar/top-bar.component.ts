import { Component } from "@angular/core";
import { environment } from "../../../environments/environment";
import { ContactService } from "../shared/contact.service";

@Component({
  selector: "app-top-bar",
  templateUrl: "./top-bar.component.html",
  styleUrls: ["./top-bar.component.scss"],
})
export class TopBarComponent {
  public telefono: string = "";
  public correo: string = "";
  public instagram: string = "";
  public twitter: string = "";
  public facebook: string = "";
  public linkedin: string = "";
  public wsp: string = "";

  constructor(public contactService: ContactService) {}

  ngOnInit() {
    this.contactService.getContact().subscribe((contact) => {
      this.telefono = contact.telefono;
      this.correo = contact.correo;
      this.wsp = contact.wsp;
      this.facebook = contact.facebook;
      this.instagram = contact.instagram;
      this.twitter = contact.twitter;
      this.linkedin = contact.linkedin;
    });
  }
}
