import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ContactService } from "../../core/shared/contact.service";
import { MessageService } from "../../messages/message.service";
import { FileUploadService } from "../../products/shared/file-upload.service";
import { ProductsCacheService } from "../../products/shared/products-cache.service";
import { SharedService } from "../../shared/shared.service";

@Component({
  selector: "app-edit-contact",
  templateUrl: "./edit-contact.component.html",
  styleUrls: ["./edit-contact.component.scss"],
})
export class EditContactComponent implements OnInit {
  public telefono: string = "";
  public correo: string = "";
  public instagram: string = "";
  public twitter: string = "";
  public facebook: string = "";
  public linkedin: string = "";
  public wsp: string = "";

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private sharedService: SharedService,
    public fileUploadService: FileUploadService,
    private productsCacheService: ProductsCacheService,
    private log: MessageService,
    public contactService: ContactService,
  ) {}

  ngOnInit(): void {
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

  saveContact(){
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

    window.scrollTo(0, 0);
  }
}
