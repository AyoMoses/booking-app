import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService, AuthResponseData } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  // add an isLoading property
  isLoading = false;
  isLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  authenticate(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'Logging you in...' })
      .then((loadingEl) => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>;
        if (this.isLogin) {
          authObs = this.authService.login(email, password);
        } else { // if we are not logged in but signing up
          authObs = this.authService.signUp(email, password);
        }
        authObs.subscribe((resData) => {
          console.log(resData);
          this.isLoading = false;
          loadingEl.dismiss();
          this.router.navigateByUrl('/places/tabs/discover');
        }, errRes => {
          console.log(errRes);
          loadingEl.dismiss();
          const code = errRes.error.error.message;
          let message = 'Could not sign you up, please try again';
          if (code === 'EMAIL_EXISTS') {
            message = 'This email address already exists!';
          } else if (code === 'EMAIL_NOT_FOUND') {
            message = 'E-Mail address could not be found.';
          } else if (code === 'INVALID_PASSWORD') {
            message = 'Your password is incorrect';
          }
          this.showAlert(message);
        });
      });
  }

  // switch our authentication mode based on state. we invert. if its false its true if its true its false
  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    // IF YOU HAVE A VALID FORM THEN WE MAKE A POSITIVE IF CHECK AND PROCEED TO THE BELOW
    const email = form.value.email; // from the name given to our forms
    const password = form.value.password;

    // we check if authenticated and forward email and password
    this.authenticate(email, password);
    form.reset();
  }

  // SHOW ERROR MESSAGE TO USERS
  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Authentication failed',
        // tslint:disable-next-line: object-literal-shorthand
        message: message,
        buttons: ['Okay'],
      })
      .then((alertEl) => {
        alertEl.present();
      });
  }
}
