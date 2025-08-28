
import { TravelOption, Booking, TravelType, BookingStatus } from '../types';

// Mock Data
let mockTravelOptions: TravelOption[] = [
  {
    id: 'F123',
    type: TravelType.FLIGHT,
    source: 'New York (JFK)',
    destination: 'Los Angeles (LAX)',
    departureTime: new Date('2024-09-10T09:00:00Z'),
    arrivalTime: new Date('2024-09-10T12:00:00Z'),
    price: 350.0,
    totalSeats: 180,
    availableSeats: 120,
    operator: 'Delta Airlines',
    operatorLogo: 'https://picsum.photos/seed/delta/40/40',
    seatType: 'Economy',
    baggageAllowance: '1 carry-on, 1 checked bag',
    cancellationPolicy: 'Full refund 24h before departure.',
  },
  {
    id: 'T456',
    type: TravelType.TRAIN,
    source: 'Washington D.C.',
    destination: 'New York (PENN)',
    departureTime: new Date('2024-09-12T14:30:00Z'),
    arrivalTime: new Date('2024-09-12T18:00:00Z'),
    price: 120.5,
    totalSeats: 300,
    availableSeats: 85,
    operator: 'Amtrak',
    operatorLogo: 'https://picsum.photos/seed/amtrak/40/40',
    seatType: 'Coach Class',
    baggageAllowance: '2 carry-ons, 2 personal items',
    cancellationPolicy: 'Full refund 48h before departure.',
  },
  {
    id: 'B789',
    type: TravelType.BUS,
    source: 'Boston',
    destination: 'New York (PABT)',
    departureTime: new Date('2024-09-11T08:00:00Z'),
    arrivalTime: new Date('2024-09-11T12:30:00Z'),
    price: 45.0,
    totalSeats: 50,
    availableSeats: 2,
    operator: 'Greyhound',
    operatorLogo: 'https://picsum.photos/seed/greyhound/40/40',
    seatType: 'Standard Seat',
    baggageAllowance: '1 carry-on, 1 checked bag',
    cancellationPolicy: 'Non-refundable.',
  },
  {
    id: 'F234',
    type: TravelType.FLIGHT,
    source: 'Chicago (ORD)',
    destination: 'San Francisco (SFO)',
    departureTime: new Date('2024-09-15T11:00:00Z'),
    arrivalTime: new Date('2024-09-15T13:30:00Z'),
    price: 410.0,
    totalSeats: 220,
    availableSeats: 50,
    operator: 'United Airlines',
    operatorLogo: 'https://picsum.photos/seed/united/40/40',
    seatType: 'Economy Plus',
    baggageAllowance: '1 carry-on',
    cancellationPolicy: 'Fee applies for cancellations.',
  },
  {
    id: 'F999',
    type: TravelType.FLIGHT,
    source: 'Miami (MIA)',
    destination: 'Atlanta (ATL)',
    departureTime: new Date('2024-09-20T18:00:00Z'),
    arrivalTime: new Date('2024-09-20T20:00:00Z'),
    price: 180.0,
    totalSeats: 150,
    availableSeats: 0, // This one is sold out
    operator: 'Spirit Airlines',
    operatorLogo: 'https://picsum.photos/seed/spirit/40/40',
    seatType: 'Standard',
    baggageAllowance: 'Charges for all bags',
    cancellationPolicy: 'Non-refundable.',
  },
  {
    id: 'T567',
    type: TravelType.TRAIN,
    source: 'Los Angeles (LAX)',
    destination: 'San Diego',
    departureTime: new Date('2024-09-13T10:00:00Z'),
    arrivalTime: new Date('2024-09-13T12:45:00Z'),
    price: 35.0,
    totalSeats: 250,
    availableSeats: 200,
    operator: 'Pacific Surfliner',
    operatorLogo: 'https://picsum.photos/seed/surfliner/40/40',
    seatType: 'Business Class',
    baggageAllowance: '2 carry-ons',
    cancellationPolicy: 'Full refund up to departure.',
  },
];

let mockBookings: Booking[] = [
    {
        id: 'BK001',
        userId: 'user123',
        travelOption: mockTravelOptions[1],
        seats: 2,
        totalPrice: mockTravelOptions[1].price * 2,
        status: BookingStatus.CONFIRMED,
        bookingTime: new Date('2024-07-20T10:00:00Z'),
    },
    {
        id: 'BK002',
        userId: 'alice',
        travelOption: mockTravelOptions[0],
        seats: 1,
        totalPrice: mockTravelOptions[0].price,
        status: BookingStatus.CONFIRMED,
        bookingTime: new Date('2024-07-22T15:30:00Z'),
    },
];

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getTravelOptions = async (): Promise<TravelOption[]> => {
  await simulateDelay(500);
  return [...mockTravelOptions];
};

export const getTravelOptionById = async (id: string): Promise<TravelOption> => {
    await simulateDelay(300);
    const option = mockTravelOptions.find(t => t.id === id);
    if (!option) {
        throw new Error('Travel option not found.');
    }
    return { ...option };
};

export const getBookings = async (userId: string): Promise<Booking[]> => {
  await simulateDelay(500);
  if (!userId) {
      return [];
  }
  return [...mockBookings.filter(b => b.userId === userId)].sort((a, b) => b.bookingTime.getTime() - a.bookingTime.getTime());
};

export const createBooking = async (userId: string, travelId: string, seats: number): Promise<Booking> => {
    await simulateDelay(1000);
    if (!userId) {
        throw new Error('User must be logged in to book.');
    }
    const travelOption = mockTravelOptions.find(t => t.id === travelId);
    if (!travelOption) {
        throw new Error('Travel option not found.');
    }
    if (travelOption.availableSeats < seats) {
        throw new Error('Not enough seats available.');
    }

    travelOption.availableSeats -= seats;
    const newBooking: Booking = {
        id: `BK${Date.now()}`,
        userId,
        travelOption,
        seats,
        totalPrice: travelOption.price * seats,
        status: BookingStatus.CONFIRMED,
        bookingTime: new Date(),
    };
    mockBookings.push(newBooking);
    return newBooking;
};

export const getBookingById = async (bookingId: string): Promise<Booking> => {
    await simulateDelay(600);
    const booking = mockBookings.find(b => b.id.toLowerCase() === bookingId.toLowerCase());
    if (!booking) {
        throw new Error('Booking with that ID not found.');
    }
    return { ...booking };
};

export const cancelBooking = async (bookingId: string, userId: string): Promise<Booking> => {
    await simulateDelay(700);
    const bookingIndex = mockBookings.findIndex(b => b.id === bookingId && b.userId === userId);
    if (bookingIndex === -1) {
        throw new Error('Booking not found or you do not have permission to cancel it.');
    }
    const booking = mockBookings[bookingIndex];
    if (booking.status === BookingStatus.CANCELLED) {
        throw new Error('Booking already cancelled.');
    }

    const travelOption = mockTravelOptions.find(t => t.id === booking.travelOption.id);
    if (travelOption) {
        // CRITICAL: Restore the seats to the available pool upon cancellation.
        travelOption.availableSeats += booking.seats;
    }

    booking.status = BookingStatus.CANCELLED;
    return booking;
};