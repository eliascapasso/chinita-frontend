import {
  combineLatest as observableCombineLatest,
  Observable,
  from as fromPromise,
  of,
} from "rxjs";
import { Injectable } from "@angular/core";

import { catchError, tap } from "rxjs/operators";

import { AngularFireDatabase } from "angularfire2/database";
import { environment } from "../../environments/environment";
import { MessageService } from "../messages/message.service";
import { AuthService } from "../account/shared/auth.service";
import { FileUploadService } from "../products/shared/file-upload.service";

@Injectable()
export class SharedService {
  private sharedUrl = environment.sharedUrl;

  constructor(
    private messageService: MessageService,
    private angularFireDatabase: AngularFireDatabase,
    public authService: AuthService,
    private uploadService: FileUploadService
  ) {}

  /** Log a SharedService message with the MessageService */
  private log(message: string) {
    this.messageService.add("SharedService: " + message);
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

  public getProduct(id: any): Observable<any | null> {
    const url = `${this.sharedUrl}/${id}`;
    return this.angularFireDatabase
      .object<any>(url)
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
        catchError(this.handleError<any>(`getProduct id=${id}`))
      );
  }

  public updateObject(data: { object: any; files: FileList }) {
    const dbOperation = this.uploadService
      .startUpload(data)
      .then(
        (result) => {
          result.downloadURL.subscribe((url) => {
            data.object.imageURLs.push(url);
            data.object.imageRefs.push(result.task.ref.fullPath);

            console.log(data.object);

            return this.angularFireDatabase
              .list("products")
              .set(data.object.id.toString(), data.object);
          });
        },
        (error) => error
      )
      .then((response) => {
        this.log(`Producto añadido ${data.object.name}`);
        return data.object;
      })
      .catch((error) => {
        console.error(`Error al agregar, producto ${data.object.name}`, error);
        this.messageService.addError(
          `Error al agregar, producto ${data.object.name}`
        );
        this.handleError(error);
        return error;
      });
    return fromPromise(dbOperation);
  }

  public updateProduct(data: { product: any; files: FileList }) {
    const url = `${this.sharedUrl}/${data.product.id}`;

    if (!data.files.length) {
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
          .object<any>(url)
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

  private updateProductWithoutNewImage(product: any, url: string) {
    const dbOperation = this.angularFireDatabase
      .object<any>(url)
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
}
