import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { GetToken } from "helpers/GetToken";

const PrivateRoute = ({ children }) => {
  const token = GetToken();

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    // Decode the token to get its expiration time
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Check if the token is expired
    if (decodedToken.exp < currentTime) {
      // Remove the expired token from local storage
      localStorage.removeItem("tableToken");
      return <Navigate to="/login" />;
    }
  } catch (error) {
    // In case of any error during token decoding, remove the token and redirect to login
    localStorage.removeItem("tableToken");
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
