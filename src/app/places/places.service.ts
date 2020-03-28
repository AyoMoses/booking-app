import { Injectable } from '@angular/core';

import { Place } from './place.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  // tslint:disable-next-line: variable-name
  private _places: Place[] = [
    new Place(
      'p1',
      'Boat house in Lagos',
      'House beside the beach, Takwa Bay',
      '/assets/boat-house.jpg',
      8000
    ),
    new Place(
      'p2',
      'Mansion in Abuja',
      'Facade in Abuja, Gwarimpa.',
      '/assets/facade.jpg',
      15000
    ),
    new Place(
      'p3',
      'Mansion in Lagos',
      'House in Lekki with a helipad',
      '/assets/mansion.jpg',
      16000
    ),
    new Place(
      'p4',
      'Mansion in Ibadan',
      'The city with brown roof tops and unique culture of amala',
      '/assets/palace.jpg',
      13000
    ),
    new Place(
      'p5',
      'Mansion in San Fracisco',
      'Not your average city trip!',
      '/assets/san-francisco.jpg',
      30000
    ),
  ];

  get places() {
    return [...this._places];
  }

  constructor() {}
}
