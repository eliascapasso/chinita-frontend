import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { Contact } from '../../models/contact.model';

@Injectable()
export class ContactService {
  constructor(private angularFireDatabase: AngularFireDatabase) {}

  getContact(): Observable<Contact> {
    return this.angularFireDatabase.object<Contact>('contact').valueChanges();
  }
}