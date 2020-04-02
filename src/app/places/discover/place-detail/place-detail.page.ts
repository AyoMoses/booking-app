import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';

import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss']
})
export class PlaceDetailPage implements OnInit {
  place: Place;
  // WE INJECT NAV CONTROLLER TO HELP AID PROPER PAGE TRANSITION
  constructor(
    // private router: Router,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.place = this.placesService.getPlace(paramMap.get('placeId'));
    });
  }

  onBookPlace() {
    // THE BELOW IS NAVIGATING USING navigateByUrl
    // this.router.navigateByUrl('/places/tabs/discover');

    // UNDER THE HTMLIonModalElement, THIS USED ANGULAR ROUTER
    // this.navCtrl.navigateBack('/places/tabs/discover');

    // navigate using the this.navCrtl which will then pop the last screen on the page
    // this.navCrtl.pop();

    // WE USE A MODAL THIS WAY. The create method takes the component which the modal will be used in as object
    this.modalCtrl
      .create({
        component: CreateBookingComponent,
        componentProps: { selectedPlace: this.place }
      })
      .then(modalEl => {
        modalEl.present();
        // onDidDismiss returns a promise. we add an event listner to know which modal button was clicked from below statements
        return modalEl.onDidDismiss();
      })
      .then(resultData => {
        console.log(resultData.data, resultData.role);
        if (resultData.role === 'confirm') {
          console.log('BOOKED!');
        }
      });
  }
}
