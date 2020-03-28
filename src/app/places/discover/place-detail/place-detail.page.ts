import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit {
  // WE INJECT NAV CONTROLLER TO HELP AID PROPER PAGE TRANSITION
  constructor(private router: Router, private navCrtl: NavController) { }

  ngOnInit() {
  }

  onBookPlace() {
    // THE BELOW IS NAVIGATING USING navigateByUrl
    // this.router.navigateByUrl('/places/tabs/discover');

    // UNDER THE HTMLIonModalElement, THIS USED ANGULAR ROUTER
    this.navCrtl.navigateBack('/places/tabs/discover');

    // navigate using the this.navCrtl which will then pop the last screen on the page
    // this.navCrtl.pop();
  }

}
