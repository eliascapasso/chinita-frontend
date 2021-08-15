import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "../../messages/message.service";
import { FileUploadService } from "../../products/shared/file-upload.service";
import { ProductsCacheService } from "../../products/shared/products-cache.service";
import { SharedService } from "../../shared/shared.service";

@Component({
  selector: "app-edit-services",
  templateUrl: "./edit-services.component.html",
  styleUrls: ["./edit-services.component.scss"],
})
export class EditServicesComponent implements OnInit {
  public services = {
    GARANTIA: {
      imagen: "",
      habilitado: false,
      titulo: "",
      cuerpo: "",
    },
    ENVIO: {
      imagen: "",
      habilitado: false,
      titulo: "",
      cuerpo: "",
    },
    ATENCION: {
      imagen: "",
      habilitado: false,
      titulo: "",
      cuerpo: "",
    },
    PAGO: {
      imagen: "",
      habilitado: false,
      titulo: "",
      cuerpo: "",
    },
  };
  public newService: string = "";

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private sharedService: SharedService,
    public fileUploadService: FileUploadService,
    private productsCacheService: ProductsCacheService,
    private log: MessageService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.initServices();
  }

  initServices() {
    let $this = this;
    this.sharedService.getObject("SERVICIOS").subscribe((services) => {
      $this.services = services;
    });
  }

  updateService(service, type) {
    let data = {
      object: service,
      type: "shared/SERVICIOS/" + type,
    };

    console.log(service);

    this.sharedService
      .updateObject(data)
      .then((result) => {
        this.log.add("Servicio " + type + " modificado");
      })
      .catch((error) => {
        console.error(error.message);
        this.log.addError("Hubo un error al modificar el servicio");
      });
  }

  //NO IMPLEMENTADO
  // addService() {
  //   this.sharedService
  //     .addService(this.newService.toUpperCase())
  //     .then((result) => {
  //       this.newService = "";
  //       this.log.add("Servicio agregado");
  //     })
  //     .catch((error) => {
  //       console.error(error.message);
  //       this.log.addError("Hubo un error al agregar el servicio");
  //     });
  // }
}
