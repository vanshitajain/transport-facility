import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ride, VehicleType } from '../../models/ride.model';
import { RideService } from '../../services/ride.service';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ride-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './ride-list.html',
  styleUrl: './ride-list.scss',
})
export class RideList implements OnInit {
  allRides: Ride[] = [];
  rides: Ride[] = [];
  vehicleType: VehicleType | '' = '';
  message = '';

  constructor(private rideService: RideService) {}

  ngOnInit(): void {
    this.loadRides();
  }

  loadRides() {
    this.rideService.getRides().subscribe({
      next: rides => {
        this.allRides = rides;
        this.applyFilter();
      },
      error: err => {
        console.error(err);
        this.message = 'Failed to load rides.';
      }
    });
  }

  onTypeChange(type: VehicleType | '') {
    this.vehicleType = type;
    this.applyFilter();
  }

  applyFilter() {
    if (this.vehicleType) {
      this.rides = this.allRides.filter(r => r.vehicleType === this.vehicleType);
      if (this.rides.length === 0) {
        this.message = `No ${this.vehicleType} rides available today.`;
      } else {
        this.message = '';
      }
    } else {
      this.rides = [...this.allRides];
      if (this.rides.length === 0) {
        this.message = 'No rides available for today.';
      } else {
        this.message = '';
      }
    }
  }
}