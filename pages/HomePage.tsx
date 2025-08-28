
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TravelOption, TravelType } from '../types';
import { getTravelOptions } from '../services/apiService';
import { FlightIcon, TrainIcon, BusIcon, CalendarIcon } from '../components/IconComponents';
import LoadingSpinner from '../components/LoadingSpinner';

// Helper component to avoid re-rendering issues
const TravelCard: React.FC<{ option: TravelOption }> = ({ option }) => {
    const getIcon = (type: TravelType) => {
        switch (type) {
            case TravelType.FLIGHT: return <FlightIcon className="h-6 w-6 text-blue-500" />;
            case TravelType.TRAIN: return <TrainIcon className="h-6 w-6 text-green-500" />;
            case TravelType.BUS: return <BusIcon className="h-6 w-6 text-yellow-500" />;
            default: return null;
        }
    };

    const duration = (new Date(option.arrivalTime).getTime() - new Date(option.departureTime).getTime()) / (1000 * 60 * 60);
    const isSoldOut = option.availableSeats === 0;

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full">
            <div className="p-6 flex-grow">
                <div className="flex items-center mb-4">
                    <img src={option.operatorLogo} alt={option.operator} className="h-10 w-10 rounded-full mr-4"/>
                    <div>
                        <p className="font-semibold text-gray-800 text-lg">{option.operator}</p>
                        <p className="text-sm text-gray-500">{option.type}</p>
                    </div>
                    <div className="ml-auto">{getIcon(option.type)}</div>
                </div>
                
                <div className="flex justify-between items-center my-4">
                    <div className="text-center">
                        <p className="font-bold text-xl text-gray-800">{new Date(option.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        <p className="text-sm text-gray-600">{option.source}</p>
                    </div>
                    <div className="text-center text-sm text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        {duration.toFixed(1)}h
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-xl text-gray-800">{new Date(option.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        <p className="text-sm text-gray-600">{option.destination}</p>
                    </div>
                </div>

                <div className="flex items-center text-gray-600 text-sm mt-4">
                    <CalendarIcon className="h-4 w-4 mr-2"/>
                    <span>{new Date(option.departureTime).toLocaleDateString()}</span>
                </div>
            </div>
            <div className="bg-gray-50 p-4 flex justify-between items-center">
                <div>
                    <p className="text-2xl font-bold text-indigo-600">${option.price.toFixed(2)}</p>
                    <p className={`text-xs ${isSoldOut ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                        {isSoldOut ? 'Sold Out' : `${option.availableSeats} seats left`}
                    </p>
                </div>
                <span className="text-sm font-semibold text-indigo-600">View Details &rarr;</span>
            </div>
        </div>
    );
};

const initialFilters = { id: '', type: '', source: '', destination: '', date: '', time: '', minPrice: '', maxPrice: '', minSeats: '' };

const HomePage: React.FC = () => {
    const [travelOptions, setTravelOptions] = useState<TravelOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState(initialFilters);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const data = await getTravelOptions();
                setTravelOptions(data);
            } catch (error) {
                console.error("Failed to fetch travel options:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOptions();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const filteredOptions = useMemo(() => {
        const minPrice = parseFloat(filters.minPrice);
        const maxPrice = parseFloat(filters.maxPrice);
        const minSeats = parseInt(filters.minSeats, 10);

        return travelOptions.filter(option => {
            const departureDateTime = new Date(option.departureTime);
            const departureDate = departureDateTime.toISOString().split('T')[0];
            const departureTime = departureDateTime.toTimeString().slice(0, 5); // HH:MM format

            const dateFilterMatch = !filters.date || departureDate === filters.date;
            // Time filter: show trips at or after the selected time
            const timeFilterMatch = !filters.time || departureTime >= filters.time;

            const minPriceMatch = isNaN(minPrice) || option.price >= minPrice;
            const maxPriceMatch = isNaN(maxPrice) || option.price <= maxPrice;
            const minSeatsMatch = isNaN(minSeats) || option.availableSeats >= minSeats;


            return (
                (!filters.id || option.id.toLowerCase().includes(filters.id.toLowerCase())) &&
                (!filters.type || option.type === filters.type) &&
                (!filters.source || option.source.toLowerCase().includes(filters.source.toLowerCase())) &&
                (!filters.destination || option.destination.toLowerCase().includes(filters.destination.toLowerCase())) &&
                dateFilterMatch &&
                timeFilterMatch &&
                minPriceMatch &&
                maxPriceMatch &&
                minSeatsMatch
            );
        });
    }, [travelOptions, filters]);

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Find your next trip</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input type="text" name="id" placeholder="Trip ID (e.g., F123)" className="p-2 border rounded" value={filters.id} onChange={handleFilterChange} />
                    <input type="text" name="source" placeholder="From" className="p-2 border rounded" value={filters.source} onChange={handleFilterChange} />
                    <input type="text" name="destination" placeholder="To" className="p-2 border rounded" value={filters.destination} onChange={handleFilterChange} />
                    <input type="date" name="date" className="p-2 border rounded" value={filters.date} onChange={handleFilterChange} />
                    <input type="time" name="time" className="p-2 border rounded" value={filters.time} onChange={handleFilterChange} />
                    <select name="type" className="p-2 border rounded bg-white" value={filters.type} onChange={handleFilterChange}>
                        <option value="">All Types</option>
                        <option value={TravelType.FLIGHT}>Flight</option>
                        <option value={TravelType.TRAIN}>Train</option>
                        <option value={TravelType.BUS}>Bus</option>
                    </select>
                    <input type="number" name="minPrice" placeholder="Min Price ($)" className="p-2 border rounded" value={filters.minPrice} onChange={handleFilterChange} min="0" />
                    <input type="number" name="maxPrice" placeholder="Max Price ($)" className="p-2 border rounded" value={filters.maxPrice} onChange={handleFilterChange} min="0" />
                    <input type="number" name="minSeats" placeholder="Min Seats" className="p-2 border rounded" value={filters.minSeats} onChange={handleFilterChange} min="0" />
                </div>
                <div className="flex justify-end mt-4">
                    <button
                        type="button"
                        onClick={() => setFilters(initialFilters)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(option => (
                           <Link to={`/travel/${option.id}`} key={option.id} className="block">
                                <TravelCard option={option} />
                           </Link>
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500">No travel options found matching your criteria.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default HomePage;
