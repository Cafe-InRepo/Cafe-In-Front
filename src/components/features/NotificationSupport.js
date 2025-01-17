import React, { useEffect, useState } from "react";
import tw from "twin.macro";
import styled, { keyframes } from "styled-components";
import { ReactComponent as BasketIconSvg } from "../../images/bill.svg"; // Ensure this path is correct
import socket from "helpers/soket/socket";
import { GetToken } from "helpers/GetToken";
import { jwtDecode } from "jwt-decode"; // Import the jwt-decode library
import { io } from "socket.io-client";
import { baseUrl } from "helpers/BaseUrl";

// Define a horizontal movement animation using keyframes
const moveAnimation = keyframes`
  0% { transform: translateX(0); }
  50% { transform: translateX(10px); }
  100% { transform: translateX(0); }
`;

// Style the icon container
const IconContainer = styled.div`
  ${tw`fixed text-white p-4 rounded-full shadow-lg cursor-pointer bg-primary-500`}
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  left: 20px;
  top: 10%;
  z-index: 1;
  transition: all 0.3s ease;

  // Add the moving class animation when processing
  &.processing {
    animation: ${moveAnimation} 1s ease-in-out infinite;
  }

  // Disable pointer events and reduce opacity when disabled
  &.disabled {
    pointer-events: none;
    opacity: 0.6;
  }
`;

// Style the icon itself
const StyledBasketIcon = styled(BasketIconSvg)``;

const NotifSupport = () => {
  const [isProcessing, setIsProcessing] = useState(false); // For tracking the call status
  const [isDisabled, setIsDisabled] = useState(false); // For tracking the button disabled state
  const token = GetToken();

  // Decode the token and extract the tableNumber
  let tableNumber = null;
  if (token) {
    try {
      const decodedToken = jwtDecode(token); // Decode the token
      tableNumber = decodedToken.table.number; // Extract tableNumber from the decoded token
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }

  const callForSupport = (tableNumber) => {
    socket.emit("supportRequest", { tableNumber });

    return () => {
      socket.disconnect();
    };
  };

  const handleCallSupportClick = () => {
    if (tableNumber) {
      setIsProcessing(true); // Start showing the animation
      setIsDisabled(true); // Disable the button

      console.log("calling from table", tableNumber);
      callForSupport(tableNumber);

      // Re-enable the button after 1 minute
      setTimeout(() => {
        setIsDisabled(false);
      }, 60000);
    } else {
      console.error("Table number not found in token");
    }
  };

  useEffect(() => {
    const socket = io(baseUrl, { auth: { token } });
    // Listen for call answered event
    socket.on("callAnswered", (data) => {
      if (data.tableNumber === tableNumber) {
        handleCallAnswered(); // Stop processing and mark the call as answered
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, tableNumber]);

  // Handle when the call is answered (could be triggered by a socket event or function call)
  const handleCallAnswered = () => {
    setIsProcessing(false); // Stop animation
  };

  return (
    // Add or remove the 'processing' or 'disabled' class based on the internal state
    <IconContainer
      onClick={handleCallSupportClick}
      className={`${isProcessing ? "processing" : ""} ${
        isDisabled ? "disabled" : ""
      }`}
    >
      <StyledBasketIcon />
    </IconContainer>
  );
};

export default NotifSupport;
