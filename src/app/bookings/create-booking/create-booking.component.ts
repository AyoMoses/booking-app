import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

import { Place } from '../../places/place.model';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
  @Input() selectedPlace: Place;
  @Input() selectedMode: 'select' | 'random'; // gotten from place detail mode select or random
  @ViewChild('f', { static: true }) form: NgForm; // we get access to the form in the html
  startDate: string;
  endDate: string;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    // random date selection
    const availableFrom = new Date(this.selectedPlace.availableFrom);
    const availableTo = new Date(this.selectedPlace.availableTo);
    // randomly generated date taking the starting date off and the ending date into account
    if (this.selectedMode === 'random') {
      this.startDate = new Date(
        availableFrom.getTime() +
          Math.random() *
            (availableTo.getTime() -
              7 * 24 * 60 * 60 * 1000 -
              availableFrom.getTime())
      ).toISOString();

      this.endDate = new Date(
        new Date(this.startDate).getTime() +
          Math.random() *
            (new Date(this.startDate).getTime() +
              6 * 24 * 60 * 60 * 1000 -
              new Date(this.startDate).getTime())
      ).toISOString();
    }
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onBookPlace() {
    // check form validity
    if (!this.form.valid || !this.datesValid) {
      return; // in case u manually enable button in dev tool
    }

    // confirm in this context is a role. We then check if our form is valid to then dismiss modal
    this.modalCtrl.dismiss(
      {
        bookingData: {
          firstName: this.form.value['first-name'], // has to match the key set in forms name="first-name"
          lastName: this.form.value['last-name'],
          guestNumbers: this.form.value['guest-number'],
          startDate: this.form.value['date-from'],
          endDate: this.form.value['date-to'],
        },
      },
      'confirm'
    );
  }

  datesValid() {
    const startDate = new Date(this.form.value['date-from']);
    const endDate = new Date(this.form.value['date-to']);
    return endDate > startDate;
  }
}
