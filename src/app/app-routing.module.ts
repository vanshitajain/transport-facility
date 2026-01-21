import { Routes } from '@angular/router';
import { RideList } from './components/ride-list/ride-list';
import { PickRide } from './components/pick-ride/pick-ride';
import { AddRide } from './components/add-ride/add-ride';

export const routes: Routes = [
  { path: '', redirectTo: 'rides', pathMatch: 'full' },
  { path: 'add', component: AddRide },
  { path: 'rides', component: RideList },
  { path: 'pick', component: PickRide },
  { path: '**', redirectTo: 'rides' }
];