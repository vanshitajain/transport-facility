import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { Ride, VehicleType, Booking } from '../models/ride.model';

@Injectable({ providedIn: 'root' })
export class RideService {
  private RIDES_KEY = 'rides';
  private BOOKINGS_KEY = 'bookings';

  constructor(private http: HttpClient) {
    this.initializeData();
  }

  private initializeData() {
    if (!localStorage.getItem(this.RIDES_KEY) || !localStorage.getItem(this.BOOKINGS_KEY)) {
      this.http.get<any>('assets/db.json').subscribe({
        next: (data) => {
          if (!localStorage.getItem(this.RIDES_KEY)) {
            localStorage.setItem(this.RIDES_KEY, JSON.stringify(data.rides || []));
          }
          if (!localStorage.getItem(this.BOOKINGS_KEY)) {
            localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(data.bookings || []));
          }
        },
        error: (err) => {
          console.error('Failed to load seed data', err);
          if (!localStorage.getItem(this.RIDES_KEY)) localStorage.setItem(this.RIDES_KEY, '[]');
          if (!localStorage.getItem(this.BOOKINGS_KEY)) localStorage.setItem(this.BOOKINGS_KEY, '[]');
        }
      });
    }
  }

  getRides(): Observable<Ride[]> {
    return new Observable(observer => {
      const ridesStr = localStorage.getItem(this.RIDES_KEY);
      if (ridesStr) {
         const rides = JSON.parse(ridesStr);
         const today = this.today();
         observer.next(rides.filter((r: Ride) => r.date === today));
         observer.complete();
      } else {
         this.http.get<any>('assets/db.json').subscribe(data => {
            localStorage.setItem(this.RIDES_KEY, JSON.stringify(data.rides || []));
            localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(data.bookings || []));
            const today = this.today();
            observer.next(data.rides.filter((r: Ride) => r.date === today));
            observer.complete();
         });
      }
    });
  }

  getBookings(): Observable<Booking[]> {
    return new Observable(observer => {
      const bookings = JSON.parse(localStorage.getItem(this.BOOKINGS_KEY) || '[]');
      observer.next(bookings);
      observer.complete();
    });
  }

  addRide(rideInput: Omit<Ride, 'id' | 'date' | 'bookedEmployeeIds'>): Observable<Ride | { error: string }> {
    return this.getRides().pipe(
      switchMap(rides => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const rideMinutes = this.toMinutes(rideInput.time);

        if (rideMinutes <= currentMinutes) {
           return new Observable< { error: string } >(observer => {
            observer.next({ error: 'You cannot add a ride for a past time.' });
            observer.complete();
          });
        }

        const conflict = rides.find(r => 
          r.creatorEmployeeId === rideInput.creatorEmployeeId && 
          r.time === rideInput.time 
        );
        
        if (conflict) {
           return new Observable< { error: string } >(observer => {
            observer.next({ error: 'You have already offered a ride at this time.' });
            observer.complete();
          });
        }

        const ride: Ride = {
          id: crypto.randomUUID(),
          date: this.today(),
          bookedEmployeeIds: [],
          ...rideInput
        };

        const allRides = JSON.parse(localStorage.getItem(this.RIDES_KEY) || '[]');
        allRides.push(ride);
        localStorage.setItem(this.RIDES_KEY, JSON.stringify(allRides));

        return new Observable<Ride>(obs => {
          obs.next(ride);
          obs.complete();
        });
      })
    );
  }

  updateRide(ride: Ride): Observable<Ride> {
    return new Observable(obs => {
      const allRides = JSON.parse(localStorage.getItem(this.RIDES_KEY) || '[]');
      const index = allRides.findIndex((r: Ride) => r.id === ride.id);
      if (index !== -1) {
        allRides[index] = ride;
        localStorage.setItem(this.RIDES_KEY, JSON.stringify(allRides));
        obs.next(ride);
      } else {
        obs.error('Ride not found');
      }
      obs.complete();
    });
  }

  bookRide(ride: Ride, passengerId: string): Observable<Booking | { error: string }> {
    if (ride.creatorEmployeeId === passengerId) {
      return this.error('You cannot book your own ride.');
    }
    
    if (ride.vacantSeats < 1) {
      return this.error('No vacant seats available.');
    }

    return new Observable<Booking[]>(obs => {
      const allBookings = JSON.parse(localStorage.getItem(this.BOOKINGS_KEY) || '[]');
      const userBookings = allBookings.filter((b: Booking) => b.passengerEmployeeId === passengerId);
      obs.next(userBookings);
      obs.complete();
    }).pipe(
      switchMap(userBookings => {
        const alreadyBooked = userBookings.some(b => b.rideId === ride.id);
        if (alreadyBooked) {
          return this.error('You have already booked this ride.');
        }

        if (userBookings.length > 0) {
           const bookedRideIds = userBookings.map(b => b.rideId);
           
           return this.getRides().pipe(
             switchMap(allRides => {
               const userBookedRides = allRides.filter(r => bookedRideIds.includes(r.id));
               const rideTimeMins = this.toMinutes(ride.time);
               
               const overlappingRide = userBookedRides.find(bookedRide => {
                 const bookedTimeMins = this.toMinutes(bookedRide.time);
                 return Math.abs(bookedTimeMins - rideTimeMins) <= 60;
               });

               if (overlappingRide) {
                 return this.error(`You already have a booking for ${overlappingRide.time} which overlaps with this ride.`);
               }
               return this.processBooking(ride, passengerId);
             })
           );
        }

        return this.processBooking(ride, passengerId);
      })
    );
  }

  private processBooking(ride: Ride, passengerId: string): Observable<Booking> {
         const booking: Booking = {
          id: crypto.randomUUID(),
          rideId: ride.id,
          passengerEmployeeId: passengerId,
          date: this.today()
        };

        const updatedRide = { 
          ...ride, 
          vacantSeats: ride.vacantSeats - 1,
          bookedEmployeeIds: [...(ride.bookedEmployeeIds || []), passengerId]
        };

        return this.updateRide(updatedRide).pipe(
          switchMap(() => {
             return new Observable<Booking>(obs => {
                const allBookings = JSON.parse(localStorage.getItem(this.BOOKINGS_KEY) || '[]');
                allBookings.push(booking);
                localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(allBookings));
                obs.next(booking);
                obs.complete();
             });
          })
        );
  }

  searchRides(pickup: string, destination: string, time: string, type?: VehicleType): Observable<Ride[]> {
    return this.getRides().pipe(
      map(rides => {
        const targetTime = this.toMinutes(time);
        
        return rides.filter(r => {
          if (r.vacantSeats <= 0) return false;

          if (type && r.vehicleType !== type) return false;

          const matchPickup = r.pickupPoint.toLowerCase().includes(pickup.toLowerCase());
          const matchDest = r.destination.toLowerCase().includes(destination.toLowerCase());
          if (!matchPickup || !matchDest) return false;
          
          return true;
        });
      })
    );
  }

  filterByVehicleType(type?: VehicleType): Observable<Ride[]> {
    return this.getRides().pipe(
      map(rides => type ? rides.filter(r => r.vehicleType === type) : rides)
    );
  }

  private error(msg: string): Observable<{ error: string }> {
    return new Observable(obs => {
      obs.next({ error: msg });
      obs.complete();
    });
  }

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