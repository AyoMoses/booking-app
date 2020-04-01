import { Component, OnInit } from '@angular/core';

import { Place } from '../../place.model';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-offer-bookings',
  templateUrl: './offer-bookings.page.html',
  styleUrls: ['./offer-bookings.page.scss']
})
export class OfferBookingsPage implements OnInit {
  // WE STORE THE PLACE IN A PLACE PROPERTY
  place: Place;
  // WE ADD A PRIAVTE OF OUR OWN NAME route
  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      // If we do not have a matching place ID then we navigate back to offers
      // THE BELOW EXTRACTS ID OF LOADED PLACE
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        // ADD RETURN SO OTHER CODE DOES NOT GET EXECUTED
        return;
      }
      // IF WE HAVE A PLACE ID THEN WE LOAD THE PLACE id
      // LOAD THE PLACES THEN FIND OUR FITTING PLACE AS ITS GOTTEN FROM THE GETPLACE SERVICE FUNCTION CREATED
      this.place = this.placesService.getPlace(paramMap.get('placeId'));
    });
  }
}
