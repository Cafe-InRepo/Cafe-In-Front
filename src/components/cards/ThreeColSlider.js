import React, { useState } from "react";
import Slider from "react-slick";
import tw from "twin.macro";
import styled from "styled-components";
import { SectionHeading } from "components/misc/Headings";
import { PrimaryButton as PrimaryButtonBase } from "components/misc/Buttons";
import { Link } from "react-router-dom";
import { ReactComponent as PriceIcon } from "feather-icons/dist/icons/dollar-sign.svg";
import { ReactComponent as StarIcon } from "feather-icons/dist/icons/star.svg";
import { ReactComponent as ChevronLeftIcon } from "feather-icons/dist/icons/chevron-left.svg";
import { ReactComponent as ChevronRightIcon } from "feather-icons/dist/icons/chevron-right.svg";
import { useSelector, useDispatch } from "react-redux";
import { removeItem, increaseQuantity, decreaseQuantity } from "../../features/basketSlice";
import { ReactComponent as ArrowRightIcon } from "feather-icons/dist/icons/arrow-right.svg"; // Import the arrow right icon
import { ReactComponent as ArrowLeftIcon } from "feather-icons/dist/icons/arrow-left.svg"; // Import the arrow left icon

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
  ${tw`h-full flex! flex-col sm:border sm:max-w-sm sm:rounded-tl-4xl sm:rounded-br-5xl relative focus:outline-none border max-w-sm rounded-tl-4xl rounded-br-5xl`}
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
  ${tw`mr-16 mt-8 flex items-center`}
  right: 0;
  bottom: 0;
  position:absolute;
  svg {
    ${tw`ml-2 w-6 h-6`}
  }
`;

const BackToMenuButton = styled(PrimaryButtonBase)`
  ${tw`ml-16 mt-8 flex items-center`}
  left: 0;
  top: 0;
  position:absolute;
  svg {
    ${tw`mr-2 w-6 h-6`}
  }
`;

export default () => {
  const [sliderRef, setSliderRef] = useState(null);
  const items = useSelector((state) => state.basket.items);
  const dispatch = useDispatch();

  const handleRemoveFromBasket = (item) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to remove this item?"
    );
    if (isConfirmed) {
      dispatch(removeItem(item));
    }
  };

  const handleIncreaseQuantity = (item) => {
    dispatch(increaseQuantity(item));
  };

  const handleDecreaseQuantity = (item) => {
    dispatch(decreaseQuantity(item));
  };

  const handlePlaceOrder = () => {
    alert("Order placed successfully!"); // Replace with actual order logic
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

  if (items.length === 0) {
    return (
      <MessageContainer>
        <Message>Please select some items from our menu.</Message>
        <MenuLink to="/menu">Go to Menu</MenuLink>
      </MessageContainer>
    );
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
          {items.map((item, index) => (
            <Card key={index}>
              <CardImage imageSrc={item.imageSrc} />
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
                  <Title>{item.title}</Title>
                  <RatingsInfo>
                    <StarIcon />
                    <Rating>
                      {item.rating} ({item.reviews})
                    </Rating>
                  </RatingsInfo>
                </TitleReviewContainer>
                <SecondaryInfoContainer>
                  <IconWithText>
                    <Text>{item.content}</Text>
                  </IconWithText>
                  <IconWithText>
                    <IconContainer>
                      <PriceIcon />
                    </IconContainer>
                    <Text>{item.price}</Text>
                  </IconWithText>
                </SecondaryInfoContainer>
                <Description>{item.description}</Description>
              </TextInfo>
              <PrimaryButton onClick={() => handleRemoveFromBasket(item)}>
                Remove
              </PrimaryButton>
            </Card>
          ))}
        </CardSlider>
        <PlaceOrderButton onClick={handlePlaceOrder}>
          Place Order
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
