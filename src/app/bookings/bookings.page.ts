import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { BookingsService } from './bookings.service';
import { Booking } from './booking.model';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  // this imports the booking model
  loadedBookings: Booking[];
  private bookingSub: Subscription;

  constructor(private bookingsService: BookingsService) { }

  ngOnInit() {
    // this imports the dummy bookings
    this.bookingSub = this.bookingsService.bookings.subscribe(bookings => {
      this.loadedBookings = bookings;
    });
  }

  onCancelBooking(offerId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    // cancel booking with offerId
  }

  ngOnDestroy() {
    if (this.bookingSub) {
      this.bookingSub.unsubscribe();
    }
  }
}
