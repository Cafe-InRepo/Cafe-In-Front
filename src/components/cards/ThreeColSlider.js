import React, { useState, useEffect, useCallback } from "react";
import Slider from "react-slick";
import tw from "twin.macro";
import styled from "styled-components";
import { useParams, Link, useNavigate } from "react-router-dom";
import { SectionHeading } from "components/misc/Headings";
import { PrimaryButton as PrimaryButtonBase } from "components/misc/Buttons";
import { ReactComponent as StarIcon } from "feather-icons/dist/icons/star.svg";
import { ReactComponent as ChevronLeftIcon } from "feather-icons/dist/icons/chevron-left.svg";
import { ReactComponent as ChevronRightIcon } from "feather-icons/dist/icons/chevron-right.svg";
import { useSelector, useDispatch } from "react-redux";
import { removeItem, clearBasket } from "../../features/basketSlice";
import { ReactComponent as ArrowRightIcon } from "feather-icons/dist/icons/arrow-right.svg";
import { ReactComponent as ArrowLeftIcon } from "feather-icons/dist/icons/arrow-left.svg";
import { baseUrl } from "helpers/BaseUrl";
import axios from "axios";
import Loading from "helpers/Loading";
import { GetToken } from "helpers/GetToken";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import translations from "app/language";
import socket from "helpers/soket/socket";

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
  tw`w-full min-w-[270px] h-56 sm:h-64 bg-cover bg-center rounded sm:rounded-none rounded-tl-4xl sm:rounded-tl-4xl`,
]);

const TextInfo = tw.div`py-6 px-4 sm:px-10 sm:py-6 w-full max-w-xs `;
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

const SecondaryInfoContainer = styled.div`
  ${tw`flex flex-col sm:flex-row mt-2 sm:mt-4 w-full`}
  justify-content: space-between;
`;
const IconWithText = styled.div`
  ${tw`flex items-center mr-6 my-2 sm:my-0`}
  ${tw`sm:justify-end`}
  @media (max-width: 768px) {
    ${tw`w-full justify-end`}
  }
`;

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
const CommentContainer = styled.div`
  ${tw`mt-4 flex flex-col w-full`}
`;

const CommentLabel = styled.label`
  ${tw`text-lg font-semibold mb-2`}
`;

const CommentTextarea = styled.textarea`
  ${tw`w-full p-3 border rounded-lg text-sm leading-relaxed`}
  min-height: 100px;
`;

export default () => {
  const [sliderRef, setSliderRef] = useState(null);
  const [order, setOrder] = useState(null);
  const [updatedQuantities, setUpdatedQuantities] = useState({});
  const items = useSelector((state) => state.basket.items);
  const dispatch = useDispatch();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const token = GetToken();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [comment, setComment] = useState(order?.comment || "");
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
    const isConfirmed = window.confirm(
      "Are you sure you want to remove this item?"
    );
    if (!isConfirmed) return;

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
          alert("Failed to remove item from order");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error removing item from order:", error);
        alert("Error removing item from order");
        setIsLoading(false);
      }
    } else {
      // Handle removal from basket slice
      dispatch(removeItem(item.product));
    }
  };

  const handleIncreaseQuantity = (item) => {
    setUpdatedQuantities((prevQuantities) => ({
      ...prevQuantities,
      [item.product._id]:
        (prevQuantities[item.product._id] || item.quantity) + 1,
    }));
  };

  const handleDecreaseQuantity = (item) => {
    setUpdatedQuantities((prevQuantities) => ({
      ...prevQuantities,
      [item.product._id]: Math.max(
        (prevQuantities[item.product._id] || item.quantity) - 1,
        1
      ),
    }));
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);

    const products = !orderId
      ? items.map((item) => ({
          product: item.product._id,
          quantity: updatedQuantities[item.product._id] || item.quantity,
        }))
      : order?.products.map((product) => ({
          product: product.product._id,
          quantity: updatedQuantities[product.product._id] || product.quantity,
        }));

    const orderData = { products, comment };
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

        // Emit socket event
        socket.emit("newOrder", { orderId: orderId || result._id });

        if (!orderId) {
          dispatch(clearBasket());
        }
        navigate("/orders"); // Navigate to /orders
      } else {
        console.error("Failed to place order:", response.statusText);
        alert("Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order");
    } finally {
      setIsLoading(false);
    }
  };

  const t = useSelector((state) => state.language.language);
  const Language = translations[t];

  const displayItems = orderId ? order?.products : items;

  const determineSlidesToShow = () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return 1;
    if (displayItems?.length === 1) return 1;
    if (displayItems?.length === 2) return 2;
    return 3;
  };

  const sliderSettings = {
    arrows: false,
    infinite: false,
    slidesToShow: determineSlidesToShow(),
    afterChange: (current) => setCurrentSlide(current),
    nextArrow: (
      <NextButton disabled={currentSlide === displayItems?.length - 1}>
        <ChevronRightIcon />
      </NextButton>
    ),
    prevArrow: (
      <PrevButton disabled={currentSlide === 0}>
        <ChevronLeftIcon />
      </PrevButton>
    ),
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
        (total, item) =>
          total +
          item.product.price *
            (updatedQuantities[item.product._id] || item.quantity),
        0
      );

  if (!displayItems || displayItems.length === 0) {
    return (
      <MessageContainer>
        <Message>{Language.pleaseSelectItems}</Message>
        <MenuLink to="/menu">{Language.goToMenu}</MenuLink>
      </MessageContainer>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <AnimationRevealPage>
      <Container>
        <Content>
          <HeadingWithControl>
            <Heading>{Language.myOrder}</Heading>
            <Controls>
              <PrevButton
                onClick={sliderRef?.slickPrev}
                disabled={currentSlide === 0}
              >
                <ChevronLeftIcon />
              </PrevButton>
              <NextButton
                onClick={sliderRef?.slickNext}
                disabled={currentSlide === displayItems.length - 1}
              >
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
                  <Quantity>
                    {updatedQuantities[item.product._id] || item.quantity}
                  </Quantity>
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
                    <Description>{item.product.description}</Description>
                    <IconWithText>
                      {Language.price}: {item.product.price} TND
                    </IconWithText>
                  </SecondaryInfoContainer>
                </TextInfo>
                <PrimaryButton onClick={() => handleRemoveFromBasket(item)}>
                  {Language.remove}
                </PrimaryButton>
              </Card>
            ))}
          </CardSlider>
          <CommentContainer>
            <CommentLabel htmlFor="orderComment">
              {Language.comment || "Comment"}
            </CommentLabel>
            <CommentTextarea
              id="orderComment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={Language.addYourComment || "Add Your Comment"}
            />
          </CommentContainer>

          <PlaceOrderButton onClick={handlePlaceOrder}>
            {orderId ? "Update the Order" : "Place the Order"}
            <ArrowRightIcon />
          </PlaceOrderButton>
          <TotalPriceContainer>
            {Language.totalPrice}: {totalPrice.toFixed(2)} TND
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
    </AnimationRevealPage>
  );
};
