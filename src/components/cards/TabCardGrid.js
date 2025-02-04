import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../../features/basketSlice";
import { motion } from "framer-motion";
import tw from "twin.macro";
import styled, { css } from "styled-components";
import { Container, ContentWithPaddingXl } from "components/misc/Layouts.js";
import { SectionHeading } from "components/misc/Headings.js";
import { PrimaryButton as PrimaryButtonBase } from "components/misc/Buttons.js";
import { ReactComponent as StarIcon } from "images/star-icon.svg";
import { ReactComponent as SvgDecoratorBlob1 } from "images/svg-decorator-blob-5.svg";
import { ReactComponent as SvgDecoratorBlob2 } from "images/svg-decorator-blob-7.svg";
import BasketIcon from "components/features/BasketIcon";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import axios from "axios";
import { baseUrl } from "helpers/BaseUrl";
import Nav from "components/hero/Nav.js";
import { GetToken } from "helpers/GetToken";
import ErrorModal from "../../helpers/modals/ErrorModal";
import Loading from "helpers/Loading";
import translations from "app/language";
import { io } from "socket.io-client";
import NotifSupport from "components/features/NotificationSupport";
import { useParams } from "react-router-dom";
const HeaderRow = tw.div`flex justify-between items-center flex-col xl:flex-col`;
const Header = tw(SectionHeading)``;
const TabsWrapper = styled.div`
  ${tw`overflow-x-auto whitespace-nowrap`}
`;

const TabsControl = styled.div`
  ${tw`inline-flex bg-gray-200 px-2 py-2 rounded leading-none mt-12 xl:mt-2`}
`;
// const TabsControl = styled.div`
//   ${tw`flex bg-gray-200 px-2 py-2 rounded leading-none mt-12 xl:mt-2`}
//   flex-wrap: nowrap; /* Prevent wrapping */
//   overflow-x: auto; /* Enable horizontal scrolling */
//   white-space: nowrap; /* Prevent tabs from wrapping */
//   scrollbar-width: thin; /* Thin scrollbar for Firefox */
//   -ms-overflow-style: none; /* Hide scrollbar for IE/Edge */

//   &::-webkit-scrollbar {
//     height: 4px; /* Set height for horizontal scrollbar */
//   }
//   &::-webkit-scrollbar-thumb {
//     background: #c4c4c4; /* Customize scrollbar thumb color */
//     border-radius: 8px; /* Rounded scrollbar */
//   }
//   &::-webkit-scrollbar-track {
//     background: #f0f0f0; /* Customize scrollbar track color */
//   }
// `;

const TabControl = styled.div`
  ${tw`cursor-pointer px-6 py-3 mt-2 sm:mt-0 sm:mr-2 last:mr-0 text-gray-600 font-medium rounded-sm transition duration-300 text-sm sm:text-base`}
  &:hover {
    ${tw`bg-gray-300 text-gray-700`}
  }
  ${(props) => props.active && tw`bg-primary-500! text-gray-100!`}
  flex: 0 0 auto; /* Ensure tabs stay side by side */
`;

const TabContent = tw(
  motion.div
)`mt-6 flex flex-wrap sm:-mr-10 md:-mr-6 lg:-mr-12`;
const CardContainer = tw.div`mt-10 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 sm:pr-10 md:pr-6 lg:pr-12`;

const Card = styled(motion.div)`
  ${tw`bg-gray-200 rounded-b block max-w-xs mx-auto sm:max-w-none sm:mx-0 relative`}
  ${({ $isAvailable }) =>
    !$isAvailable &&
    css`
      opacity: 0.5;
      position: relative;
      &::after {
        content: "Unavailable";
        position: absolute;
        top: 0;
        right: 0;
        background: red;
        color: white;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: bold;
        border-radius: 0 8px 0 8px;
      }
    `}
`;

const CardImageContainer = styled.div`
  ${({ imageSrc }) =>
    css`
      background-image: url("${imageSrc}");
    `}
  ${tw`h-56 xl:h-64 bg-center bg-cover relative rounded-t`}
`;

const CardRatingContainer = tw.div`leading-none absolute inline-flex bg-gray-100 bottom-0 left-0 ml-4 mb-4 rounded-full px-5 py-2 items-end`;
const CardRating = styled.div`
  ${tw`mr-1 text-sm font-bold flex items-end`}
  svg {
    ${tw`w-4 h-4 fill-current text-orange-400 mr-1`}
  }
`;

const CardButton = styled(PrimaryButtonBase)`
  ${tw`text-sm mt-4 w-full`}
  ${({ $isAvailable }) =>
    !$isAvailable &&
    css`
      cursor: not-allowed;
      background-color: gray;
      &:hover {
        background-color: gray;
      }
    `}
`;

const CardReview = tw.div`font-medium text-xs text-gray-600`;

const CardText = tw.div`p-4 text-gray-900`;
const CardTitle = tw.h5`text-lg font-semibold`;
const CardContent = tw.p`mt-1 text-sm font-medium text-gray-600`;
const CardPrice = tw.p`mt-4 text-xl font-bold`;

const DecoratorBlob1 = styled(SvgDecoratorBlob1)`
  ${tw`pointer-events-none -z-20 absolute right-0 top-0 h-64 w-64 opacity-15 transform translate-x-2/3 -translate-y-12 text-pink-400`}
`;
const DecoratorBlob2 = styled(SvgDecoratorBlob2)`
  ${tw`pointer-events-none -z-20 absolute left-0 bottom-0 h-80 w-80 opacity-15 transform -translate-x-2/3 text-primary-500`}
`;
const DiscountedPrice = tw.span`text-green-600 font-bold`;
const OriginalPrice = tw.span`line-through text-gray-500 mr-2`;
const DiscountBadge = tw.span`ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded`;

export default ({ heading = "Checkout the Menu" }) => {
  const [tabs, setTabs] = useState({});
  const [tabsKeys, setTabsKeys] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isLodaing, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const token = GetToken();
  const { categoryId } = useParams();
  const dispatch = useDispatch();
  const t = useSelector((state) => state.language.language);
  const Language = translations[t];
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${baseUrl}/sections/${categoryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const menu = response.data;
        const categories = {};
        menu.categories.forEach((category) => {
          categories[category.name] = category.products;
        });
        setTabs(categories);
        setTabsKeys(Object.keys(categories));
        setActiveTab(Object.keys(categories)[0]);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching menu:", error);
        setErrorMessage("Error fetching menu. Please try again.");
        setShowErrorModal(true);
        setIsLoading(false);
      }
    };

    fetchMenu();
    const socket = io(baseUrl, {
      auth: { token },
    });

    socket.on("productUpdated", () => {
      fetchMenu();
    });

    return () => {
      socket.disconnect();
    };
  }, [token, categoryId]);

  const handleAddToBasket = (product) => {
    if (product.available) {
      dispatch(addItem(product));
    } else {
      setErrorMessage("This product is currently unavailable.");
      setShowErrorModal(true);
    }
  };
  if (isLodaing) {
    return <Loading />;
  }

  return (
    <AnimationRevealPage>
      <Nav />
      <BasketIcon />
      <NotifSupport />
      <Container>
        <ContentWithPaddingXl>
          <HeaderRow>
            <Header>{heading}</Header>
          </HeaderRow>
          <TabsWrapper>
            <TabsControl>
              {tabsKeys.map((tabName, index) => (
                <TabControl
                  key={index}
                  active={activeTab === tabName}
                  onClick={() => setActiveTab(tabName)}
                >
                  {tabName}
                </TabControl>
              ))}
            </TabsControl>
          </TabsWrapper>

          {tabsKeys.map((tabKey, index) => (
            <TabContent
              key={index}
              variants={{
                current: {
                  opacity: 1,
                  scale: 1,
                  display: "flex",
                },
                hidden: {
                  opacity: 0,
                  scale: 0.8,
                  display: "none",
                },
              }}
              transition={{ duration: 0.4 }}
              initial={activeTab === tabKey ? "current" : "hidden"}
              animate={activeTab === tabKey ? "current" : "hidden"}
            >
              {tabs[tabKey]?.map((card, index) => (
                <CardContainer key={index}>
                  <Card className="group" $isAvailable={card.available}>
                    <CardImageContainer imageSrc={card.img}>
                      <CardRatingContainer>
                        <CardRating>
                          <StarIcon />
                          {Math.floor(card.rate)}
                        </CardRating>
                        <CardReview>({card.raters})</CardReview>
                      </CardRatingContainer>
                    </CardImageContainer>
                    <CardText>
                      <CardTitle>{card.name}</CardTitle>
                      <CardContent>{card.description}</CardContent>

                      {card.discountPercentage > 0 ? (
                        <>
                          {Language.price}:{" "}
                          <OriginalPrice>{card.price} TND</OriginalPrice>
                          <br />
                          <DiscountedPrice>
                            {(
                              card.price *
                              (1 - card.discountPercentage / 100)
                            ).toFixed(2)}{" "}
                            TND
                          </DiscountedPrice>{" "}
                          <DiscountBadge>
                            -{card.discountPercentage}%
                          </DiscountBadge>{" "}
                        </>
                      ) : (
                        <CardPrice>
                          {Language.price}: {card.price} TND
                        </CardPrice>
                      )}
                      <CardButton
                        $isAvailable={card.available}
                        disabled={!card.available}
                        onClick={() => handleAddToBasket(card)}
                      >
                        {Language.buy}
                      </CardButton>
                    </CardText>
                  </Card>
                </CardContainer>
              ))}
            </TabContent>
          ))}
        </ContentWithPaddingXl>
        <DecoratorBlob1 />
        <DecoratorBlob2 />
      </Container>

      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </AnimationRevealPage>
  );
};
