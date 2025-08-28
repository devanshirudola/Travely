
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, login as apiLogin, logout as apiLogout, getCurrentUser, register as apiRegister, updateProfile as apiUpdateProfile } from '../services/authService';

interface AuthContextType {
    user: User | null;
    login: (username: string) => Promise<void>;
    register: (username: string) => Promise<void>;
    logout: () => void;
    updateProfile: (newName: string) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string) => {
        const loggedInUser = await apiLogin(username);
        setUser(loggedInUser);
    };

    const register = async (username: string) => {
        const newUser = await apiRegister(username);
        setUser(newUser);
    };

    const logout = () => {
        apiLogout();
        setUser(null);
    };

    const updateProfile = async (newName: string) => {
        if (!user) {
            throw new Error("You must be logged in to update your profile.");
        }
        const updatedUser = await apiUpdateProfile(user.id, newName);
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isLoading }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};