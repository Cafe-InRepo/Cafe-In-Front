import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import tw from "twin.macro";
import { baseUrl } from "helpers/BaseUrl";
import axios from "axios";
import Loading from "helpers/Loading";
import { GetToken } from "helpers/GetToken";
import { ReactComponent as StarIcon } from "feather-icons/dist/icons/star.svg";
import translations from "app/language";
import { useSelector } from "react-redux";

const Container = tw.div`relative min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8`;
const Card = tw.div`bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center`;
const Title = tw.h2`text-2xl font-bold mb-4`;
const ProductList = tw.ul`space-y-4`;
const ProductItem = tw.li`flex flex-col items-start`;
const ProductTitle = tw.h3`text-lg font-semibold`;
const StarContainer = tw.div`flex items-center mt-2`;
const SubmitButton = tw.button`mt-4 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition duration-300`;
const OrdersLink = tw(
  Link
)`mt-4 inline-block text-primary-500 hover:text-primary-700`;

const Star = styled(StarIcon)`
  ${tw`w-6 h-6 cursor-pointer transition duration-300`}
  ${({ active }) => active && tw`text-yellow-500`}
`;

const RatePage = () => {
  const { orderId } = useParams();
  // const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const token = GetToken(); // Retrieve the token
  const t = useSelector((state) => state.language.language);
  const Language = translations[t];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${baseUrl}/order/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrder(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching order:", error);
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token]);

  const handleRating = (productId, rate) => {
    setRatings({
      ...ratings,
      [productId]: rate,
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `${baseUrl}/order/${orderId}/rate`,
        { ratings },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await axios.put(
        `${baseUrl}/order/${orderId}`,
        { rated: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // navigate("/orders");
    } catch (error) {
      console.error("Error submitting ratings:", error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (order.rated) {
    return (
      <Container>
        <Card>
          <Title>{Language.thankYouForRating}!</Title>
          <OrdersLink to="/orders">{Language.goToMyOrders}</OrdersLink>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Title>{Language.rateYourProducts}</Title>
        <ProductList>
          {order.products.map(({ product }) => (
            <ProductItem key={product._id}>
              <ProductTitle>{product.name}</ProductTitle>
              <StarContainer>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    active={ratings[product._id] >= star ? "true" : undefined}
                    onClick={() => handleRating(product._id, star)}
                  />
                ))}
              </StarContainer>
            </ProductItem>
          ))}
        </ProductList>
        <SubmitButton onClick={handleSubmit}>
          {Language.rateSubmit}
        </SubmitButton>
      </Card>
    </Container>
  );
};

export default RatePage;
