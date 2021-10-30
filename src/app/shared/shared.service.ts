import {
  combineLatest as observableCombineLatest,
  Observable,
  from as fromPromise,
  of,
  throwError,
} from "rxjs";
import { Injectable } from "@angular/core";

import { catchError, tap } from "rxjs/operators";

import { AngularFireDatabase } from "angularfire2/database";
import { environment } from "../../environments/environment";
import { MessageService } from "../messages/message.service";
import { AuthService } from "../account/shared/auth.service";
import { FileUploadService } from "../products/shared/file-upload.service";
import {
  HttpClient,
  HttpClientModule,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";

@Injectable()
export class SharedService {
  private get serviceBaseURL(): string {
    return environment.apiUrl;
  }
  private sharedUrl = environment.sharedUrl;

  constructor(
    private messageService: MessageService,
    private angularFireDatabase: AngularFireDatabase,
    public authService: AuthService,
    private uploadService: FileUploadService,
    private http: HttpClient
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

  public updateObjectWithFile(data: { type: any; file: any }) {
    const dbOperation = this.uploadService
      .uploadSharedFile(data)
      .then(
        (result) => {
          result.downloadURL.subscribe((url) => {
            let object = {
              imageURLs: url,
              imageRefs: result.task.ref.fullPath,
            };

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
        this.messageService.addError(`Error al agregar, objeto ${data.type}`);
        this.handleError(error);
        return error;
      });
    return fromPromise(dbOperation);
  }

  public updateObject(data: { type: string; object: any }): Promise<void> {
    return this.angularFireDatabase.object(data.type).update(data.object);
  }

  public getProvinces(): Observable<any> {
    var url = "https://apis.datos.gob.ar/georef/api/provincias";

    var headers: HttpHeaders = new HttpHeaders();
    headers.append("Access-Control-Allow-Origin", "*");
    headers.append("Access-Control-Allow-Credentials", "true");

    return this.http.get<any>(url).pipe(catchError(this.handleErrorHttp));
  }

  public getCities() {
    return this.http.get<any>("./assets/localidades.json");
  }

  private handleErrorHttp(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error("An error occurred:", error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.info("ERROR!!", error.message);
      console.error(error);
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    // Return an observable with a user-facing error message.
    return throwError("Something bad happened; please try again later.");
  }
}
