import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Ride, VehicleType } from '../models/ride.model';

@Injectable({ providedIn: 'root' })
export class RideService {
  private apiUrl = 'http://localhost:3000/rides';

  constructor(private http: HttpClient) {}

  // Get all rides (today only)
  getRides(): Observable<Ride[]> {
    return this.http.get<Ride[]>(this.apiUrl).pipe(
      map(rides => {
        const today = this.today();
        return rides.filter(r => r.date === today);
      })
    );
  }

  // Add a new ride
  addRide(rideInput: Omit<Ride, 'id' | 'date' | 'bookedEmployeeIds'>): Observable<Ride> {
    const ride: Ride = {
      id: crypto.randomUUID(),
      date: this.today(),
      bookedEmployeeIds: [],
      ...rideInput
    };
    return this.http.post<Ride>(this.apiUrl, ride);
  }

  // Update ride (e.g., after booking)
  updateRide(ride: Ride): Observable<Ride> {
    return this.http.put<Ride>(`${this.apiUrl}/${ride.id}`, ride);
  }

  // Book a ride
  bookRide(ride: Ride, employeeId: string): Observable<Ride | { error: string }> {
    // Business rules
    if (ride.creatorEmployeeId === employeeId) {
      return new Observable(observer => {
        observer.next({ error: 'Employee cannot book their own ride.' });
        observer.complete();
      });
    }
    if (ride.bookedEmployeeIds.includes(employeeId)) {
      return new Observable(observer => {
        observer.next({ error: 'Employee has already booked this ride.' });
        observer.complete();
      });
    }
    if (ride.vacantSeats < 1) {
      return new Observable(observer => {
        observer.next({ error: 'No vacant seats available.' });
        observer.complete();
      });
    }

    // Update ride object
    ride.bookedEmployeeIds.push(employeeId);
    ride.vacantSeats -= 1;

    return this.updateRide(ride);
  }

  // Filter by vehicle type
  filterByVehicleType(type?: VehicleType): Observable<Ride[]> {
    return this.getRides().pipe(
      map(rides => type ? rides.filter(r => r.vehicleType === type) : rides)
    );
  }

  // Find rides within ±60 minutes
  findTimeMatchingRides(targetTime: string, type?: VehicleType): Observable<Ride[]> {
    return this.getRides().pipe(
      map(rides => {
        const target = this.toMinutes(targetTime);
        return rides.filter(r => {
          const t = this.toMinutes(r.time);
          const withinBuffer = Math.abs(t - target) <= 60;
          return withinBuffer && (!type || r.vehicleType === type);
        });
      })
    );
  }

  // Helpers
  private today(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}