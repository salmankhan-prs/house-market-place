import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Spinner from "../hooks/Spinner";
import useAuthStatus from "../hooks/useAuthStatus";

const PrivateRoute = () => {
  const { loggedIn, checkingStatus } = useAuthStatus();
  if (checkingStatus) {
    return <Spinner />;
  }
  return loggedIn ? <Outlet /> : <Navigate to="/signup" />;
};

export default PrivateRoute;
