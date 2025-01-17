import axios from "axios";
import { baseUrl } from "helpers/BaseUrl";
import { GetToken } from "helpers/GetToken";
import Loading from "helpers/Loading";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import tw from "twin.macro";

const Container = tw.div`relative min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8`;
const Card = tw.div`bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center`;
const Title = tw.h2`text-2xl font-bold mb-4`;
const TipsList = tw.div`space-y-4`;
const TipButton = tw.button`w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition duration-300`;
const CustomTipInput = tw.input`w-full mt-4 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500`;
const SubmitButton = styled.button`
  ${tw`mt-4 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300`}
  ${({ disabled }) => disabled && tw`bg-gray-400 cursor-not-allowed`}
`;
const OrdersLink = tw(
  Link
)`mt-4 inline-block text-primary-500 hover:text-primary-700`;

const TipsPage = () => {
  const { orderId } = useParams();
  const token = GetToken(); // Retrieve the token

  const [selectedTip, setSelectedTip] = useState(null);
  const [customTip, setCustomTip] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tipped, setTipped] = useState(false);

  const handleTipSelect = (amount) => {
    setSelectedTip(amount);
    setCustomTip(""); // Clear custom input when a preset tip is selected
  };

  const handleCustomTipChange = (e) => {
    setSelectedTip(null); // Clear preset selection when custom input is used
    setCustomTip(e.target.value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const tipAmount = customTip || selectedTip; // Use custom tip if available, else use selected tip
    try {
      await axios.post(
        `${baseUrl}/order/${orderId}/tips`,
        { selectedTip: tipAmount }, // Send the correct tip value
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTipped(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error submitting tip:", error);
      setIsLoading(false);
    }
  };

  if (tipped) {
    return (
      <Container>
        <Card>
          <Title>Thank you for your tip!</Title>
          <OrdersLink to="/orders">Go to my orders</OrdersLink>
        </Card>
      </Container>
    );
  }

  const isSubmitDisabled = !selectedTip && !customTip;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container>
      <Card>
        <Title>Choose Your Tip</Title>
        <TipsList>
          {[5, 10, 15, 20].map((amount) => (
            <TipButton
              key={amount}
              onClick={() => handleTipSelect(amount)}
              className={selectedTip === amount ? "bg-primary-700" : ""}
            >
              {amount} TND
            </TipButton>
          ))}
        </TipsList>
        <CustomTipInput
          type="number"
          placeholder="Enter custom tip amount"
          value={customTip}
          onChange={handleCustomTipChange}
        />
        <SubmitButton onClick={handleSubmit} disabled={isSubmitDisabled}>
          Submit Tip
        </SubmitButton>
      </Card>
    </Container>
  );
};

export default TipsPage;
