import { Injectable, OnInit } from '@angular/core';
import { Observable ,  of ,  from as fromPromise, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AngularFireDatabase } from 'angularfire2/database';

import { Order } from '../../../models/order.model';

import { MessageService } from '../../../messages/message.service';
import { AuthService } from '../../shared/auth.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

@Injectable()
export class OrderService {
  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private store: AngularFireDatabase,
    private http: HttpClient,
    private angularFireDatabase: AngularFireDatabase,
  ) {}

  public getOrders() {
    return this.authService.user
      .pipe(
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
              `No se ha encontrado ninguna orden con id=${id}`
            );
            return of(null);
          }
        }),
        catchError(this.handleError<Order>(`getOrder id=${id}`))
      );
  }

  public addUserOrder(order: Order, total: number, user: string) {
    this.goCheckoutMP(order);

    const orderWithMetaData = {
      ...order,
      ...this.constructOrderMetaData(order),
      total
    };

    const databaseOperation = this.store
      .list(`users/${user}/orders`)
      .push(orderWithMetaData)
      .then((response) => response, (error) => error);

    return fromPromise(databaseOperation);
  }

  public addAnonymousOrder(order: Order, total: number) {
    const orderWithMetaData = {
      ...order,
      ...this.constructOrderMetaData(order),
      total
    };

    const databaseOperation = this.store
      .list('orders')
      .push(orderWithMetaData)
      .then((response) => response, (error) => error);

    return fromPromise(databaseOperation);
  }

  public goCheckoutMP(order): Observable<any>{
    var headers: HttpHeaders = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Credentials', 'true');

    return this.http.post('http://localhost:3000/api/checkout', order, {headers: headers})
    .pipe(
      catchError(this.handleErrorHttp)
    )
  }

  private constructOrderMetaData(order: Order) {
    return {
      number: (Math.random() * 10000000000).toString().split('.')[0],
      date: new Date().toString(),
      status: 'En progreso'
    };
  }

  private handleError<T>(operation = 'operation', result?: T) {
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
      console.error('An error occurred:', error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }
}
