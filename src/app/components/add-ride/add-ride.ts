import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RideService } from '../../services/ride.service';
import { VehicleType } from '../../models/ride.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-add-ride',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-ride.html',
  styleUrl: './add-ride.scss',
})
export class AddRide {
vehicleTypes: VehicleType[] = ['Bike', 'Car'];
  message = '';

  form;

  constructor(private fb: FormBuilder, private rideService: RideService) {
    this.form = this.fb.group({
      creatorEmployeeId: ['', Validators.required],
      vehicleType: ['Bike' as VehicleType, Validators.required],
      vehicleNo: ['', Validators.required],
      vacantSeats: [1, [Validators.required, Validators.min(1)]],
      time: ['', Validators.required],
      pickupPoint: ['', Validators.required],
      destination: ['', Validators.required]
    });
  }
  submit() {
    if (this.form.invalid) {
      this.message = 'Please fill all mandatory fields correctly.';
      return;
    }

    this.rideService.addRide(this.form.value as any).subscribe({
      next: ride => {
        this.message = 'Ride added successfully!';
        this.form.reset({ vehicleType: 'Bike', vacantSeats: 1 });
      },
      error: err => {
        console.error(err);
        this.message = 'Failed to add ride.';
      }
    });
  }

}
