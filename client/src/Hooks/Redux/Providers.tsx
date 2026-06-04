"use client";

import { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./store"; // Adjust path to your actual store file
import { fetchProfile } from "../Redux/Slices/authSlice"; // Adjust path to your authSlice

// This inner component has access to the Redux context
function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<any>();
  const { accessToken, user } = useSelector((state: any) => state.auth);

  useEffect(() => {
    // If a token was loaded into initial state on refresh, but we don't have the user object yet
    if (accessToken && !user) {
      dispatch(fetchProfile());
    }
  }, [accessToken, user, dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator>
        {children}
      </AuthHydrator>
    </Provider>
  );
}