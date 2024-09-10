import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { ReactComponent as BasketIconSvg } from "../../images/bill.svg"; // Ensure this path is correct
import socket from "helpers/soket/socket";
import { GetToken } from "helpers/GetToken";
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

const Badge = styled.div`
  ${tw`absolute bg-red-600 text-white rounded-full flex items-center justify-center`}
  width: 24px; // Adjust size as needed
  height: 24px; // Adjust size as needed
  bottom: -10px; // Adjust position as needed
  left: -10px; // Adjust position as needed
  font-size: 14px; // Adjust font size as needed
`;

const NotifSupport = () => {
  const token = GetToken();
  const callForSupport = (tableNumber) => {
    socket.emit("supportRequest", { tableNumber });

    return () => {
      socket.disconnect();
    };
  };
  const handleCallSupportClick = () => {
    console.log("calling");
    const tableNumber = 1; // Replace this with the actual table number
    callForSupport(tableNumber);
  };

  return (
    <IconContainer onClick={handleCallSupportClick}>
      <BasketIconSvg />
    </IconContainer>
  );
};

export default NotifSupport;
