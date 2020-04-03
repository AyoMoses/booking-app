import { Injectable } from '@angular/core';

import { Booking } from './booking.model';

@Injectable({ providedIn: 'root' })
export class BookingsService {
    // tslint:disable-next-line: variable-name
    private _bookings: Booking[] = [
        {
            id: 'Jon Snow',
            placeId: 'p1',
            placeTitle: 'Boat house in Lagos',
            guestNumber: 2,
            userId: 'abc'
        }
    ];

    get bookings() {
        return [...this._bookings];
    }
}
