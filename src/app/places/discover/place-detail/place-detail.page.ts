import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss']
})
export class PlaceDetailPage implements OnInit {
  place: Place;
  // WE INJECT NAV CONTROLLER TO HELP AID PROPER PAGE TRANSITION
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private route: ActivatedRoute
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
    this.navCtrl.navigateBack('/places/tabs/discover');

    // navigate using the this.navCrtl which will then pop the last screen on the page
    // this.navCrtl.pop();
  }
}
