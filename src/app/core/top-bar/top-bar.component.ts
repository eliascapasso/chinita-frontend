import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../../account/shared/auth.service";
import { MessageService } from "../../messages/message.service";
import { User } from "../../models/user.model";
import { SharedService } from "../../shared/shared.service";
import { ContactService } from "../shared/contact.service";
import { OffcanvasService } from "../shared/offcanvas.service";

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

  private userSubscription: Subscription;
  public user: User;
  display: boolean = false;

  constructor(
    public contactService: ContactService,
    private sharedService: SharedService,
    private authService: AuthService,
    private log: MessageService,
    public offcanvasService: OffcanvasService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.user.subscribe((user) => {
      this.user = user;
    });

    this.getContact();
  }

  getContact(){
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

  showDialog() {
    this.display = true;
  }

  cancelDialog(){
    this.display = false;
    window.scrollTo(0, 0);
    this.getContact();
  }

  saveDialog(){
    let object = {
      telefono: this.telefono,
      correo: this.correo,
      wsp: this.wsp,
      facebook: this.facebook,
      instagram: this.instagram,
      twitter: this.twitter,
      linkedin: this.linkedin,
    };

    this.sharedService.updateObject({
      type: "contact",
      object: object,
    }).then(result =>{
      this.log.add("Contacto guardado exitosamente");
    })
    .catch(error => {
      console.error(error.message);
      this.log.addError("No se pudo modificar el contacto");
    });

    this.display = false;
    window.scrollTo(0, 0);
  }

  public onLogout(e: Event) {
    this.offcanvasService.closeOffcanvasNavigation();
    this.authService.signOut();
    this.router.navigate(['/register-login']);
    e.preventDefault();
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }
}
