import { Component, OnInit } from "@angular/core";

import { ActivatedRoute, Router } from "@angular/router";

import { MessageService } from "../../messages/message.service";
import { FileUploadService } from "../../products/shared/file-upload.service";
import { ProductService } from "../../products/shared/product.service";
import { ProductsCacheService } from "../../products/shared/products-cache.service";

@Component({
  selector: "app-add-edit-categories",
  templateUrl: "./add-edit-categories.component.html",
  styleUrls: ["./add-edit-categories.component.scss"],
})
export class AddEditCategoriesComponent implements OnInit {
  public categories = [];
  public newCategory: string = "";

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private productService: ProductService,
    public fileUploadService: FileUploadService,
    private productsCacheService: ProductsCacheService,
    private log: MessageService
  ) {}

  ngOnInit(): void {
    this.initCategories();
  }

  initCategories() {
    let $this = this;
    this.productService.getCategories().subscribe((categories) => {
      $this.categories = categories;
    });
  }

  deleteCategory(category) {
    this.productService
      .deleteCategory(category)
      .then((result) => {
        this.log.add("Categoría eliminada");
      })
      .catch((error) => {
        console.error(error.message);
        this.log.addError("Hubo un error al eliminar la categoría");
      });
  }

  addCategory() {
    this.productService
      .addCategory(this.newCategory.toUpperCase())
      .then((result) => {
        this.newCategory = "";
        this.log.add("Categoría agregada");
      })
      .catch((error) => {
        console.error(error.message);
        this.log.addError("Hubo un error al agregar la categoría");
      });
  }
}
