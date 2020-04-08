import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Place } from '../place.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  // load the place-model
  loadedOffers: Place[];
  // to avoid memory being full
  private placesSub: Subscription;

  constructor(private placesService: PlacesService, private router: Router) { }

  ngOnInit() {
    // inject the this.placesService to get data
   this.placesService.places.subscribe(places => {
     this.loadedOffers = places;
   });
  }

  // IMPORT SLIDING ITEM AND CLOSE WHEN CLICKED THEN NAVIGATING TO EDIT BY GETTING THE OFFER ID
  // THIS METHOD ENSURES THE SLIDER IS CLOSED AND REMAINS CLOSEED WHEN NAVIGATED BACK
  onEdit(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
    console.log('Editing item', offerId);
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
