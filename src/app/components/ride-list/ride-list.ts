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
  todayDate: Date = new Date();
  constructor(private rideService: RideService) {}

  ngOnInit(): void {
    this.loadRides();
    this.sortRides(this.rides);

  }

  private sortRides(rides: Ride[]): Ride[] {
  return rides.sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time}:00`).getTime();
    const dateTimeB = new Date(`${b.date}T${b.time}:00`).getTime();
    return dateTimeA - dateTimeB;
  });
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
    this.sortRides(this.allRides);
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