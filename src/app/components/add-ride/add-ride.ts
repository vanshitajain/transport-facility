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

    this.form.get('vehicleType')?.valueChanges.subscribe(type => {
      const seatsControl = this.form.get('vacantSeats');
      if (type === 'Bike') {
        seatsControl?.setValidators([Validators.required, Validators.min(1), Validators.max(1)]);
        if (seatsControl?.value && seatsControl.value > 1) seatsControl.setValue(1);
      } else {
        seatsControl?.setValidators([Validators.required, Validators.min(1), Validators.max(7)]);
      }
      seatsControl?.updateValueAndValidity();
    });
  }
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.message = 'Please fill all mandatory fields correctly.';
      return;
    }

    this.rideService.addRide(this.form.value as any).subscribe({
      next: (result: any) => {
        if (result.error) {
          this.message = result.error;
        } else {
          this.message = 'Ride added successfully!';
          this.form.reset({ vehicleType: 'Bike', vacantSeats: 1 });
        }
      },
      error: err => {
        console.error(err);
        this.message = 'Failed to add ride.';
      }
    });
  }

}
