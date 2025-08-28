
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/UserContext';

const ProfilePage: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    useEffect(() => {
        if (user) {
            setName(user.name);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || name === user.name) return;

        setIsUpdating(true);
        setMessage({ type: '', content: '' });

        try {
            await updateProfile(name);
            setMessage({ type: 'success', content: 'Profile updated successfully!' });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setMessage({ type: 'error', content: `Update failed: ${errorMessage}` });
        } finally {
            setIsUpdating(false);
        }
    };
    
    if (!user) {
        return <p>Loading user profile...</p>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                            Username / Login ID
                        </label>
                        <input
                            id="userId"
                            type="text"
                            value={user.id}
                            disabled
                            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-500 cursor-not-allowed"
                        />
                         <p className="mt-2 text-xs text-gray-500">Your login ID cannot be changed.</p>
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Display Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    {message.content && (
                        <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {message.content}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isUpdating || name === user.name}
                            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            {isUpdating && <div className="w-5 h-5 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;