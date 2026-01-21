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
  rides: Ride[] = [];
  vehicleType?: VehicleType;
  message = '';

  constructor(private rideService: RideService) {}

  ngOnInit(): void {
    this.loadRides();
  }

  // Load rides from backend
  loadRides() {
    this.rideService.getRides().subscribe({
      next: rides => {
        this.rides = rides;
        if (rides.length === 0) {
          this.message = 'No rides available for today.';
        } else {
          this.message = '';
        }
      },
      error: err => {
        console.error(err);
        this.message = 'Failed to load rides.';
      }
    });
  }

  // Filter by vehicle type
  filterByType() {
    if (!this.vehicleType) {
      this.loadRides();
    } else {
      this.rideService.filterByVehicleType(this.vehicleType).subscribe({
        next: rides => {
          this.rides = rides;
          if (rides.length === 0) {
            this.message = `No ${this.vehicleType} rides available today.`;
          } else {
            this.message = '';
          }
        },
        error: err => {
          console.error(err);
          this.message = 'Failed to filter rides.';
        }
      });
    }
  }
}