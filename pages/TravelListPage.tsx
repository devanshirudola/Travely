
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TravelOption, TravelType } from '../types';
import { getTravelOptions } from '../services/apiService';
import { FlightIcon, TrainIcon, BusIcon } from '../components/IconComponents';
import LoadingSpinner from '../components/LoadingSpinner';

const initialFilters = { id: '', type: '', source: '', destination: '', date: '', time: '', minPrice: '', maxPrice: '', minSeats: '' };

const getIcon = (type: TravelType) => {
    switch (type) {
        case TravelType.FLIGHT: return <FlightIcon className="h-5 w-5 text-blue-500" />;
        case TravelType.TRAIN: return <TrainIcon className="h-5 w-5 text-green-500" />;
        case TravelType.BUS: return <BusIcon className="h-5 w-5 text-yellow-500" />;
        default: return null;
    }
};

const TravelListPage: React.FC = () => {
    const [travelOptions, setTravelOptions] = useState<TravelOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState(initialFilters);
    const navigate = useNavigate();

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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">All Travel Options</h1>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Options</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <input type="text" name="id" placeholder="Trip ID" className="p-2 border rounded" value={filters.id} onChange={handleFilterChange} />
                    <input type="text" name="source" placeholder="From" className="p-2 border rounded" value={filters.source} onChange={handleFilterChange} />
                    <input type="text" name="destination" placeholder="To" className="p-2 border rounded" value={filters.destination} onChange={handleFilterChange} />
                    <select name="type" className="p-2 border rounded bg-white" value={filters.type} onChange={handleFilterChange}>
                        <option value="">All Types</option>
                        <option value={TravelType.FLIGHT}>Flight</option>
                        <option value={TravelType.TRAIN}>Train</option>
                        <option value={TravelType.BUS}>Bus</option>
                    </select>
                    <input type="date" name="date" className="p-2 border rounded" value={filters.date} onChange={handleFilterChange} />
                    <input type="time" name="time" className="p-2 border rounded" value={filters.time} onChange={handleFilterChange} />
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
                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats Left</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map(option => (
                                    <tr key={option.id} className="hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => navigate(`/travel/${option.id}`)}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 hover:underline">{option.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                {getIcon(option.type)}
                                                <span className="ml-2">{option.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{option.source}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{option.destination}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(option.departureTime).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(option.arrivalTime).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">${option.price.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                option.availableSeats > 20 ? 'bg-green-100 text-green-800' :
                                                option.availableSeats > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {option.availableSeats}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        No travel options found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TravelListPage;
