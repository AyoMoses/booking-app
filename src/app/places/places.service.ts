import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay } from 'rxjs/operators';

import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  // tslint:disable-next-line: variable-name. Behaviour subject is a construct imported from rxjs
  // we create a new behaviour subject that starts with our list of places
  // tslint:disable-next-line: variable-name
  private _places = new BehaviorSubject<Place[]>([
    new Place(
      'p1',
      'Boat house in Lagos',
      'House beside the beach, Takwa Bay',
      '/assets/boat-house.jpg',
      8000,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      'abc'
    ),
    new Place(
      'p2',
      'Mansion in Abuja',
      'Facade in Abuja, Gwarimpa.',
      '/assets/facade.jpg',
      15000,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      'abc'
    ),
    new Place(
      'p3',
      'Mansion in Lagos',
      'House in Lekki with a helipad',
      '/assets/mansion.jpg',
      16000,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      'abc'
    ),
    new Place(
      'p4',
      'Mansion in Ibadan',
      'The city with brown roof tops and unique culture of amala',
      '/assets/palace.jpg',
      13000,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      'abc'
    ),
    new Place(
      'p5',
      'Luxury apartment in Lagos',
      'Not your average city neighborhood in Ikoyi!',
      '/assets/san-francisco.jpg',
      30000,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      'abc'
    ),
  ]);

  // get places() {
  //   return [...this._places];
  // }

  // with the addition of rxjs, places is no longer an array but a subject
  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService) {}

  getPlace(id: string) {
    return this.places.pipe(
      take(1),
      map((places) => {
        return { ...places.find((p) => p.id === id) };
      })
    );
  }

  // what we call when we add a new place by adding a constructor to make a new one
  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      '/assets/boat-house.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    return this.places.pipe(
      take(1),
      delay(1000),
      tap((places) => {
        this._places.next(places.concat(newPlace));
      })
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    return this.places.pipe(
      take(1),
      delay(1000),
      tap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        const updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );
        this._places.next(updatedPlaces);
      })
    );
  }
}
