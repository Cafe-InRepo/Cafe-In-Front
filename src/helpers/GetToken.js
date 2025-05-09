// utils/GetToken.js
import { TokenManager } from "../utils/TokenManager";
export const GetToken = () => {
  return TokenManager.getToken(); // Automatically handles expiration
};
