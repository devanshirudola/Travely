
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { TravelOption, TravelType } from '../types';
import { getTravelOptionById } from '../services/apiService';
import { FlightIcon, TrainIcon, BusIcon, CalendarIcon, ClockIcon, SeatIcon, BaggageIcon, InfoIcon } from '../components/IconComponents';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/UserContext';

const getIcon = (type: TravelType) => {
    switch (type) {
        case TravelType.FLIGHT: return <FlightIcon className="h-8 w-8 text-blue-500" />;
        case TravelType.TRAIN: return <TrainIcon className="h-8 w-8 text-green-500" />;
        case TravelType.BUS: return <BusIcon className="h-8 w-8 text-yellow-500" />;
        default: return null;
    }
};

const TravelDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [option, setOption] = useState<TravelOption | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOption = async () => {
            if (!id) {
                setError("No travel ID provided.");
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                const data = await getTravelOptionById(id);
                setOption(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchOption();
    }, [id]);

    const handleBookNowClick = () => {
        if (!user) {
            navigate('/login', { state: { from: { pathname: `/travel/${id}` } } });
        } else {
            navigate(`/book/${id}`);
        }
    };
    
    if (isLoading) return <LoadingSpinner message="Loading travel details..." />;
    if (error) return <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>;
    if (!option) return <div className="text-center text-gray-500">Travel option not found.</div>;

    const duration = (new Date(option.arrivalTime).getTime() - new Date(option.departureTime).getTime()) / (1000 * 60); // in minutes
    const durationHours = Math.floor(duration / 60);
    const durationMinutes = duration % 60;
    const isSoldOut = option.availableSeats === 0;

    return (
        <div>
            <div className="mb-4">
                 <Link to="/travel-list" className="text-indigo-600 hover:underline">&larr; Back to all travel options</Link>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                        <div className="flex items-center mb-4 sm:mb-0">
                            <img src={option.operatorLogo} alt={option.operator} className="h-16 w-16 rounded-full mr-4"/>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">{option.operator}</h1>
                                <p className="text-lg text-gray-500">{option.type} &middot; Trip ID: {option.id}</p>
                            </div>
                        </div>
                        {getIcon(option.type)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8 text-center">
                        <div>
                            <p className="text-sm text-gray-500">From</p>
                            <p className="font-bold text-2xl text-gray-800">{option.source}</p>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="w-full border-t border-gray-300"></div>
                            <div className="mx-4 text-gray-500 flex flex-col items-center">
                                <ClockIcon className="h-5 w-5 mb-1" />
                                <span className="text-sm">{durationHours}h {durationMinutes}m</span>
                            </div>
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">To</p>
                            <p className="font-bold text-2xl text-gray-800">{option.destination}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border">
                        <div className="flex items-start">
                            <CalendarIcon className="h-6 w-6 mr-3 text-indigo-500 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-gray-700">Departure</h3>
                                <p className="text-gray-600">{new Date(option.departureTime).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                             <CalendarIcon className="h-6 w-6 mr-3 text-indigo-500 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-gray-700">Arrival</h3>
                                <p className="text-gray-600">{new Date(option.arrivalTime).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-lg border">
                            <div className="flex items-start">
                                <SeatIcon className="h-7 w-7 mr-4 text-indigo-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-700">Seat Type</h3>
                                    <p className="text-gray-600">{option.seatType}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <BaggageIcon className="h-7 w-7 mr-4 text-indigo-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-700">Baggage Allowance</h3>
                                    <p className="text-gray-600">{option.baggageAllowance}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <InfoIcon className="h-7 w-7 mr-4 text-indigo-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-700">Cancellation Policy</h3>
                                    <p className="text-gray-600">{option.cancellationPolicy}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Route Map</h2>
                        <div className="bg-gray-200 rounded-lg overflow-hidden border">
                            <img 
                                src={`https://picsum.photos/seed/${encodeURIComponent(option.id)}/1200/400`}
                                alt={`Map from ${option.source} to ${option.destination}`}
                                className="w-full h-48 sm:h-64 object-cover"
                            />
                            <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">Map visualization is for illustrative purposes only.</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-100 p-6 flex flex-col sm:flex-row justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-600">Price per seat</p>
                        <p className="text-4xl font-extrabold text-indigo-600">${option.price.toFixed(2)}</p>
                         <p className={`mt-1 text-sm ${isSoldOut ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                            {isSoldOut ? 'Sold Out' : `${option.availableSeats} of ${option.totalSeats} seats available`}
                        </p>
                    </div>
                    <button
                        onClick={handleBookNowClick}
                        disabled={isSoldOut}
                        className="mt-4 sm:mt-0 w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                        {isSoldOut ? 'Sold Out' : 'Book Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TravelDetailPage;
