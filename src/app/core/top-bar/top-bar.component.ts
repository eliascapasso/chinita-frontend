import { Component } from "@angular/core";
import { environment } from '../../../environments/environment';

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

  constructor() {}

  ngOnInit() {
    this.telefono = environment.telefono;
    this.correo = environment.correo;
    this.wsp = environment.wsp;
    this.facebook = environment.facebook;
    this.instagram = environment.instagram;
    this.twitter = environment.twitter;
    this.linkedin = environment.linkedin;
  }
}
