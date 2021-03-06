import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import {
  ModalController,
  ActionSheetController,
  AlertController,
} from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Plugins, Capacitor } from '@capacitor/core';

import { MapModalComponent } from '../../map-modal/map-modal.component';

import { environment } from '../../../../environments/environment';
import { PlaceLocation, Coordinates } from '../../../places/location.model';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
  // we use @Output to make locationPick become a listenable event. Listen to from outside
  // tslint:disable-next-line: new-parens
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  selectedLocationImage: string;
  isLoading: boolean;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  onPickLocation() {
    this.actionSheetCtrl
      .create({
        header: 'Please Choose',
        buttons: [
          {
            text: 'Auto-Locate',
            handler: () => {
              this.locateUser();
            },
          },
          {
            text: 'Pick on Map',
            handler: () => {
              this.openMap();
            },
          },
          { text: 'Cancel', role: 'Cancel' },
        ],
      })
      .then((actionSheetEl) => {
        actionSheetEl.present();
      });
  }

  // AUTO LOCATE USER COORDINATES
  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert();
      return; // return means to stop and not execute next set of code
    }
    this.isLoading = true;
    // IF WE MAKE IT THRU THE ABOVE CODE WITHOUT AN ERRO
    Plugins.Geolocation.getCurrentPosition()
      .then((geoPosition) => {
        const coordinates: Coordinates = {
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude,
        };
        this.createPlace(coordinates.lat, coordinates.lng);
        this.isLoading = false;
      })
      .catch((err) => {
        this.isLoading = false;
        this.showErrorAlert();
      });
  }

  private showErrorAlert() {
    this.alertCtrl
      .create({
        header: 'Could not fetch location',
        message: 'Please use the map to pick a location!',
        buttons: ['Okay']
      })
      .then((alertEl) => {
        alertEl.present();
      });
  }

  private openMap() {
    this.modalCtrl.create({ component: MapModalComponent }).then((modalEl) => {
      modalEl.onDidDismiss().then((modalData) => {
        if (!modalData.data) {
          return;
        }
        const coordinates: Coordinates = {
          lat: modalData.data.lat,
          lng: modalData.data.lng,
        };
        this.createPlace(coordinates.lat, coordinates.lng);
      });
      modalEl.present();
    });
  }

  private createPlace(lat: number, lng: number) {
    const pickedLocation: PlaceLocation = {
      // tslint:disable-next-line: object-literal-shorthand
      lat: lat,
      // tslint:disable-next-line: object-literal-shorthand
      lng: lng,
      address: null,
      staticMapImageUrl: null,
    };

    // LOAD SPINNER ONCE WE ARE DONE PICKING AN ADDRESS
    this.isLoading = true;
    this.getAddress(lat, lng)
      .pipe(
        switchMap((address) => {
          pickedLocation.address = address;
          // of is wrapped around any value that is instantly emmited
          return of(
            this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14)
          );
        })
      )
      .subscribe((staticMapImageUrl) => {
        pickedLocation.staticMapImageUrl = staticMapImageUrl;
        this.selectedLocationImage = staticMapImageUrl;
        // LOADING IS FALSE ONCE WE GET OUR IMAGE
        this.isLoading = false;
        this.locationPick.emit(pickedLocation);
      });
  }

  private getAddress(lat: number, lng: number) {
    return this.http
      .get<any>(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsAPIKey}`
      )
      .pipe(
        map((geoData) => {
          if (!geoData || !geoData.results || geoData.results.length === 0) {
            return null;
          }
          return geoData.results[0].formatted_address;
        })
      );
  }

  // FETCH IMAGE OF PICKED MAP PREVIEW (generating a screenshot) && we set a custom label as Place then remove markers to have one
  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:PlaceS%7C${lat},${lng}
    &key=${environment.googleMapsAPIKey}`;
  }
}
