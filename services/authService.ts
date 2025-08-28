
export interface User {
    id: string; // The login identifier, non-changeable
    name: string; // The display name, changeable
}

const USER_KEY = 'travely_user';

// Mock user database
const mockUsers: User[] = [
    { id: 'user123', name: 'user123' },
    { id: 'alice', name: 'alice' },
];

const findUserById = (userId: string): User | undefined => {
    return mockUsers.find(u => u.id === userId.toLowerCase());
};

export const login = async (username: string): Promise<User> => {
    // Simulate API call
    await new Promise(res => setTimeout(res, 500));
    const user = findUserById(username);
    if (!user) {
        throw new Error('Invalid username.');
    }
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
};

export const register = async (username: string): Promise<User> => {
    // Simulate API call
    await new Promise(res => setTimeout(res, 500));
    if (!username) {
        throw new Error('Username cannot be empty.');
    }
    if (findUserById(username)) {
        throw new Error('Username already exists.');
    }
    const newUser: User = { id: username.toLowerCase(), name: username };
    mockUsers.push(newUser);
    // Log the user in immediately after registration
    sessionStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return newUser;
};

export const updateProfile = async (userId: string, newName: string): Promise<User> => {
    await new Promise(res => setTimeout(res, 600));
    if (!newName.trim()) {
        throw new Error("Name cannot be empty.");
    }
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error("User not found.");
    }

    mockUsers[userIndex].name = newName;
    const updatedUser = mockUsers[userIndex];
    
    // Update session storage as well
    sessionStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

    return updatedUser;
};


export const logout = (): void => {
    sessionStorage.removeItem(USER_KEY);
};

export const getCurrentUser = (): User | null => {
    const userStr = sessionStorage.getItem(USER_KEY);
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error('Failed to parse user from sessionStorage', e);
            return null;
        }
    }
    return null;
};