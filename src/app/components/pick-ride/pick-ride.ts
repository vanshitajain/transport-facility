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
      pickupPoint: ['', Validators.required],
      destination: ['', Validators.required],
      time: ['', Validators.required],
      vehicleType: ['All']
    });
  }

  searchRides() {
    const { pickupPoint, destination, time, vehicleType } = this.form.value;
    
    if (!pickupPoint || !destination || !time) {
      this.form.markAllAsTouched();
      this.message = 'Please enter Pickup, Destination and Time.';
      return;
    }

    const type = vehicleType === 'All' ? undefined : (vehicleType as VehicleType);

    this.rideService.searchRides(pickupPoint!, destination!, time!, type).subscribe({
      next: rides => {
        this.rides = rides;
        this.message = rides.length === 0 ? 'No rides found matching criteria.' : '';
      },
      error: err => {
        console.error(err);
        this.message = 'Failed to search rides.';
      }
    });
  }

  bookRide(ride: Ride) {
    const employeeId = this.form.value.employeeId;
    if (!employeeId) {
        this.message = 'Please enter your Employee ID to book.';
        return;
    }
    
    this.rideService.bookRide(ride, employeeId).subscribe({
      next: (result: any) => {
        if (result.error) {
          this.message = result.error;
        } else {
          this.message = 'Ride booked successfully!';
          this.searchRides();
        }
      },
      error: err => {
        console.error(err);
        this.message = 'Booking failed.';
      }
    });
  }

}