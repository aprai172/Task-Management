'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { logout as logoutService } from '../services/auth.service';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    loginSession: (token: string, refresh: string) => void;
    logoutSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsAuthenticated(!!token);
        setIsLoading(false);
    }, []);

    const loginSession = (token: string, refresh: string) => {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refresh);
        setIsAuthenticated(true);
        router.push('/');
    };

    const logoutSession = async () => {
        try {
            await logoutService();
        } catch (e) { }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        router.push('/auth');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, loginSession, logoutSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
