import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

import { PlacesService } from '../../places.service';
import { PlaceLocation } from '../../location.model';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  // create form property
  form: FormGroup;

  constructor(
    private placesService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    // we add controls of what we intend to control in out forms
    this.form = new FormGroup({
      // each form control takes an object to configure them. null is no default value
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)],
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)],
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      location: new FormControl(null, {
        validators: [Validators.required],
      }),
    });
  }

  onLocationPicked(location: PlaceLocation) {
    // the first location is our formGroup location above and the second is our location arguement we are getting
    // tslint:disable-next-line: object-literal-shorthand
    this.form.patchValue({ location: location });
  }

  // PICK IMAGE
  onImagePicked(imageData: string) {}

  onCreateOffers() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl
      .create({
        message: 'Creating place...',
      })
      .then((loadingEl) => {
        loadingEl.present();
        // all values here are string thus we add + to convert it to a number
        this.placesService
          .addPlace(
            this.form.value.title,
            this.form.value.description,
            +this.form.value.price,
            new Date(this.form.value.dateFrom),
            new Date(this.form.value.dateTo),
            this.form.value.location
          )
          .subscribe(() => {
            loadingEl.dismiss();
            // after adding new input and goes to pageXOffset, we reset
            this.form.reset();
            this.router.navigate(['/places/tabs/offers']);
          });
      });
  }
}
