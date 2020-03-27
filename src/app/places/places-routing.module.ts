import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlacesPage } from './places.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: PlacesPage,
    children: [
      {
        path: 'discover',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./discover/discover.module').then(
                m => m.DiscoverPageModule
              )
          },
          {
            path: ':placeId',
            loadChildren: () =>
              import('./discover/place-detail/place-detail.module').then(
                m => m.PlaceDetailPageModule
              )
          },
          {
            path: '',
            redirectTo: 'places/tabs/discover',
            pathMatch: 'full'
          }
        ]
      },
      {
        path: 'offers',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./offers/offers.module').then(m => m.OffersPageModule)
          },
          {
            path: 'new-offer',
            loadChildren: () => import('./offers/new-offer/new-offer.module').then( m => m.NewOfferPageModule)
          },
          {
            path: 'edit/:placeId',
            loadChildren: () => import('./offers/edit-offer/edit-offer.module').then( m => m.EditOfferPageModule)
          },
          {
            path: ':placeId',
            loadChildren: () => import('./offers/offer-bookings/offer-bookings.module').then(m => m.OfferBookingsPageModule)
          },
        ]
      }
    ]
  },
  {
    path: '',
    redirectTo: '/places/tabs/discover',
    pathMatch: 'full'
  }
];

// hard coded routes first before dynamic routes
// remember that tab name id in html must be the same as the route path and route with :productId is a dynamic param
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlacesPageRoutingModule {}
