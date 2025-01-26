// src/socket.js
import { baseUrl } from "helpers/BaseUrl";
import { GetToken } from "helpers/GetToken";
import { io } from "socket.io-client";
const token = GetToken();
const socket = io(baseUrl, {
  transports: ["websocket"], // Use WebSocket as the transport mechanism
  auth: {
    token,
  },
});

export default socket;
