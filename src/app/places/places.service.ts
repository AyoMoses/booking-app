import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';

import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { PlaceLocation } from './location.model';

// [
//   new Place(
//     'p1',
//     'Boat house in Lagos',
//     'House beside the beach, Takwa Bay',
//     '/assets/boat-house.jpg',
//     8000,
//     new Date('2020-01-01'),
//     new Date('2020-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p2',
//     'Mansion in Abuja',
//     'Facade in Abuja, Gwarimpa.',
//     '/assets/facade.jpg',
//     15000,
//     new Date('2020-01-01'),
//     new Date('2020-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p3',
//     'Mansion in Lagos',
//     'House in Lekki with a helipad',
//     '/assets/mansion.jpg',
//     16000,
//     new Date('2020-01-01'),
//     new Date('2020-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p4',
//     'Mansion in Ibadan',
//     'The city with brown roof tops and unique culture of amala',
//     '/assets/palace.jpg',
//     13000,
//     new Date('2020-01-01'),
//     new Date('2020-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p5',
//     'Luxury apartment in Lagos',
//     'Not your average city neighborhood in Ikoyi!',
//     '/assets/san-francisco.jpg',
//     30000,
//     new Date('2020-01-01'),
//     new Date('2020-12-31'),
//     'abc'
//   ),
// ]

// DEFINE HOW RESPONSE FOR PLACES DATA WILL LOOK LIKE ONCE GOTTEN FROM THE API
interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  // tslint:disable-next-line: variable-name. Behaviour subject is a construct imported from rxjs
  // we create a new behaviour subject that starts with our list of places
  // tslint:disable-next-line: variable-name
  private _places = new BehaviorSubject<Place[]>([]);

  // get places() {
  //   return [...this._places];
  // }

  // with the addition of rxjs, places is no longer an array but a subject
  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) {}

  // FETCH OUR EXISTING PLACES FROM THE API
  fetchPlaces() {
    return (
      this.http
        // WE GET BACK VARIOUS KEYS WHERE WE DON'T KNOW THE NAME WHERE EACH KEY WILL HOLD PALCE DATA IN THE END
        .get<{ [key: string]: PlaceData }>(
          'https://ambient-mystery-273815.firebaseio.com/offered-places.json'
        )
        .pipe(
          map((resData) => {
            const places = [];
            for (const key in resData) {
              if (resData.hasOwnProperty(key)) {
                places.push(
                  new Place(
                    key,
                    resData[key].title,
                    resData[key].description,
                    resData[key].imageUrl,
                    resData[key].price,
                    new Date(resData[key].availableFrom),
                    new Date(resData[key].availableTo),
                    resData[key].userId,
                    resData[key].location
                  )
                );
              }
            }
            return places;
            // return [];
          }),
          tap((places) => {
            this._places.next(places);
          })
        )
    );
  }

  // GET A SINGLE PLACE
  getPlace(id: string) {
    return this.http
      .get<PlaceData>(
        `https://ambient-mystery-273815.firebaseio.com/offered-places/${id}.json`
      )
      .pipe(
        map((placeData) => {
          return new Place(
            id,
            placeData.title,
            placeData.description,
            placeData.imageUrl,
            placeData.price,
            new Date(placeData.availableFrom),
            new Date(placeData.availableTo),
            placeData.userId,
            placeData.location
          );
        })
      );
  }

  // what we call when we add a new place by adding a constructor to make a new one
  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation
  ) {
    // RANDOM GENERATED ID
    let generatedId: string;
    let newPlace: Place;
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        if (!userId) {
          throw new Error('No user found!');
        }

        newPlace = new Place(
          Math.random().toString(),
          title,
          description,
          '/assets/boat-house.jpg',
          price,
          dateFrom,
          dateTo,
          userId,
          location
        );
        // WE POST AN HTTP REQUEST AND CAN USE OUR FOLDER TO SAVE ON THE DATABASE TOO i.e offered-places
        return this.http.post<{ name: string }>(
          'https://ambient-mystery-273815.firebaseio.com/offered-places.json',
          { ...newPlace, id: null }
        );
      }),
      switchMap((resData) => {
        generatedId = resData.name;
        return this.places;
      }),
      take(1),
      tap((places) => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      })
    );
    // return this.places.pipe(
    //   take(1),
    //   delay(1000),
    //   tap((places) => {
    //     this._places.next(places.concat(newPlace));
    //   })
    // );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap((places) => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location
        );
        // put means to replace from the API
        return this.http.put(
          `https://ambient-mystery-273815.firebaseio.com/offered-places/${placeId}.json`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
}
