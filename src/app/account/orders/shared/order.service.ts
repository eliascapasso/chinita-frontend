import { Injectable, OnInit } from "@angular/core";
import { Observable, of, from as fromPromise, throwError } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { AngularFireDatabase } from "angularfire2/database";

import { Order } from "../../../models/order.model";

import { MessageService } from "../../../messages/message.service";
import { AuthService } from "../../shared/auth.service";
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { environment } from "../../../../environments/environment.prod";

@Injectable()
export class OrderService {
  private get serviceBaseURL(): string {
    return environment.apiUrl;
  }

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private store: AngularFireDatabase,
    private http: HttpClient,
    private angularFireDatabase: AngularFireDatabase
  ) {}

  public getOrder(id: any): Observable<Order | null> {
    const url = `orders/${id}`;
    return this.angularFireDatabase
      .object<Order>(url)
      .valueChanges()
      .pipe(
        tap((result) => {
          if (result) {
            return of(result);
          } else {
            this.messageService.addError(
              `No se ha encontrado ningúna orden con id=${id}`
            );
            return of(null);
          }
        }),
        catchError(this.handleError<Order>(`getOrder id=${id}`))
      );
  }

  public getOrders(): Observable<any[]> {
    return this.angularFireDatabase
      .list<any>("orders")
      .valueChanges()
      .pipe(
        map((arr) => arr.reverse()),
        catchError(this.handleError<any[]>(`getOrders`))
      );
  }

  public getOrdersFromUser() {
    return this.authService.user.pipe(
      switchMap((user) => {
        if (user) {
          const remoteUserOrders = `/users/${user.uid}/orders`;
          return this.store.list(remoteUserOrders).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  public addUserOrder(
    order: Order,
    total: number,
    user: string,
    coordinarEntrega: boolean
  ) {
    let medioPago = "";
    if (coordinarEntrega) {
      medioPago = "Coordinar medio de pago";
    } else {
      medioPago = "Mercado Pago";
    }

    const orderWithMetaData = {
      ...order,
      ...this.constructOrderMetaData(order),
      total,
    };

    //DESCOMENTAR
    // const databaseOperation = this.store
    //   .list(`users/${user}/orders`)
    //   .push(orderWithMetaData)
    //   .then(
    //     (response) => response,
    //     (error) => error
    //   );

    //ELIMINAR
    const databaseOperation = this.store
      .list("orders")
      .push(orderWithMetaData)
      .then(
        (response) => {
          let obtieneOrden: boolean = false;
          this.getOrder(response.key).subscribe((order) => {
            if(!obtieneOrden){
              obtieneOrden = true;
              order.id = response.key;
              this.updateOrder(order)
                .then((response) => {
                  this.sendEmail(order, medioPago).subscribe((response) => {
                    if (response) {
                      console.info(
                        "Orden generada y enviada por email exitosamente"
                      );
                    }
                  });
                })
                .catch((error) => {
                  console.error(error);
                });
            }
          });
        },
        (error) => error
      );

    return fromPromise(databaseOperation);
  }

  public addAnonymousOrder(
    order: Order,
    total: number,
    coordinarEntrega: boolean
  ) {
    let medioPago = "";
    if (coordinarEntrega) {
      medioPago = "Coordinar";
    } else {
      medioPago = "Mercado Pago";
    }

    const orderWithMetaData = {
      ...order,
      ...this.constructOrderMetaData(order),
      total,
    };

    const databaseOperation = this.store
      .list("orders")
      .push(orderWithMetaData)
      .then(
        (response) => {
          let obtieneOrden: boolean = false;
          this.getOrder(response.key).subscribe((order) => {
            console.log(obtieneOrden);
            if(!obtieneOrden){
              obtieneOrden = true;
              order.id = response.key;
              this.updateOrder(order)
                .then((response) => {
                  this.sendEmail(order, medioPago).subscribe((response) => {
                    if (response) {
                      console.info("Orden generada y enviada por email");
                    }
                  });
                })
                .catch((error) => {
                  console.error(error);
                });
            }
          });
        },
        (error) => error
      );

    return fromPromise(databaseOperation);
  }

  public updateOrder(order: Order): Promise<void> {
    return this.angularFireDatabase.object("orders/" + order.id).update(order);
  }

  public goCheckoutMP(order): Observable<any> {
    //var url = this.serviceBaseURL + "/checkout";
    var url = "https://chinitabackend.herokuapp.com/api/checkout";

    var headers: HttpHeaders = new HttpHeaders();
    headers.append("Access-Control-Allow-Origin", "*");
    headers.append("Access-Control-Allow-Credentials", "true");

    return this.http
      .post(url, order, { headers: headers })
      .pipe(catchError(this.handleErrorHttp));
  }

  public sendEmail(order: Order, medioPago: string) {
    //var url = this.serviceBaseURL + "/send-email";
    var url = "https://chinitabackend.herokuapp.com/api/send-email";

    let body = {
      order: order,
      medioPago: medioPago,
    };

    var headers: HttpHeaders = new HttpHeaders();
    headers.append("Access-Control-Allow-Origin", "*");
    headers.append("Access-Control-Allow-Credentials", "true");

    return this.http
      .post(url, body, { headers: headers, responseType: "text" })
      .pipe(catchError(this.handleErrorHttp));
  }

  private constructOrderMetaData(order: Order) {
    return {
      number: (Math.random() * 10000000000).toString().split(".")[0],
      date: new Date().toString(),
      status: "Revisando",
    };
  }

  private handleError<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.messageService.addError(`${operation} error: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private handleErrorHttp(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error("An error occurred:", error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.log("ERROR!!", error.message);
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
