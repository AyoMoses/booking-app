import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Renderer2,
  OnDestroy,
  Input,
} from '@angular/core';

import { ModalController } from '@ionic/angular';

import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  // @ViewChild('map') mapElementRef: ElementRef;

  @ViewChild('map', { static: true }) mapElementRef: ElementRef<HTMLDivElement>;

  // ADDING A BINDABLE PROPERTY THAT CAN ENABLE US USE OUR MAP CENTER FROM OUTSIDE
  @Input() center = { lat: 6.618132, lng: 3.429364 };
  @Input() selectable = true; // THIS SIMPLY MEANS CAN WE SELECT A PLACE to determine if we have that click listener or not
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';

  // STORE THE BELOW IN A GLOBAL PROPERTY
  clickListener: any;
  googleMaps: any;

  constructor(
    private modalCtrl: ModalController,
    private renderer: Renderer2
  ) {}

  ngOnInit() {}

  // IN CASE THE REJECT PROMISE FAILS TO LOAD THE MAP, WE THEN CATCH THE ERROR
  ngAfterViewInit() {
    this.getGoogleMaps()
      .then((googleMaps) => {
        this.googleMaps = googleMaps;
        const mapEl = this.mapElementRef.nativeElement;
        // tslint:disable-next-line: no-shadowed-variable
        const map = new googleMaps.Map(mapEl, {
          center: this.center,
          zoom: 16,
        });

        // LISTEN TO IT ONCE AFTER THE FIRST INITIAL LOAD. renderer is used to manipulate our dom
        this.googleMaps.event.addListenerOnce(map, 'idle', () => {
          this.renderer.addClass(mapEl, 'visible');
        });

        // ADD EVENT LISTENER ON THE MAP and enebale only if selectable is true and add no marker
        if (this.selectable) {
          this.clickListener = map.addListener('click', (event) => {
            const selectedCoords = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            };
            this.modalCtrl.dismiss(selectedCoords);
          });
        } else { // if its not selectable we add no listner but a marker
          const marker = new googleMaps.Marker({
            position: this.center, // put the marker on our picked location
            map, // short for map: map
            title: 'Picked Location'
          });
          marker.setMap(map);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  // this ensure when we dismiss the modal and clear the map, we actually get rid of click listener
  // so we do not introduce a memory leak
  // remove if click listener is set and remove
  ngOnDestroy() {
    if (this.clickListener) {
      this.googleMaps.event.removeListener(this.clickListener);
    }
  }

  // GOOGLE MAPS SDK
  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src =
        'https://maps.googleapis.com/maps/api/js?key=' +
        environment.googleMapsAPIKey;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google maps SDK not available.');
        }
      };
    });
  }
}
