import React, { useState, useEffect, useCallback } from "react";
import Slider from "react-slick";
import tw from "twin.macro";
import styled from "styled-components";
import { useParams, Link, useNavigate } from "react-router-dom";
import { SectionHeading } from "components/misc/Headings";
import { PrimaryButton as PrimaryButtonBase } from "components/misc/Buttons";
import { ReactComponent as PriceIcon } from "feather-icons/dist/icons/dollar-sign.svg";
import { ReactComponent as StarIcon } from "feather-icons/dist/icons/star.svg";
import { ReactComponent as ChevronLeftIcon } from "feather-icons/dist/icons/chevron-left.svg";
import { ReactComponent as ChevronRightIcon } from "feather-icons/dist/icons/chevron-right.svg";
import { useSelector, useDispatch } from "react-redux";
import {
  removeItem,
  increaseQuantity,
  decreaseQuantity,
  clearBasket,
} from "../../features/basketSlice";
import { ReactComponent as ArrowRightIcon } from "feather-icons/dist/icons/arrow-right.svg";
import { ReactComponent as ArrowLeftIcon } from "feather-icons/dist/icons/arrow-left.svg";
import { baseUrl } from "helpers/BaseUrl";
import axios from "axios";
import Loading from "helpers/Loading";
import { GetToken } from "helpers/GetToken";

const Container = styled.div`
  ${tw`relative`}
  width: 100%;
`;

const Content = styled.div`
  ${tw`max-w-screen-xl mx-auto py-16 lg:py-20`}
  width: 100%;
`;

const HeadingWithControl = tw.div`flex flex-col items-center sm:items-stretch sm:flex-row justify-between`;
const Heading = tw(SectionHeading)`mt-4`;
const Controls = tw.div`flex items-center`;
const ControlButton = styled(PrimaryButtonBase)`
  ${tw`mt-4 sm:mt-0 first:ml-0 ml-6 rounded-full p-2`}
  svg {
    ${tw`w-6 h-6`}
  }
`;
const PrevButton = tw(ControlButton)``;
const NextButton = tw(ControlButton)``;

const CardSlider = styled(Slider)`
  ${tw`mt-16`}
  width: 100%;
  .slick-track {
    ${tw`flex`}
  }
  .slick-slide {
    ${tw`h-auto flex justify-center mb-1`}
  }
  @media (max-width: 768px) {
    ${tw`w-full`}
    .slick-slide {
      ${tw`w-full`}
    }
  }
`;
const Card = styled.div`
  ${tw`h-full flex! flex-col sm:border sm:max-w-sm sm:rounded-tl-4xl sm:rounded-br-5xl relative focus:outline-none border max-w-sm rounded-tl-4xl rounded-br-4xl`}
  width: 100%;
`;
const CardImage = styled.div((props) => [
  `background-image: url("${props.imageSrc}");`,
  tw`w-full h-56 sm:h-64 bg-cover bg-center rounded sm:rounded-none rounded-tl-4xl sm:rounded-tl-4xl`,
]);

const TextInfo = tw.div`py-6 px-16 sm:px-10 sm:py-6 w-full max-w-xs `;
const TitleReviewContainer = styled.div`
  ${tw`flex flex-col sm:flex-row sm:justify-between sm:items-center w-full`}
`;
const Title = tw.h5`text-xl font-bold`;

const RatingsInfo = styled.div`
  ${tw`flex items-center sm:ml-4 mt-2 sm:mt-0`}
  svg {
    ${tw`w-6 h-6 text-yellow-500 fill-current`}
  }
`;
const Rating = tw.span`ml-2 font-bold`;

const Description = tw.p`text-sm leading-loose mt-2 sm:mt-4 w-full`;

const SecondaryInfoContainer = tw.div`flex flex-col sm:flex-row mt-2 sm:mt-4 w-full`;
const IconWithText = tw.div`flex items-center mr-6 my-2 sm:my-0`;
const IconContainer = styled.div`
  ${tw`inline-block rounded-full p-2 bg-gray-700 text-gray-100`}
  svg {
    ${tw`w-3 h-3`}
  }
`;
const Text = tw.div`ml-2 text-sm font-semibold text-gray-800`;

const PrimaryButton = tw(
  PrimaryButtonBase
)`mt-auto sm:text-lg rounded-none w-full rounded bg-red-700 sm:rounded-none sm:rounded-br-4xl rounded-br-4xl py-3 sm:py-6`;

const QuantityContainer = styled.div`
  ${tw`absolute flex items-center bg-white border border-gray-300 rounded-full`}
`;

const QuantityButton = styled.button`
  ${tw`text-lg px-2 py-1`}
  border: none;
  background: none;
  cursor: pointer;
`;

const Quantity = styled.p`
  ${tw`text-lg font-semibold text-gray-800 px-2`}
`;

const MessageContainer = tw.div`text-center py-16`;
const Message = tw.p`text-lg`;
const MenuLink = tw(Link)`text-primary-500`;

const PlaceOrderButton = styled(PrimaryButtonBase)`
  ${tw`mr-8 mt-8 flex items-center`}
  right: 0;
  bottom: 0;
  position: absolute;
  svg {
    ${tw`ml-2 w-6 h-6`}
  }
`;

const BackToMenuButton = styled(PrimaryButtonBase)`
  ${tw`ml-8 mt-8 mb-4 flex items-center`}
  left: 0;
  top: 0;
  position: absolute;
  svg {
    ${tw`mr-2 w-6 h-6`}
  }
`;

const TotalPriceContainer = styled.div`
  ${tw`flex justify-end items-center mt-8 mr-8`}
  font-size: 1.25rem;
  font-weight: bold;
`;

export default () => {
  const [sliderRef, setSliderRef] = useState(null);
  const [order, setOrder] = useState(null);
  const items = useSelector((state) => state.basket.items);
  const dispatch = useDispatch();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const token = GetToken();

  const fetchOrder = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/order/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setOrder(response.data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setIsLoading(false);
    }
  }, [orderId, token]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setIsLoading(false);
    }
  }, [orderId, fetchOrder]);

  const handleRemoveFromBasket = async (item) => {
    if (orderId) {
      setIsLoading(true);
      // Handle removal from order
      const updatedProducts = order.products.filter(
        (product) => product.product._id !== item.product._id
      );
      const updatedOrder = { ...order, products: updatedProducts };

      try {
        const response = await axios.put(
          `${baseUrl}/order/${orderId}`,
          updatedOrder,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setOrder(response.data);
          fetchOrder();
          setIsLoading(false);
        } else {
          setIsLoading(true);
          alert("Failed to remove item from order");
        }
      } catch (error) {
        console.error("Error removing item from order:", error);
        setIsLoading(false);
        alert("Error removing item from order");
      }
    } else {
      // Handle removal from basket slice
      const isConfirmed = window.confirm(
        "Are you sure you want to remove this item?"
      );
      if (isConfirmed) {
        dispatch(removeItem(item.product));
      }
    }
  };

  const handleIncreaseQuantity = async (item) => {
    setIsLoading(true);
    if (orderId) {
      try {
        const response = await axios.put(
          `${baseUrl}/order/${orderId}/increase/${item.product._id}`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setOrder(response.data.order);
          setIsLoading(false);
        } else {
          alert("Failed to increase quantity");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error increasing quantity:", error);
        alert("Error increasing quantity");
        setIsLoading(false);
      }
    } else {
      dispatch(increaseQuantity(item.product));
      setIsLoading(false);
    }
  };

  const handleDecreaseQuantity = async (item) => {
    setIsLoading(true);
    if (orderId) {
      try {
        const response = await axios.put(
          `${baseUrl}/order/${orderId}/decrease/${item.product._id}`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setOrder(response.data.order);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          alert("Failed to decrease quantity");
        }
      } catch (error) {
        console.error("Error decreasing quantity:", error);
        setIsLoading(false);
        alert("Error decreasing quantity");
      }
    } else {
      dispatch(decreaseQuantity(item.product));
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);

    const orderData = !orderId
      ? {
          products: items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
          })),
        }
      : {
          products: order?.products,
        };

    try {
      let response;
      let message;
      if (orderId) {
        // Update existing order
        response = await axios.put(`${baseUrl}/order/${orderId}`, orderData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        message = "Order updated successfully";
      } else {
        // Create new order
        response = await axios.post(`${baseUrl}/order`, orderData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        message = "Order placed successfully";
      }

      if (response.status === 200 || response.status === 201) {
        const result = response.data;
        console.log(message, result);
        setIsLoading(false);
        if (!orderId) {
          dispatch(clearBasket());
        }
        navigate("/orders"); // Navigate to /orders
      } else {
        console.error("Failed to place order:", response.statusText);
        setIsLoading(false);
        alert("Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setIsLoading(false);
      alert("Error placing order");
    }
  };

  const determineSlidesToShow = () => {
    if (items.length === 1) return 1;
    if (items.length === 2) return 2;
    return 3;
  };

  const sliderSettings = {
    arrows: false,
    slidesToShow: determineSlidesToShow(),
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow:
            determineSlidesToShow() < 3 ? determineSlidesToShow() : 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const totalPrice = orderId
    ? Number(order?.totalPrice)
    : items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );

  const displayItems = orderId ? order?.products : items;

  if (!displayItems || displayItems.length === 0) {
    return (
      <MessageContainer>
        <Message>Please select some items from our menu.</Message>
        <MenuLink to="/menu">Go to Menu</MenuLink>
      </MessageContainer>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container>
      <Content>
        <HeadingWithControl>
          <Heading>My Order</Heading>
          <Controls>
            <PrevButton onClick={sliderRef?.slickPrev}>
              <ChevronLeftIcon />
            </PrevButton>
            <NextButton onClick={sliderRef?.slickNext}>
              <ChevronRightIcon />
            </NextButton>
          </Controls>
        </HeadingWithControl>
        <CardSlider ref={setSliderRef} {...sliderSettings}>
          {displayItems?.map((item, index) => (
            <Card key={index}>
              <CardImage imageSrc={item.product.img} />
              <QuantityContainer style={{ top: 10, left: 10 }}>
                <QuantityButton onClick={() => handleDecreaseQuantity(item)}>
                  -
                </QuantityButton>
                <Quantity>{item.quantity || 1}</Quantity>
                <QuantityButton onClick={() => handleIncreaseQuantity(item)}>
                  +
                </QuantityButton>
              </QuantityContainer>
              <TextInfo>
                <TitleReviewContainer>
                  <Title>{item.product.name}</Title>
                  <RatingsInfo>
                    <StarIcon />
                    <Rating>
                      {Math.floor(item.product.rate)} ({item.product.raters})
                    </Rating>
                  </RatingsInfo>
                </TitleReviewContainer>
                <SecondaryInfoContainer>
                  <IconWithText>
                    <Text>{item.product.description}</Text>
                  </IconWithText>
                  <IconWithText>
                    <IconContainer>
                      <PriceIcon />
                    </IconContainer>
                    <Text>${item.product.price}</Text>
                  </IconWithText>
                </SecondaryInfoContainer>
                <Description>{item.product.description}</Description>
              </TextInfo>
              <PrimaryButton onClick={() => handleRemoveFromBasket(item)}>
                Remove
              </PrimaryButton>
            </Card>
          ))}
        </CardSlider>
        <TotalPriceContainer>
          Total Price: ${totalPrice.toFixed(2)}
        </TotalPriceContainer>
        <PlaceOrderButton onClick={handlePlaceOrder}>
          {orderId ? "Update the Order" : "Place the Order"}
          <ArrowRightIcon />
        </PlaceOrderButton>
        <BackToMenuButton as={Link} to="/menu">
          <ArrowLeftIcon />
          Back to Menu
        </BackToMenuButton>
      </Content>
    </Container>
  );
};
