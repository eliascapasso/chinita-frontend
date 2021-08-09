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

  public getObject(type: any): Observable<any | null> {
    const url = `${this.sharedUrl}/${type}`;
    return this.angularFireDatabase
      .object<any>(url)
      .valueChanges()
      .pipe(
        tap((result) => {
          if (result) {
            return of(result);
          } else {
            this.messageService.addError(
              `No se ha encontrado ningún objeto con id=${type}`
            );
            return of(null);
          }
        }),
        catchError(this.handleError<any>(`getObject id=${type}`))
      );
  }

  public updateObject(data: { type: any; file: any }) {
    const dbOperation = this.uploadService
      .uploadSharedFile(data)
      .then(
        (result) => {
          result.downloadURL.subscribe((url) => {
            let object = {
              imageURLs: url,
              imageRefs: result.task.ref.fullPath
            }

            return this.angularFireDatabase
              .list("shared")
              .update(data.type, object);
          });
        },
        (error) => {
          console.error(error);
        }
      )
      .then((response) => {
        this.log(`Objeto añadido ${data.type}`);
        return data.type;
      })
      .catch((error) => {
        console.error(`Error al agregar, objeto ${data.type}`, error);
        this.messageService.addError(
          `Error al agregar, objeto ${data.type}`
        );
        this.handleError(error);
        return error;
      });
    return fromPromise(dbOperation);
  }
}
