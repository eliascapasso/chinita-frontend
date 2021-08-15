import {
  combineLatest as observableCombineLatest,
  Observable,
  from as fromPromise,
  of,
} from "rxjs";
import { Injectable } from "@angular/core";

import { catchError, tap, switchMap, map } from "rxjs/operators";

import { AngularFireDatabase } from "angularfire2/database";
import { AuthService } from "../../account/shared/auth.service";
import { FileUploadService } from "./file-upload.service";
import { MessageService } from "../../messages/message.service";
import { ProductRatingService } from "./product-rating.service";

import { Product } from "../../models/product.model";
import { ProductsUrl } from "./productsUrl";

@Injectable()
export class ProductService {
  private productsUrl = ProductsUrl.productsUrl;

  constructor(
    private messageService: MessageService,
    private angularFireDatabase: AngularFireDatabase,
    public authService: AuthService,
    private uploadService: FileUploadService,
    private productRatingService: ProductRatingService
  ) {}

  /** Log a ProductService message with the MessageService */
  private log(message: string) {
    this.messageService.add("ProductService: " + message);
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      this.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  public getCategories(): Observable<any[]> {
    return this.angularFireDatabase
      .list<any>("categories")
      .valueChanges()
      .pipe(
        map((arr) => arr.reverse()),
        catchError(this.handleError<any[]>(`getCategories`))
      );
  }

  public addCategory(category: string) {
    var jsonString = '{ "' + category + '": "' + category + '" }';
    var jsonCategory = JSON.parse(jsonString);

    return this.angularFireDatabase
      .object<any>("categories")
      .update(jsonCategory);
  }

  public deleteCategory(category: string) {
    return this.angularFireDatabase
      .object<any>("categories/" + category)
      .remove();
  }

  public getProducts(): Observable<Product[]> {
    return this.angularFireDatabase
      .list<Product>("products", (ref) => ref.orderByChild("date"))
      .valueChanges()
      .pipe(
        map((arr) => arr.reverse()),
        catchError(this.handleError<Product[]>(`getProducts`))
      );
  }

  public getProductsQuery(
    byChild: string,
    equalTo: string | boolean,
    limitToFirst: number
  ): Observable<Product[]> {
    return this.angularFireDatabase
      .list<Product>("products", (ref) =>
        ref.orderByChild(byChild).equalTo(equalTo).limitToFirst(limitToFirst)
      )
      .valueChanges()
      .pipe(catchError(this.handleError<Product[]>(`getProductsQuery`)));
  }

  public findProducts(term): Observable<any> {
    return this.angularFireDatabase
      .list<Product>("products", (ref) =>
        ref
          .orderByChild("name")
          .startAt(term)
          .endAt(term + "\uf8ff")
      )
      .valueChanges()
      .pipe(catchError(this.handleError<Product[]>(`getProductsQuery`)));
  }

  public getProductsByDate(limitToLast: number): Observable<Product[]> {
    return this.angularFireDatabase
      .list<Product>("products", (ref) =>
        ref.orderByChild("date").limitToLast(limitToLast)
      )
      .valueChanges()
      .pipe(
        map((arr) => arr.reverse()),
        catchError(this.handleError<Product[]>(`getProductsByDate`))
      );
  }

  public getProductsByRating(limitToLast: number): Observable<Product[]> {
    return this.angularFireDatabase
      .list<Product>("products", (ref) =>
        ref.orderByChild("currentRating").limitToLast(limitToLast)
      )
      .valueChanges()
      .pipe(
        map((arr) => arr.reverse()),
        catchError(this.handleError<Product[]>(`getProductsByRating`))
      );
  }

  public getFeaturedProducts(): Observable<any[]> {
    return this.angularFireDatabase
      .list<Product>("featured")
      .snapshotChanges()
      .pipe(
        switchMap(
          (actions) => {
            return observableCombineLatest(
              actions.map((action) => this.getProduct(action.key))
            );
          },
          (actionsFromSource, resolvedProducts) => {
            resolvedProducts.map((product, i) => {
              product["imageFeaturedUrl"] =
                actionsFromSource[i].payload.val().imageFeaturedUrl;
              return product;
            });
            return resolvedProducts;
          }
        ),
        catchError(this.handleError<Product[]>(`getFeaturedProducts`))
      );
  }

  public getProduct(id: any): Observable<Product | null> {
    const url = `${this.productsUrl}/${id}`;
    return this.angularFireDatabase
      .object<Product>(url)
      .valueChanges()
      .pipe(
        tap((result) => {
          if (result) {
            return of(result);
          } else {
            this.messageService.addError(
              `No se ha encontrado ningún producto con id=${id}`
            );
            return of(null);
          }
        }),
        catchError(this.handleError<Product>(`getProduct id=${id}`))
      );
  }

  public updateProduct(data: { product: Product; files: FileList }) {
    const url = `${this.productsUrl}/${data.product.id}`;
    if (data.files.length != 0) {
      return this.updateProductWithoutNewImage(data.product, url);
    }

    const dbOperation = this.uploadService
      .startUpload(data)
      .then((result) => {
        result.downloadURL.subscribe((url) => {
          data.product.imageURLs[0] = url;
        });
        data.product.imageRefs[0] = result.task.ref.fullPath;

        return data;
      })
      .then((dataWithImagePath) => {
        return this.angularFireDatabase
          .object<Product>(url)
          .update(data.product);
      })
      .then((response) => {
        this.log(`Producto modificado ${data.product.name}`);
        return data.product;
      })
      .catch((error) => {
        this.handleError(error);
        return error;
      });
    return fromPromise(dbOperation);
  }

  private updateProductWithoutNewImage(product: Product, url: string) {
    const dbOperation = this.angularFireDatabase
      .object<Product>(url)
      .update(product)
      .then((response) => {
        this.log(`Producto modificado ${product.name}`);
        return product;
      })
      .catch((error) => {
        this.handleError(error);
        return error;
      });
    return fromPromise(dbOperation);
  }

  public addProduct(data: { product: Product; files: FileList }) {
    const dbOperation = this.uploadService
      .startUpload(data)
      .then(
        (result) => {
          result.downloadURL.subscribe((url) => {
            data.product.imageURLs.push(url);
            data.product.imageRefs.push(result.task.ref.fullPath);

            return this.angularFireDatabase
              .list("products")
              .set(data.product.id.toString(), data.product);
          });
        },
        (error) => error
      )
      .then((response) => {
        this.log(`Producto añadido ${data.product.name}`);
        return data.product;
      })
      .catch((error) => {
        console.error(`Error al agregar, producto ${data.product.name}`, error);
        this.messageService.addError(
          `Error al agregar, producto ${data.product.name}`
        );
        this.handleError(error);
        return error;
      });
    return fromPromise(dbOperation);
  }

  public deleteProduct(product: Product) {
    const url = `${this.productsUrl}/${product.id}`;

    this.uploadService.deleteFile(product.imageRefs);

    return this.angularFireDatabase
      .object<Product>(url)
      .remove()
      .then(() => this.log("Eliminación exitosa " + product.name))
      .catch((error) => {
        this.messageService.addError("Eliminación fallida " + product.name);
        this.handleError("eliminar producto");
      });
  }
}
