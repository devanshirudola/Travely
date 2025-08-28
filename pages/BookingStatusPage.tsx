
import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { getBookingById } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { CalendarIcon, LocationMarkerIcon } from '../components/IconComponents';

const BookingDetailsCard: React.FC<{ booking: Booking }> = ({ booking }) => {
    const isCancelled = booking.status === BookingStatus.CANCELLED;
    const isPast = new Date(booking.travelOption.departureTime) < new Date();
    
    let statusText: string = booking.status;
    let statusBgColor = 'bg-green-100 text-green-800';
    let statusBorderColor = 'border-green-500';

    if (isCancelled) {
        statusText = 'Cancelled';
        statusBgColor = 'bg-red-100 text-red-800';
        statusBorderColor = 'border-red-500';
    } else if (isPast) {
        statusText = 'Completed';
        statusBgColor = 'bg-blue-100 text-blue-800';
        statusBorderColor = 'border-blue-500';
    }

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-8 w-full animate-fade-in">
             <div className={`p-4 border-l-4 ${statusBorderColor}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg text-gray-800">{booking.travelOption.operator} ({booking.travelOption.type})</p>
                        <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusBgColor}`}>
                        {statusText}
                    </span>
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-center text-gray-700 mb-2">
                    <LocationMarkerIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{booking.travelOption.source} to {booking.travelOption.destination}</span>
                </div>
                <div className="flex items-center text-gray-700">
                    <CalendarIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{new Date(booking.travelOption.departureTime).toLocaleString()}</span>
                </div>
                <div className="border-t my-4"></div>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-600">{booking.seats} Seat(s)</p>
                        <p className="font-bold text-xl text-indigo-600">${booking.totalPrice.toFixed(2)}</p>
                    </div>
                     <p className="text-sm text-gray-500">Booked on: {new Date(booking.bookingTime).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
};


const BookingStatusPage: React.FC = () => {
    const [bookingId, setBookingId] = useState('');
    const [booking, setBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setBooking(null);
        if (!bookingId.trim()) {
            setError('Please enter a booking ID.');
            return;
        }
        setIsLoading(true);
        try {
            const data = await getBookingById(bookingId);
            setBooking(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Check Your Booking Status
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your booking ID to view the latest status of your trip.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="bookingId" className="sr-only">Booking ID</label>
                            <input
                                id="bookingId"
                                name="bookingId"
                                type="text"
                                required
                                value={bookingId}
                                onChange={(e) => setBookingId(e.target.value)}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="e.g., BK001"
                                aria-label="Booking ID"
                            />
                        </div>
                        
                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                            >
                                {isLoading ? 'Checking...' : 'Check Status'}
                            </button>
                        </div>
                    </form>
                </div>

                {isLoading && <LoadingSpinner message="Fetching booking details..." />}
                
                {booking && <BookingDetailsCard booking={booking} />}

            </div>
        </div>
    );
};

export default BookingStatusPage;
