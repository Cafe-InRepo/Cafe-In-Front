import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import tw from "twin.macro";
import styled from "styled-components";
import { ReactComponent as BasketIconSvg } from "../../images/orderr.svg"; // Ensure this path is correct

const IconContainer = styled.div`
  ${tw`fixed text-white p-4 rounded-full shadow-lg cursor-pointer bg-primary-500`}
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px; // Adjust size as needed
  height: 70px; // Adjust size as needed
  right: 20px;
  top: 30%;
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

const BasketIcon = () => {
  const navigate = useNavigate();
  const items = useSelector((state) => state.basket.items);

  useEffect(() => {
    console.log("Basket items:", items); // Debugging log
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  const handleNavigation = () => {
    navigate("/basket"); // Ensure this path is correct
  };

  return (
    <IconContainer onClick={handleNavigation}>
      <BasketIconSvg />
      <Badge>{items.length}</Badge>
    </IconContainer>
  );
};

export default BasketIcon;
