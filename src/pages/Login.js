import React, { useState, useEffect } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Container as ContainerBase } from "components/misc/Layouts";
import tw from "twin.macro";
import styled from "styled-components";
import qrIllustration from "images/qr-scan-illustration.png";
import logo from "images/logo-.png";
import { ReactComponent as ScanIcon } from "feather-icons/dist/icons/camera.svg";
import axios from "axios";
import { baseUrl } from "helpers/BaseUrl";
import Loading from "helpers/Loading";
import { useNavigate } from "react-router-dom";
import ErrorModal from "../helpers/modals/ErrorModal";
import { useDispatch, useSelector } from "react-redux";
import translations from "app/language";
import { useLocation } from "react-router-dom";
import { useCallback } from "react";
import { setTableInfo } from "features/TableSlice";
import { TokenManager } from "../utils/TokenManager";

// Updated container styles for QR rescan page
const Container = tw(
  ContainerBase
)`min-h-screen bg-gradient-to-b from-primary-500 to-primary-700 text-white font-medium flex justify-center -m-8`;
const Content = tw.div`max-w-screen-xl m-0 sm:mx-20 sm:my-16 bg-white text-gray-900 shadow-lg sm:rounded-xl flex justify-center flex-1`;
const MainContainer = tw.div`w-full p-6 sm:p-12 flex flex-col items-center`;
const LogoLink = tw.a``;
const LogoImage = tw.img`h-12 mx-auto`;
const MainContent = tw.div`mt-8 flex flex-col items-center w-full`;
const Heading = tw.h1`text-2xl xl:text-3xl font-extrabold text-center`;
const QRIllustration = tw.img`w-64 h-64 mb-8 animate-pulse`;
const Description = tw.p`text-gray-600 text-center mb-8 max-w-md`;
const RescanButton = styled.button`
  ${tw`mt-4 tracking-wide font-semibold bg-primary-500 text-white w-full py-4 rounded-lg hover:bg-primary-600 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none`}
  .icon {
    ${tw`w-5 h-5 mr-2`}
  }
`;
const HelpLink = tw.a`text-sm text-primary-500 hover:underline mt-4`;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const t = useSelector((state) => state.language.language);
  const Language = translations[t];
  const dispatch = useDispatch();
  const [userLocation, setUserLocation] = useState(null);

  // Function to get user's location
  const getUserLocation = async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser.");
      }

      return new Promise((resolve, reject) => {
        if ("permissions" in navigator && navigator.permissions.query) {
          navigator.permissions
            .query({ name: "geolocation" })
            .then((permissionStatus) => {
              if (
                permissionStatus.state === "granted" ||
                permissionStatus.state === "prompt"
              ) {
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
              } else if (permissionStatus.state === "denied") {
                reject(
                  "Location access is denied. Please enable location services in your browser settings."
                );
              }

              permissionStatus.onchange = () => {
                console.log(
                  "Permission state changed to:",
                  permissionStatus.state
                );
              };
            });
        } else {
          // Fallback for browsers without Permissions API
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
        }
      });
    } catch (error) {
      console.error("Error accessing geolocation:", error);
      throw new Error(
        error.message ||
          "An unexpected error occurred while accessing location."
      );
    }
  };

  // Function to calculate distance using Haversine formula
  const calculateDistance = (loc1, loc2) => {
    const toRadians = (degree) => (degree * Math.PI) / 180;
    const R = 6371e3; // Radius of Earth in meters
    const φ1 = toRadians(loc1.lat);
    const φ2 = toRadians(loc2.lat);
    const Δφ = toRadians(loc2.lat - loc1.lat);
    const Δλ = toRadians(loc2.long - loc1.lon);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Retry function to allow user to try enabling location services again
  const retryLogin = async () => {
    setShowModal(false); // Close the modal
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    if (token) {
      await handleQRLogin(token);
    }
  };

  const handleQRLogin = useCallback(
    async (token) => {
      setError("");
      setIsLoading(true);

      try {
        // Ensure location is available
        const location = userLocation || (await getUserLocation());
        setUserLocation(location);

        // Proceed with QR login
        const response = await axios.post(`${baseUrl}/auth/login-qr`, {
          token,
        });

        if (response.status === 200) {
          // Check distance
          const distance = calculateDistance(
            location,
            response.data.placeLocation
          );

          if (distance > response.data.distance) {
            setError("You are too far from the coffee shop to log in.");
            setShowModal(true);
            return;
          }

          // Successful login
          const { token: newToken, tableNumber, placeName } = response.data;
          dispatch(setTableInfo({ tableNumber, placeName }));
          TokenManager.setToken(newToken);
          navigate("/menu");
        } else {
          setError("An error occurred, please try again.");
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error logging in:", error.message);
        setError(error.message || "Login failed");
        setShowModal(true);
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, navigate, userLocation]
  );

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    if (token) {
      handleQRLogin(token);
    }
  }, [location.search, handleQRLogin]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <AnimationRevealPage>
      <Container>
        {showModal && (
          <ErrorModal
            error={error}
            closeModal={closeModal}
            retryAction={retryLogin}
          />
        )}
        <Content>
          <MainContainer>
            <LogoLink href="#">
              <LogoImage src={logo} />
            </LogoLink>

            <MainContent>
              <QRIllustration src={qrIllustration} alt="Scan QR Code" />

              <Heading>
                {Language.qrRescanTitle || "Please Rescan Your QR Code"}
              </Heading>

              <Description>
                {Language.qrRescanDescription ||
                  "Hold your device steady and align the QR code within the frame to continue"}
              </Description>

              <RescanButton onClick={retryLogin}>
                <ScanIcon className="icon" />
                {Language.rescanButton || "Rescan QR Code"}
              </RescanButton>

              <HelpLink href="#">
                {Language.needHelp || "Need help scanning?"}
              </HelpLink>
            </MainContent>
          </MainContainer>
        </Content>
      </Container>
    </AnimationRevealPage>
  );
};

export default Login;
