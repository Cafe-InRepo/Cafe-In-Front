import React, { useState, useEffect, useCallback } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Container as ContainerBase } from "components/misc/Layouts";
import tw from "twin.macro";
import styled from "styled-components";
import illustration from "images/login-illustration.svg";
import logo from "images/logo.svg";
import { ReactComponent as LoginIcon } from "feather-icons/dist/icons/log-in.svg";
import axios from "axios";
import { baseUrl } from "helpers/BaseUrl";
import Loading from "helpers/Loading";
import { useNavigate, useLocation } from "react-router-dom";
import ErrorModal from "../helpers/modals/ErrorModal"; // Import your ErrorModal component
import { useSelector } from "react-redux";
import translations from "app/language";

const Container = tw(
  ContainerBase
)`min-h-screen bg-primary-900 text-white font-medium flex justify-center -m-8`;
const Content = tw.div`max-w-screen-xl m-0 sm:mx-20 sm:my-16 bg-white text-gray-900 shadow sm:rounded-lg flex justify-center flex-1`;
const MainContainer = tw.div`lg:w-1/2 xl:w-5/12 p-6 sm:p-12`;
const LogoLink = tw.a``;
const LogoImage = tw.img`h-12 mx-auto`;
const MainContent = tw.div`mt-12 flex flex-col items-center`;
const Heading = tw.h1`text-2xl xl:text-3xl font-extrabold`;
const FormContainer = tw.div`w-full flex-1 mt-8`;

const Form = tw.form`mx-auto max-w-xs`;
const Input = tw.input`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5 first:mt-0`;
const SubmitButton = styled.button`
  ${tw`mt-5 tracking-wide font-semibold bg-primary-500 text-gray-100 w-full py-4 rounded-lg hover:bg-primary-900 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none`}
  .icon {
    ${tw`w-6 h-6 -ml-2`}
  }
  .text {
    ${tw`ml-3`}
  }
`;
const IllustrationContainer = tw.div`sm:rounded-r-lg flex-1 bg-purple-100 text-center hidden lg:flex justify-center`;
const IllustrationImage = styled.div`
  ${(props) => `background-image: url("${props.imageSrc}");`}
  ${tw`m-12 xl:m-16 w-full max-w-sm bg-contain bg-center bg-no-repeat`}
`;
const ErrorMessage = tw.p`mt-6 text-xs text-red-600 text-center`;

const Login = ({
  logoLinkUrl = "#",
  illustrationImageSrc = illustration,
  headingText = "Sign In As Waiter",
  submitButtonText = "Sign In",
  SubmitButtonIcon = LoginIcon,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const t = useSelector((state) => state.language.language);
  const Language = translations[t];

  /**
   * Fetch the user's geolocation with proper error handling.
   */
  const getLocation = async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser.");
      }

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve({ lat: latitude, lon: longitude });
          },
          (error) => {
            reject(
              error.code === error.PERMISSION_DENIED
                ? "Location permission denied. Please enable location services."
                : "Unable to retrieve your location."
            );
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      });
    } catch (error) {
      console.error("Error accessing geolocation:", error);
      throw new Error(
        error.message ||
          "An unexpected error occurred while accessing location."
      );
    }
  };

  /**
   * Calculate the distance between two coordinates using the Haversine formula.
   */
  const calculateDistance = (loc1, loc2) => {
    const toRadians = (degree) => (degree * Math.PI) / 180;
    const R = 6371e3; // Earth's radius in meters
    const φ1 = toRadians(loc1.lat);
    const φ2 = toRadians(loc2.lat);
    const Δφ = toRadians(loc2.lat - loc1.lat);
    const Δλ = toRadians(loc2.lon - loc1.lon);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  /**
   * Handle QR code login using a token from the URL.
   */
  const handleQRLogin = useCallback(
    async (token) => {
      setError("");
      setIsLoading(true);

      try {
        const location = userLocation || (await getLocation());
        setUserLocation(location);

        const response = await axios.post(`${baseUrl}/auth/login-qr`, {
          token,
        });
        if (response.status === 200) {
          const distance = calculateDistance(
            location,
            response.data.placeLocation
          );

          if (distance > response.data.distance) {
            throw new Error("You are too far from the coffee shop to log in.");
          }

          localStorage.setItem("tableToken", response.data.token);
          localStorage.setItem("tableNumber", response.data.tableNumber);
          localStorage.setItem("placeName", response.data.placeName);
          navigate(`/menu`);
        }
      } catch (error) {
        setError(error.message || "An unexpected error occurred.");
        setShowModal(true);
      } finally {
        setIsLoading(false);
      }
    },
    [userLocation, navigate]
  );

  const handleRetry = async () => {
    setShowModal(false);
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    if (token) {
      await handleQRLogin(token);
    }
  };

  return (
    <AnimationRevealPage>
      <Container>
        <Content>
          <MainContainer>
            <LogoLink href={logoLinkUrl}>
              <LogoImage src={logo} />
            </LogoLink>
            <MainContent>
              <Heading>{headingText}</Heading>
              <FormContainer>
                {isLoading && <Loading />}
                {!isLoading && (
                  <Form>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <SubmitButton
                      type="button"
                      onClick={() => handleQRLogin("manual-login")}
                    >
                      <SubmitButtonIcon className="icon" />
                      <span className="text">{submitButtonText}</span>
                    </SubmitButton>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                  </Form>
                )}
              </FormContainer>
            </MainContent>
          </MainContainer>
          <IllustrationContainer>
            <IllustrationImage imageSrc={illustrationImageSrc} />
          </IllustrationContainer>
        </Content>
      </Container>
      <ErrorModal
        show={showModal}
        message={error}
        onRetry={handleRetry}
        onClose={() => setShowModal(false)}
      />
    </AnimationRevealPage>
  );
};

export default Login;
