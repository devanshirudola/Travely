
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Booking, BookingStatus } from '../types';
import { getBookings, cancelBooking } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { CalendarIcon, LocationMarkerIcon } from '../components/IconComponents';
import { useAuth } from '../contexts/UserContext';
import Modal from '../components/Modal';

// Helper component to avoid re-rendering issues
const BookingCard: React.FC<{ booking: Booking, onCancel: (bookingId: string) => void, isCancellable: boolean }> = ({ booking, onCancel, isCancellable }) => {
    const isCancelled = booking.status === BookingStatus.CANCELLED;
    const isPast = new Date(booking.travelOption.departureTime) < new Date();
    
    // FIX: Explicitly type statusText as string to allow for "Completed" status, which is not in BookingStatus enum.
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
        <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${isCancelled || isPast ? 'opacity-70' : ''}`}>
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
                    {isCancellable && (
                        <button
                            onClick={() => onCancel(booking.id)}
                            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


const MyBookingsPage: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    
    const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');
    
    // State for cancellation modal
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancellationMessage, setCancellationMessage] = useState('');

    const fetchBookings = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getBookings(user.id);
            setBookings(data);
        } catch (err) {
            setError('Failed to fetch bookings.');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const { currentBookings, pastBookings } = useMemo(() => {
        const now = new Date();
        const current: Booking[] = [];
        const past: Booking[] = [];

        bookings.forEach(booking => {
            const departureTime = new Date(booking.travelOption.departureTime);
            if (booking.status === BookingStatus.CANCELLED || departureTime < now) {
                past.push(booking);
            } else {
                current.push(booking);
            }
        });
        return { currentBookings: current, pastBookings: past };
    }, [bookings]);

    const openCancelConfirmation = (bookingId: string) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            setBookingToCancel(booking);
            setCancellationMessage('');
            setIsCancelModalOpen(true);
        }
    };
    
    const closeCancelModal = () => {
        setIsCancelModalOpen(false);
        setTimeout(() => {
            setBookingToCancel(null);
            setIsCancelling(false);
            setCancellationMessage('');
        }, 300); // Delay to allow for modal closing animation
    };

    const handleConfirmCancel = async () => {
        if (!bookingToCancel || !user) return;

        setIsCancelling(true);
        setCancellationMessage('');
        const originalBookings = bookings; // Store state for rollback

        // Optimistically update the UI
        setBookings(prevBookings =>
            prevBookings.map(b =>
                b.id === bookingToCancel.id
                    ? { ...b, status: BookingStatus.CANCELLED }
                    : b
            )
        );

        try {
            await cancelBooking(bookingToCancel.id, user.id);
            setCancellationMessage('Booking cancelled successfully. Seats restored.');
            // On success, close the modal after a short delay
            setTimeout(() => {
                closeCancelModal();
            }, 1500);
        } catch (err) {
            // On failure, revert the UI change and show an error
            setBookings(originalBookings);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setCancellationMessage(`Cancellation failed: ${errorMessage}`);
            setIsCancelling(false); // Re-enable button
        }
    };


    if (isLoading) {
        return <LoadingSpinner message="Fetching your bookings..." />;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    const renderBookingsList = (list: Booking[], type: 'current' | 'past') => {
        if (list.length === 0) {
            const message = type === 'current' 
                ? "You have no upcoming trips. Time to explore!" 
                : "You have no past bookings.";
            return (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
                </div>
            );
        }
        return (
             <div className="space-y-6">
                {list.map(booking => (
                    <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        onCancel={openCancelConfirmation}
                        isCancellable={type === 'current'}
                    />
                ))}
            </div>
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bookings</h1>
            
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('current')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'current'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Current ({currentBookings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'past'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Past ({pastBookings.length})
                    </button>
                </nav>
            </div>
            
            <div>
                {activeTab === 'current' && renderBookingsList(currentBookings, 'current')}
                {activeTab === 'past' && renderBookingsList(pastBookings, 'past')}
            </div>


            <Modal isOpen={isCancelModalOpen} onClose={closeCancelModal} title="Confirm Cancellation">
                {bookingToCancel && (
                    <div>
                        <p className="text-gray-700">Are you sure you want to cancel your booking for:</p>
                        <div className="my-3 p-3 bg-gray-50 rounded-md border">
                            <p className="font-semibold text-gray-800">{bookingToCancel.travelOption.source}</p>
                            <p className="text-sm text-gray-500 my-1">to</p>
                            <p className="font-semibold text-gray-800">{bookingToCancel.travelOption.destination}</p>
                            <div className="flex items-center text-xs text-gray-600 mt-2 pt-2 border-t">
                                <CalendarIcon className="h-4 w-4 mr-2"/>
                                <span>{new Date(bookingToCancel.travelOption.departureTime).toLocaleString()}</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">This action cannot be undone. Seats will be released and a refund of <span className="font-bold">${bookingToCancel.totalPrice.toFixed(2)}</span> will be processed based on the cancellation policy.</p>
                        
                        {cancellationMessage && (
                            <div className={`p-3 rounded-md my-4 text-sm ${cancellationMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {cancellationMessage}
                            </div>
                        )}

                        <div className="flex justify-end space-x-4 mt-6">
                            <button 
                                onClick={closeCancelModal} 
                                disabled={isCancelling} 
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                            >
                                Go Back
                            </button>
                            <button 
                                onClick={handleConfirmCancel} 
                                disabled={isCancelling} 
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 flex items-center justify-center min-w-[120px] transition-colors"
                            >
                                {isCancelling && <div className="w-5 h-5 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                                {isCancelling ? 'Cancelling...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MyBookingsPage;
