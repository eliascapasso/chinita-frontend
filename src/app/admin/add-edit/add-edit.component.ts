import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { ActivatedRoute, Params, Router } from "@angular/router";
import { Observable, Subscription, of } from "rxjs";

import { MessageService } from "../../messages/message.service";
import { FileUploadService } from "../../products/shared/file-upload.service";
import { ProductService } from "../../products/shared/product.service";
import { ProductsCacheService } from "../../products/shared/products-cache.service";

import { Product } from "../../models/product.model";
import { IDropdownSettings } from "ng-multiselect-dropdown";

// we send and receive categories as {key:true},
// but for the input field we need

@Component({
  selector: "app-add-edit",
  templateUrl: "./add-edit.component.html",
  styleUrls: ["./add-edit.component.scss"],
})
export class AddEditComponent implements OnInit, OnDestroy {
  private productSubscription: Subscription;
  private formSubscription: Subscription;
  @ViewChild("photos", { static: true }) photos;
  public productForm: FormGroup;
  public product: Product;
  public mode: "edit" | "add";
  public id;
  public percentage: Observable<number>;

  dropdownListCategories = [];
  selectedItemsCategories = [];
  dropdownSettingsCategories: IDropdownSettings = {};
  categories;

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private productService: ProductService,
    public fileUploadService: FileUploadService,
    private productsCacheService: ProductsCacheService,
    private log: MessageService
  ) {}

  ngOnInit(): void {
    this.initFormEmpty();
    this.initCategories();
  }

  initCategories() {
    let $this = this;
    this.productService.getCategories().subscribe((categories) => {
      $this.categories = categories;
      $this.loadCategories(categories);
      $this.setProduct();
    });
  }

  loadCategories(categories) {
    this.dropdownListCategories = [];
    for (let i = 0; i < categories.length; i++) {
      this.dropdownListCategories.push({
        item_id: i + 1,
        item_text: categories[i],
      });
    }

    this.dropdownSettingsCategories = {
      singleSelection: false,
      idField: "item_id",
      textField: "item_text",
      selectAllText: "Seleccionar todo",
      unSelectAllText: "Borrar todo",
      noDataAvailablePlaceholderText: "No existen categorías",
      itemsShowLimit: 4,
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
      searchPlaceholderText: "Buscar",
    };
  }

  onItemSelect(item: any) {
    //Implement
  }
  onSelectAll(items: any) {
    //Implement
  }

  private initForm() {
    this.productForm = new FormGroup({
      name: new FormControl(
        this.product && this.product.name,
        Validators.required
      ),
      id: new FormControl(
        {
          value: this.product && this.product.id,
          disabled: true,
        },
        [Validators.required, Validators.min(0)]
      ),
      date: new FormControl(
        this.product && this.product.date,
        Validators.required
      ),
      categories: new FormControl([], Validators.required),
      description: new FormControl(
        this.product && this.product.description,
        Validators.required
      ),
      price: new FormControl(this.product && this.product.price, [
        Validators.required,
        Validators.min(0),
      ]),
      priceNormal: new FormControl(this.product && this.product.priceNormal, [
        Validators.required,
        Validators.min(0),
      ]),
    });
    this.onFormChanges();
  }

  initFormEmpty() {
    this.productForm = new FormGroup({
      name: new FormControl("", Validators.required),
      id: new FormControl("", Validators.required),
      date: new FormControl("", Validators.required),
      categories: new FormControl([], Validators.required),
      description: new FormControl("", Validators.required),
      price: new FormControl("", Validators.required),
      priceNormal: new FormControl("", Validators.required),
    });
  }

  private setProduct() {
    this.id = +this.route.snapshot.paramMap.get("id");
    // if we have an id, we're in edit mode
    if (this.id) {
      this.mode = "edit";
      this.getProduct(this.id);
    } else {
      // else we are in add mode
      this.mode = "add";
      this.constructProduct();
      this.loadCategories(this.categories);
    }
  }

  private constructProduct() {
    const product = this.constructMockProduct();
    this.syncProduct(product);
    this.initForm();
  }

  private getProduct(id): void {
    this.productSubscription = this.productService
      .getProduct(id)
      .subscribe((product) => {
        if (product) {
          this.categoriesFromStringToObject(product);
          this.syncProduct(product);
          this.initForm();
        }
      });
  }

  private onFormChanges() {
    this.formSubscription = this.productForm.valueChanges.subscribe(
      (formFieldValues) => {
        const product = { ...this.product, ...formFieldValues };
        this.syncProduct(product);
      }
    );
  }

  private syncProduct(product): void {
    const id = this.createId(product);
    const imageURLs = this.handleImageURLs(product);
    const reduction = this.calculateReduction(
      product.priceNormal,
      product.price
    );
    const sale = this.checkForSale(reduction);

    this.product = {
      ...product,
      sale,
      reduction,
      id,
      imageURLs,
    };
  }

  public onSubmit() {
    this.syncProduct({ ...this.product, ...this.productForm.value });
    const productToSubmit = this.constructProductToSubmit(this.product);
    const files: FileList = this.photos.nativeElement.files;
    if (this.mode === "add" && files.length > 0) {
      this.addProduct(productToSubmit, files);
    } else if (this.mode === "edit") {
      this.updateProduct(productToSubmit, files);
    } else {
      this.log.addError("Proporcione un archivo para su producto");
      return;
    }
  }

  private addProduct(product: Product, files: FileList) {
    product.categories = this.categoriesToArrayString();
    product.name = product.name.toUpperCase();
    this.productService.addProduct({ product, files }).subscribe(
      (savedProduct: Product) => {
        if (savedProduct.id) {
          this.product = null;
          this.router.navigate(["/productos"]);
        }
      },
      (error) => {
        this.log.addError("No se pudo cargar el producto");
        return of(error);
      }
    );
  }

  private updateProduct(product: Product, files?: FileList) {
    this.productSubscription.unsubscribe();
    product.name = product.name.toUpperCase();
    product.categories = this.categoriesToArrayString();
    this.productService.updateProduct({ product, files }).subscribe(
      (response: Product) => {
        if (response.id != undefined) {
          this.router.navigate(["/productos/" + response.id]);
        } else {
          this.log.addError("No se pudo actualizar el producto");
        }
      },
      (error) => this.log.addError("No se pudo actualizar el producto")
    );
  }

  public onDelete() {
    if (this.mode === "edit") {
      this.productSubscription.unsubscribe();
      this.productService.deleteProduct(this.product).then((res) => {
        this.router.navigate(["/productos"]);
      });
    } else {
      this.log.addError(`No se puede eliminar un nuevo producto`);
    }
  }

  // pure helper functions start here:
  private constructMockProduct() {
    return new Product();
  }

  private constructProductToSubmit(product: Product): Product {
    return {
      ...product,
    };
  }

  private createId(product: Product): number {
    const randomId = Math.floor(Math.random() * new Date().getTime());
    let id = product.id || randomId;
    if (id === 1) {
      id = randomId;
    }
    return id;
  }

  private categoriesFromStringToObject(product) {
    var newDropDown = [];
    this.selectedItemsCategories = [];
    for (let i = 0; i < product.categories.length; i++) {
      this.selectedItemsCategories.push({
        item_id: i + 1,
        item_text: product.categories[i],
      });

      newDropDown.push({
        item_id: i + 1,
        item_text: product.categories[i],
      });
    }

    for (let i = 0; i < this.dropdownListCategories.length; i++) {
      for (let j = 0; j < this.selectedItemsCategories.length; j++) {
        if (
          this.selectedItemsCategories[j].item_text !=
          this.dropdownListCategories[i].item_text
        ) {
          newDropDown.push({
            item_id: newDropDown.length + 1,
            item_text: this.dropdownListCategories[i].item_text,
          });
        }
      }
    }

    this.dropdownListCategories = newDropDown;
  }

  categoriesToArrayString() {
    var result: string[] = [];
    for (let cat of this.selectedItemsCategories) {
      result.push(cat.item_text);
    }

    return result;
  }

  private checkForSale(reduction: number): boolean {
    return reduction > 0;
  }

  private calculateReduction(priceNormal: number, price: number): number {
    const reduction = Math.round(((priceNormal - price) / priceNormal) * 100);
    return reduction > 0 ? reduction : 0;
  }

  private handleImageURLs(product: Product): string[] {
    if (product.imageURLs && product.imageURLs.length > 0) {
      return product.imageURLs;
    }
    return [];
  }

  ngOnDestroy() {
    this.formSubscription.unsubscribe();
  }
}
