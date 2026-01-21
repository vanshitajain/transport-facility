import { Component } from '@angular/core';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { RideService } from '../../services/ride.service';
import { Ride, VehicleType } from '../../models/ride.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pick-ride',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './pick-ride.html',
  styleUrl: './pick-ride.scss',
})
export class PickRide {
  vehicleTypes: (VehicleType | 'All')[] = ['All', 'Bike', 'Car'];
  rides: Ride[] = [];
  message = '';

  form: FormGroup;

  constructor(private fb: FormBuilder, private rideService: RideService) {
    this.form = this.fb.group({
      employeeId: ['', Validators.required],
      time: ['', Validators.required],
      vehicleType: ['All']
    });
  }

  searchRides() {
    if (this.form.invalid) {
      this.message = 'Please enter Employee ID and Time.';
      return;
    }

    const { time, vehicleType } = this.form.value;
    const type = vehicleType === 'All' ? undefined : (vehicleType as VehicleType);

    this.rideService.findTimeMatchingRides(time!, type).subscribe({
      next: rides => {
        this.rides = rides;
        this.message = rides.length === 0 ? 'No rides found within ±60 minutes.' : '';
      },
      error: err => {
        console.error(err);
        this.message = 'Failed to search rides.';
      }
    });
  }

  bookRide(ride: Ride) {
    const employeeId = this.form.value.employeeId!;
    this.rideService.bookRide(ride, employeeId).subscribe({
      next: updatedRideOrError => {
        if ('error' in updatedRideOrError) {
          this.message = updatedRideOrError.error;
        } else {
          this.message = 'Ride booked successfully!';
          this.searchRides(); // refresh list
        }
      },
      error: err => {
        console.error(err);
        this.message = 'Booking failed.';
      }
    });
  }

}