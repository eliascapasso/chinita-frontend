import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  public telefono: string = "";
  public correo: string = "";
  public playstore: string = "";
  public appstore: string = "";
  public instagram: string = "";
  public twitter: string = "";
  public facebook: string = "";
  public linkedin: string = "";
  public wsp: string = "";

  constructor() {}

  ngOnInit() {
    this.telefono = environment.telefono;
    this.correo = environment.correo;
    this.playstore = environment.playstore;
    this.appstore = environment.appstore;
    this.wsp = environment.wsp;
    this.facebook = environment.facebook;
    this.instagram = environment.instagram;
    this.twitter = environment.twitter;
    this.linkedin = environment.linkedin;
  }

}
