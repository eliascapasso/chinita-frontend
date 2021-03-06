import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { Observable ,  of } from 'rxjs';
import { take ,  switchMap, map } from 'rxjs/operators';

import { MessageService } from '../../messages/message.service';
import { User } from '../../models/user.model';

@Injectable()
export class AuthService {
  public user: Observable<User>;

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private messageService: MessageService
  ) {
    this.user = this.afAuth.authState
      .pipe(
        switchMap((auth) => {
          if (auth) {
            return this.db.object('users/' + auth.uid).valueChanges()
              .pipe(
                map((user: User) => {
                  return {
                    ...user,
                    uid: auth.uid
                  };
                })
              );
          } else {
            return of(null);
          }
        })
      );
  }

  public googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.afAuth.auth.signInWithPopup(provider).then(
      (credential) => {
        this.updateNewUser(credential.user);
      },
      (error) => {
        throw error;
      }
    );
  }

  public emailSignUp(email: string, password: string) {
    return this.afAuth.auth
      .createUserWithEmailAndPassword(email, password)
      .then(
        (user) => {
          this.updateNewUser(user);
        },
        (error) => {
          throw error;
        }
      );
  }

  emailLogin(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password).then(
      (user) => {
        this.updateNewUser(user);
      },
      (error) => {
        throw error;
      }
    );
  }

  public signOut() {
    this.afAuth.auth.signOut();
    this.messageService.add('Usted ha cerrado sesión');
  }

  public updateProfile(userData: User) {
    this.updateExistingUser(userData);
    this.messageService.add('¡Se ha actualizado el perfil de usuario!');
  }

  public updatePassword(password: string) {
    return this.afAuth.auth.currentUser
      .updatePassword(password)
      .then(() => {
        this.messageService.add('¡La contraseña se ha actualizado!');
      })
      .catch(function(error) {
        throw error;
      });
  }

  public updateEmail(email: string) {
    return this.afAuth.auth.currentUser
      .updateEmail(email)
      .then(() => {
        this.updateExistingUser({ email: email });
        this.messageService.add('¡El correo electrónico del usuario se ha actualizado!');
      })
      .catch(function(error) {
        throw error;
      });
  }

  private updateNewUser(authData) {
    const userData = new User(authData);
    const ref = this.db.object('users/' + authData.uid);
    ref
      .valueChanges()
      .pipe(
        take(1)
      )
      .subscribe((user) => {
        if (!user) {
          ref.update(userData);
        }
      });
  }

  private updateExistingUser(userData) {
    const currentUser = this.afAuth.auth.currentUser;
    const ref = this.db.object('users/' + currentUser.uid);
    ref
      .valueChanges()
      .pipe(
        take(1)
      )
      .subscribe((user) => {
        ref.update(userData);
      });
  }
}
