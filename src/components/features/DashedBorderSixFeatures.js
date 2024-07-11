import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import tw from "twin.macro";
import { SectionHeading } from "components/misc/Headings.js";
import { PrimaryButton as PrimaryButtonBase } from "components/misc/Buttons.js";
import { ReactComponent as SvgDecoratorBlob3 } from "../../images/svg-decorator-blob-3.svg";
import { ReactComponent as CheckIcon } from "feather-icons/dist/icons/check-circle.svg"; // Import the check icon
import { baseUrl } from "helpers/BaseUrl";
import axios from "axios";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import Nav from "components//hero/Nav.js";

const Container = tw.div`relative`;

const ThreeColumnContainer = styled.div`
  ${tw`flex flex-col items-center md:items-stretch md:flex-row flex-wrap md:justify-center max-w-screen-xl mx-auto py-20 md:py-24`}
`;
const Heading = tw(SectionHeading)`w-full`;

const Column = styled.div`
  ${tw`md:w-1/2 lg:w-1/3 px-6 flex`}
`;

const Card = styled.div`
  ${tw`flex flex-col mx-auto max-w-xs items-center px-6 py-10 border-2 border-dashed border-primary-500 rounded-lg mt-12 relative`}
  .textContainer {
    ${tw`mt-6 text-center`}
  }

  .title {
    ${tw`mt-2 font-bold text-xl leading-none text-primary-500`}
  }

  .description {
    ${tw`mt-3 font-semibold text-secondary-100 text-sm leading-loose`}
  }

  .productList {
    ${tw`mt-3 text-sm`}
  }
`;

const ButtonContainer = tw.div`mt-4 flex justify-between w-full`;

const PrimaryButton = styled(PrimaryButtonBase)`
  ${tw`text-sm w-full m-1`}
  ${({ disabled }) => disabled && tw`bg-gray-300 cursor-not-allowed`}
`;

const CompletedIcon = styled(CheckIcon)`
  ${tw` w-12 h-12 text-green-500`}
`;

const DecoratorBlob = styled(SvgDecoratorBlob3)`
  ${tw`pointer-events-none absolute right-0 bottom-0 w-64 opacity-25 transform translate-x-32 translate-y-48 `}
`;

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${baseUrl}/order`);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleModify = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const handleCancel = async (orderId) => {
    try {
      await axios.delete(`${baseUrl}/orders/${orderId}`);
      setOrders(orders.filter((order) => order._id !== orderId));
    } catch (error) {
      console.error("Error canceling order:", error);
    }
  };

  const handleAddNewOrder = () => {
    navigate("/menu");
  };

  return (
    <AnimationRevealPage>
      <Container>
        <Nav />
        <ThreeColumnContainer>
          <Heading>My Orders</Heading>
          {orders.map((order, i) => (
            <Column key={i}>
              <Card>
                {order.status === "completed" && <CompletedIcon />}
                <span className="textContainer">
                  <span className="title">Status: {order.status}</span>
                  <div className="description">
                    Total Price: <b> {order.totalPrice} TND</b>
                  </div>
                  <div className="productList">
                    Products:
                    <ul>
                      {order.products.map((product, index) => (
                        <li key={index}>
                          {product.name} : {product.price} TND
                        </li>
                      ))}
                    </ul>
                  </div>
                </span>
                <ButtonContainer>
                  <PrimaryButton
                    onClick={() => handleModify(order._id)}
                    disabled={order.status !== "pending"}
                  >
                    Modify
                  </PrimaryButton>
                  <PrimaryButton
                    onClick={() => handleCancel(order._id)}
                    disabled={order.status !== "pending"}
                  >
                    Cancel
                  </PrimaryButton>
                </ButtonContainer>
              </Card>
            </Column>
          ))}
          <Column>
            <Card onClick={handleAddNewOrder}>
              <span className="textContainer">
                <span className="title">+ Add New Order</span>
              </span>
            </Card>
          </Column>
        </ThreeColumnContainer>
        <DecoratorBlob />
      </Container>
    </AnimationRevealPage>
  );
};

export default OrderList;
