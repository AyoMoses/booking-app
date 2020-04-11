import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Renderer2,
} from '@angular/core';

import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit {
  // @ViewChild('map') mapElementRef: ElementRef;

  @ViewChild('map', { static: true }) mapElementRef: ElementRef<HTMLDivElement>;

  constructor(private modalCtrl: ModalController, private renderer: Renderer2) {}

  ngOnInit() {}

  // IN CASE THE REJECT PROMISE FAILS TO LOAD THE MAP, WE THEN CATCH THE ERROR
  ngAfterViewInit() {
    this.getGoogleMaps()
      .then((googleMaps) => {
        const mapEl = this.mapElementRef.nativeElement;
        const map = new googleMaps.Map(mapEl, {
          center: { lat: 6.618132, lng: 3.429364 },
          zoom: 16,
        });

        // LISTEN TO IT ONCE AFTER THE FIRST INITIAL LOAD. renderer is used to manipulate our dom
        googleMaps.event.addListenerOnce(map, 'idle', () => {
          this.renderer.addClass(mapEl, 'visible');
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src =
        'https://maps.googleapis.com/maps/api/js?key=AIzaSyCnAB_VM1R7sMyl-Dv1YebR4rwa29GG6uA';
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
