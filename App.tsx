
import React from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MyBookingsPage from './pages/MyBookingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import TravelListPage from './pages/TravelListPage';
import TravelDetailPage from './pages/TravelDetailPage';
import BookPage from './pages/BookPage';
import BookingStatusPage from './pages/BookingStatusPage';
import { UserIcon } from './components/IconComponents';
import { AuthProvider, useAuth } from './contexts/UserContext';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <header className="bg-white shadow-md sticky top-0 z-50">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                            Travely
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                                Explore
                            </Link>
                            <Link to="/travel-list" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                                Travel List
                            </Link>
                            <Link to="/bookings" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                                My Bookings
                            </Link>
                             <Link to="/booking-status" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                                Booking Status
                            </Link>
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-700 hidden sm:inline">Hi, {user.name}!</span>
                                    <Link to="/profile" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
                                        Profile
                                    </Link>
                                    <button onClick={handleLogout} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className="flex items-center text-gray-600 hover:text-indigo-600">
                                    <UserIcon className="h-6 w-6" />
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>
            </header>
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/travel-list" element={<TravelListPage />} />
                    <Route path="/travel/:id" element={<TravelDetailPage />} />
                    <Route path="/booking-status" element={<BookingStatusPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route 
                        path="/bookings" 
                        element={
                            <ProtectedRoute>
                                <MyBookingsPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/profile" 
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/book/:id" 
                        element={
                            <ProtectedRoute>
                                <BookPage />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </main>
            <footer className="bg-white border-t mt-8">
                <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                    &copy; 2024 Travely. All rights reserved.
                </div>
            </footer>
        </div>
    );
};


const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HashRouter>
  );
};

export default App;