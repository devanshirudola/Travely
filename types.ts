
export enum TravelType {
  FLIGHT = 'Flight',
  TRAIN = 'Train',
  BUS = 'Bus',
}

export enum BookingStatus {
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
}

export interface TravelOption {
  id: string;
  type: TravelType;
  source: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  price: number;
  totalSeats: number;
  availableSeats: number;
  operator: string;
  operatorLogo: string;
  seatType: string;
  baggageAllowance: string;
  cancellationPolicy: string;
}

export interface Booking {
  id: string;
  userId: string;
  travelOption: TravelOption;
  seats: number;
  totalPrice: number;
  status: BookingStatus;
  bookingTime: Date;
}