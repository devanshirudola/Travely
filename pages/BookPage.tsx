
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { TravelOption } from '../types';
import { getTravelOptionById, createBooking } from '../services/apiService';
import { useAuth } from '../contexts/UserContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { CalendarIcon, ClockIcon } from '../components/IconComponents';

const BookPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [option, setOption] = useState<TravelOption | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [seats, setSeats] = useState(1);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingMessage, setBookingMessage] = useState({ type: '', content: '' });

    useEffect(() => {
        const fetchOption = async () => {
            if (!id) {
                setError("No travel ID provided.");
                setIsLoading(false);
                return;
            }
            try {
                const data = await getTravelOptionById(id);
                setOption(data);
                 if (data.availableSeats === 0) {
                    setError("This trip is sold out.");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchOption();
    }, [id]);

    const handleSeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!option) return;
        const requestedSeats = parseInt(e.target.value, 10) || 1;
        setSeats(Math.max(1, Math.min(requestedSeats, option.availableSeats)));
    };

    const handleSubmitBooking = async () => {
        if (!option || !user || isBooking) return;
        setIsBooking(true);
        setBookingMessage({ type: '', content: '' });

        try {
            await createBooking(user.id, option.id, seats);
            setBookingMessage({ type: 'success', content: 'Booking successful! You will be redirected to your bookings page shortly.' });
            setTimeout(() => {
                navigate('/bookings');
            }, 2500);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setBookingMessage({ type: 'error', content: `Booking failed: ${errorMessage}` });
            setIsBooking(false);
            if (errorMessage.includes('Not enough seats available')) {
                const updatedOption = await getTravelOptionById(option.id);
                setOption(updatedOption);
            }
        }
    };

    if (isLoading) return <LoadingSpinner message="Loading booking details..." />;
    if (error) return (
        <div className="text-center">
            <p className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</p>
            <Link to={`/travel/${id}`} className="mt-4 inline-block text-indigo-600 hover:underline">&larr; Go back to trip details</Link>
        </div>
    );
    if (!option) return <div className="text-center text-gray-500">Travel option not found.</div>;

    const totalPrice = (option.price * seats).toFixed(2);
    const isSoldOut = option.availableSeats === 0;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Confirm Your Booking</h1>
            <p className="text-gray-500 mb-6">Review the details and confirm your trip.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left side: Trip Summary */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Trip Summary</h2>
                    <div className="flex items-center mb-4">
                        <img src={option.operatorLogo} alt={option.operator} className="h-12 w-12 rounded-full mr-4"/>
                        <div>
                            <p className="font-semibold text-gray-800">{option.operator}</p>
                            <p className="text-sm text-gray-500">{option.type} &middot; Trip ID: {option.id}</p>
                        </div>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                        <p><span className="font-semibold">From:</span> {option.source}</p>
                        <p><span className="font-semibold">To:</span> {option.destination}</p>
                        <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{new Date(option.departureTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{new Date(option.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &rarr; {new Date(option.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>

                {/* Right side: Booking Form */}
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                     <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Your Order</h2>
                     <div className="space-y-4 flex-grow">
                        <div>
                            <label htmlFor="seats" className="block text-sm font-medium text-gray-700">
                                Seats ({option.availableSeats} available)
                            </label>
                            <input
                                type="number"
                                id="seats"
                                value={seats}
                                onChange={handleSeatChange}
                                min="1"
                                max={option.availableSeats}
                                disabled={isSoldOut || isBooking}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Price per seat:</span>
                            <span className="font-medium text-gray-800">${option.price.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-4 mt-4 flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">Total Price:</span>
                            <span className="text-2xl font-extrabold text-indigo-600">${totalPrice}</span>
                        </div>
                     </div>
                     <div className="mt-6">
                        {bookingMessage.content && (
                            <div className={`p-3 rounded-md mb-4 text-sm text-center ${bookingMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {bookingMessage.content}
                            </div>
                        )}
                        <button
                            onClick={handleSubmitBooking}
                            disabled={isSoldOut || isBooking || bookingMessage.type === 'success'}
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isBooking && <div className="w-5 h-5 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                            {isBooking ? 'Processing...' : 'Confirm & Book'}
                        </button>
                     </div>
                </div>
            </div>
            <div className="mt-6 text-center">
                <Link to={`/travel/${id}`} className="text-sm text-indigo-600 hover:underline">
                    &larr; Back to trip details
                </Link>
            </div>
        </div>
    );
};

export default BookPage;
