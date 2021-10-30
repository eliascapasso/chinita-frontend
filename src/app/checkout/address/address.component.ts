import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { AuthService } from "../../account/shared/auth.service";
import { SharedService } from "../../shared/shared.service";
import { CheckoutService } from "../shared/checkout.service";

@Component({
  selector: "app-checkout-address",
  templateUrl: "./address.component.html",
  styleUrls: ["./address.component.scss"],
})
export class AddressComponent implements OnInit, OnDestroy {
  private authSubscription: Subscription;
  @Input() public user;
  public formAddress: FormGroup;
  public countries: string[];
  public provinces = [];
  public cities = [];

  constructor(
    private checkoutService: CheckoutService,
    private authService: AuthService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.initFormGroup();

    this.authSubscription = this.authService.user.subscribe((user) => {
      if (user) {
        this.user = user;
        this.initFormGroup();
      }
    });

    this.sharedService.getProvinces().subscribe((result) => {
      for (let prov of result.provincias) {
        this.provinces.push(prov.nombre);
      }
      this.provinces = this.provinces.sort();
    });
  }

  upgradeCities() {
    this.cities = [];
    this.sharedService.getCities().subscribe((result) => {
      for (let loc of result.localidades.filter(
        (l) => l.provincia.nombre == this.formAddress.get("province").value
      )) {
        this.cities.push(loc.nombre);
      }

      this.cities = this.cities.sort();
    });
  }

  private initFormGroup() {
    this.countries = ["Argentina"];
    this.formAddress = new FormGroup({
      firstname: new FormControl(
        this.user && this.user.firstName,
        Validators.required
      ),
      lastname: new FormControl(
        this.user && this.user.lastName,
        Validators.required
      ),
      address1: new FormControl(null, Validators.required),
      address2: new FormControl(null),
      zip: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^\d\d\d\d$/),
      ]),
      city: new FormControl(null, Validators.required),
      province: new FormControl(null, Validators.required),
      email: new FormControl(
        this.user && this.user.email,
        Validators.email && Validators.required
      ),
      phone: new FormControl(null, Validators.required),
      company: new FormControl(null),
      country: new FormControl({ value: this.countries[0], disabled: false }),
    });
  }

  public onContinue() {
    this.checkoutService.setCustomer(this.formAddress.value);
    this.checkoutService.nextStep();
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }
}
