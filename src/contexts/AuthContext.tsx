import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../config/firebase";

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    loginBypass: () => void;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    loading: true,
    logout: async () => { },
    loginBypass: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = async () => {
        try {
            // Se for usuário mockado de bypass, basta limpar o state
            if (currentUser && currentUser.uid === "dev-bypass") {
                setCurrentUser(null);
                return;
            }
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const loginBypass = () => {
        setCurrentUser({ uid: "dev-bypass", email: "dev@bypass.local" } as User);
        setLoading(false);
    };

    const value = {
        currentUser,
        loading,
        logout,
        loginBypass,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
