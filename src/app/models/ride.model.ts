export type VehicleType = 'Bike' | 'Car';

export interface Ride {
  id: string;                 // unique ride id
  creatorEmployeeId: string;  // employee who added the ride (unique per day)
  vehicleType: VehicleType;
  vehicleNo: string;
  vacantSeats: number;
  time: string;               // ISO time string (HH:mm)
  pickupPoint: string;
  destination: string;
  date: string;               // YYYY-MM-DD (current day only)
  bookedEmployeeIds: string[]; // employees who booked this ride
}