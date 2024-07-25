// src/socket.js
import { baseUrl } from "helpers/BaseUrl";
import { io } from "socket.io-client";

const socket = io(baseUrl, {
  transports: ["websocket"], // Use WebSocket as the transport mechanism
});

export default socket;
