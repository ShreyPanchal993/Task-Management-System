import React, {createContext, useState, useEffect} from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { tokenStore } from "../utils/tokenStore";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        const token = tokenStore.get();
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
            setUser(response.data.data || response.data);
        } catch (error) {
            console.error("User not authenticated", error);
            tokenStore.clear();
        } finally {
            setLoading(false);
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const clearUser = () => {
        setUser(null);
        tokenStore.clear();
    };

    return (
        <UserContext.Provider value={{ user, loading, updateUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;