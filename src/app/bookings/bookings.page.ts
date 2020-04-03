import { Component, OnInit } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';

import { BookingsService } from './bookings.service';
import { Booking } from './booking.model';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit {
  // this imports the booking model
  loadedBookings: Booking[];

  constructor(private bookingsService: BookingsService) { }

  ngOnInit() {
    // this imports the dummy bookings
    this.loadedBookings = this.bookingsService.bookings;
  }

  onCancelBooking(offerId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    // cancel booking with offerId
  }
}
