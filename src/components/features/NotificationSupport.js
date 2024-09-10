import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { ReactComponent as BasketIconSvg } from "../../images/bill.svg"; // Ensure this path is correct
import socket from "helpers/soket/socket";
import { GetToken } from "helpers/GetToken";
import { jwtDecode } from "jwt-decode"; // Import the jwt-decode library

const IconContainer = styled.div`
  ${tw`fixed text-white p-4 rounded-full shadow-lg cursor-pointer bg-primary-500`}
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px; // Adjust size as needed
  height: 50px; // Adjust size as needed
  left: 20px;
  top: 10%;
  z-index: 1;
`;

const NotifSupport = () => {
  const token = GetToken();

  // Decode the token and extract the tableNumber
  let tableNumber = null;
  if (token) {
    try {
      const decodedToken = jwtDecode(token); // Decode the token
      console.log(decodedToken);
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
      console.log("calling from table", tableNumber);
      callForSupport(tableNumber);
    } else {
      console.error("Table number not found in token");
    }
  };

  return (
    <IconContainer onClick={handleCallSupportClick}>
      <BasketIconSvg />
    </IconContainer>
  );
};

export default NotifSupport;
