import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';

import { environment } from '../../environments/environment';
import { User } from './user.model';

export interface AuthResponseData {
  // kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

// idToken	string	A Firebase Auth ID token for the newly created user.
// email	string	The email for the newly created user.
// refreshToken	string	A Firebase Auth refresh token for the newly created user.
// expiresIn	string	The number of seconds in which the ID token expires.
// localId

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // store our user
  // tslint:disable-next-line: variable-name
  private _user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return !!user.token;
        } else {
          return false;
        }
      })
    );
  }

  // the we get the userId and return the user Id
  get userId() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return user.id;
        } else {
          return null;
        }
      })
    );
  }

  constructor(private http: HttpClient) {}

  // AUTO LOGIN METHOD. tries to fetch data from the storage
  autoLogin() {
    return from(Plugins.Storage.get({ key: 'authData' })).pipe(
      map((storedData) => {
        if (!storedData || !storedData.value) {
          return null;
        }
        const parseData = JSON.parse(storedData.value) as {
          token: string;
          tokenExpirationDate: string;
          userId: string;
          email: string;
        };
        const expirationTime = new Date(parseData.tokenExpirationDate);
        if (expirationTime <= new Date()) {
          return null;
        }
        const user = new User(
          parseData.userId,
          parseData.email,
          parseData.token,
          expirationTime
        );
        return user;
      }),
      tap((user) => {
        if (user) {
          this._user.next(user);
          this.autoLogOut(user.tokenDuration);
        }
      }),
      map((user) => {
        return !!user;
      })
    );
  }

  signUp(email: string, password: string) {
    return (
      this.http
        .post<AuthResponseData>(
          `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
          // tslint:disable-next-line: object-literal-shorthand
          { email: email, password: password, returnSecureToken: true }
          // shorthand for email: email and password
        )
        // this refers to our authservice class and not the tap function
        .pipe(tap(this.setUserData.bind(this)))
    );
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
        // tslint:disable-next-line: object-literal-shorthand
        { email: email, password: password, returnSecureToken: true }
      )
      .pipe(tap(this.setUserData.bind(this)));
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    Plugins.Storage.remove({ key: 'authData' });
  }

  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

  // AUTO LOGOUT
  private autoLogOut(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(
      new Date().getTime() + +userData.expiresIn * 1000
    );
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    );
    this._user.next(user);
    this.autoLogOut(user.tokenDuration);
    this.storeAuthData(
      userData.localId,
      userData.idToken,
      expirationTime.toISOString(),
      userData.email
    );
  }

  // STORE OUR AUTH TOKEN ON DEVICE STORAGE. When app is reloaded, token remains valid
  private storeAuthData(
    userId: string,
    token: string,
    tokenExpirationDate: string,
    email: string
  ) {
    const data = JSON.stringify({
      // tslint:disable-next-line: object-literal-shorthand
      userId: userId,
      // tslint:disable-next-line: object-literal-shorthand
      token: token,
      // tslint:disable-next-line: object-literal-shorthand
      tokenExpirationDate: tokenExpirationDate,
      // tslint:disable-next-line: object-literal-shorthand
      email: email,
    });
    Plugins.Storage.set({ key: 'authData', value: data });
  }
}
