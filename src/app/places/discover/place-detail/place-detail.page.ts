import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NavController,
  ModalController,
  ActionSheetController,
  LoadingController,
  AlertController,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';

import { BookingsService } from '../../../bookings/bookings.service';
import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { MapModalComponent } from '../../../shared/map-modal/map-modal.component';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isLoading = false;
  isBookable: boolean;
  private placeSub: Subscription;
  // WE INJECT NAV CONTROLLER TO HELP AID PROPER PAGE TRANSITION
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingsService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      // WE START FETCHING OUR PLACE THEN WE SET IS LOADING TO TRUE
      this.isLoading = true;
      this.placeSub = this.placesService
        .getPlace(paramMap.get('placeId'))
        .subscribe(
          (place) => {
            // this first place is the property place and the second is the place gotten as an arguement in the subscribe method
            this.place = place;
            this.isBookable = place.userId !== this.authService.userId;
            // ONCE WE ARE DONE this.isLoading, WE SET this.isLoading TO FALSE
            this.isLoading = false;

            // ADD ERROR object HANDLING ONCE PLACES ARE NOT GOTTEN sent by the serve. We then inject alert controller
          },
          (error) => {
            this.alertCtrl
              .create({
                header: 'An error occured',
                message: 'could not load place.',
                buttons: [
                  {
                    text: 'Okay',
                    handler: () => {
                      this.router.navigate(['/places/tabs/discover']);
                    },
                  },
                ],
                // THE WE CALL ALERT TO SHOW OUR ALERT ELEMENT IF ERROR IS GOTTEN
              })
              .then((alertEl) => alertEl.present());
          }
        );
    });
  }

  onBookPlace() {
    // THE BELOW IS NAVIGATING USING navigateByUrl
    // this.router.navigateByUrl('/places/tabs/discover');

    // UNDER THE HTMLIonModalElement, THIS USED ANGULAR ROUTER
    // this.navCtrl.navigateBack('/places/tabs/discover');

    // navigate using the this.navCrtl which will then pop the last screen on the page
    // this.navCrtl.pop();

    // ACTION SHEET ADDED
    this.actionSheetCtrl
      .create({
        header: 'Choose an Action',
        buttons: [
          {
            text: 'Select Date',
            handler: () => {
              this.openBookingMOdal('select');
            },
          },
          {
            text: 'Random Date',
            handler: () => {
              this.openBookingMOdal('random');
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
          },
        ],
      })
      .then((actionSheetEl) => {
        actionSheetEl.present();
      });
  }

  // OPEN THE MODAL THRU THE MODAL CONTROLLER
  // TS style. Mode has to be a string but not just any - exactly select or random
  openBookingMOdal(mode: 'select' | 'random') {
    console.log(mode);
    // WE USE A MODAL THIS WAY. The create method takes the component which the modal will be used in as object
    this.modalCtrl
      .create({
        component: CreateBookingComponent,
        componentProps: { selectedPlace: this.place, selectedMode: mode },
      })
      .then((modalEl) => {
        modalEl.present();
        // onDidDismiss returns a promise. we add an event listner to know which modal button was clicked from below statements
        return modalEl.onDidDismiss();
      })
      // LOGIC BELOW CALLS THA ADD BOOKING SPINNER
      .then((resultData) => {
        if (resultData.role === 'confirm') {
          this.loadingCtrl
            .create({ message: 'Booking place...' })
            .then((loadingEl) => {
              loadingEl.present();
              const data = resultData.data.bookingData;
              this.bookingService
                .addBooking(
                  this.place.id,
                  this.place.title,
                  this.place.imageUrl,
                  data.firstName,
                  data.lastName,
                  data.guestNumber,
                  data.startDate,
                  data.endDate
                )
                .subscribe(() => {
                  loadingEl.dismiss();
                  this.router.navigate(['/bookings']);
                });
            });
        }
      });
  }

  // BIND ALL OUR THE PROPERTIES CREATED IN MAPMODAL
  onShowFullMap() {
    this.modalCtrl
      .create({
        component: MapModalComponent,
        componentProps: {
          center: {
            lat: this.place.location.lat,
            lng: this.place.location.lng,
          },
          selectable: false,
          closeButtonText: 'Close',
          title: this.place.location.address,
        },
      })
      .then((modalEl) => {
        modalEl.present();
      });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
