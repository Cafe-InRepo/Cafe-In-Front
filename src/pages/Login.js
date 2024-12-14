import React, { useState, useEffect } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Container as ContainerBase } from "components/misc/Layouts";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line
import illustration from "images/login-illustration.svg";
import logo from "images/logo.svg";
import { ReactComponent as LoginIcon } from "feather-icons/dist/icons/log-in.svg";
import axios from "axios";
import { baseUrl } from "helpers/BaseUrl";
import Loading from "helpers/Loading";
import { useNavigate } from "react-router-dom";
import ErrorModal from "../helpers/modals/ErrorModal"; // Import your ErrorModal component
import { useSelector } from "react-redux";
import translations from "app/language";
import { useLocation } from "react-router-dom";
import { useCallback } from "react";
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
  forgotPasswordUrl = "#",
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); // State to control modal display
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get URL params
  const t = useSelector((state) => state.language.language);
  const Language = translations[t];
  const [userLocation, setUserLocation] = useState(null);
  const [placeLocation, setPlaceLocation] = useState(null);

  // Function to get user's location
  const getUserLocation = async () => {
    try {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        setShowModal(true);
        return;
      }

      // Check if the Permissions API is supported
      if ("permissions" in navigator && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({
          name: "geolocation",
        });
        console.log(permissionStatus);
        alert(permissionStatus.state);
        if (permissionStatus.state === "granted") {
          // Permission granted, get the location
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log(position.coords);
              const { latitude, longitude } = position.coords;
              setUserLocation({ lat: latitude, lon: longitude });
              console.log(userLocation);
            },
            (error) => {
              console.error("Error retrieving location:", error);
              setError("Unable to retrieve your location.");
              setShowModal(true);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
        } else if (permissionStatus.state === "prompt") {
          // Permission prompt, request location access
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ lat: latitude, lon: longitude });
            },
            (error) => {
              if (error.code === error.PERMISSION_DENIED) {
                setError(
                  "Location permission denied. Please enable location services to proceed."
                );
              } else {
                setError("Unable to retrieve your location.");
              }
              setShowModal(true);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
        } else if (permissionStatus.state === "denied") {
          // Permission denied
          setError(
            "Location access is denied. Please enable location services in your browser settings and try again."
          );
          setShowModal(true);
        }

        // Listen for permission state changes
        permissionStatus.onchange = () => {
          console.log("Permission state changed to:", permissionStatus.state);
        };
      } else {
        // Fallback for browsers without Permissions API
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lon: longitude });
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              setError(
                "Location permission denied. Please enable location services to proceed."
              );
            } else {
              setError("Unable to retrieve your location.");
            }
            setShowModal(true);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }
    } catch (error) {
      console.error("Error accessing geolocation:", error);
      setError("An unexpected error occurred while accessing location.");
      setShowModal(true);
    }
  };

  // Retry function to allow user to try enabling location services again
  const retryLogin = async () => {
    setShowModal(false); // Close the modal
    await getUserLocation();

    if (userLocation) {
      // Retry the login process (QR or manual login) after location is fetched
      const query = new URLSearchParams(location.search);
      const token = query.get("token");

      if (token) {
        handleQRLogin(token);
      } else {
        handleSubmit(); // For manual login retry
      }
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
  // Handle QR code login based on token from URL

  const handleQRLogin = useCallback(
    async (token) => {
      const getUserLocation = async () => {
        try {
          if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setShowModal(true);
            return;
          }

          // Check if the Permissions API is supported
          if ("permissions" in navigator && navigator.permissions.query) {
            const permissionStatus = await navigator.permissions.query({
              name: "geolocation",
            });
            console.log(permissionStatus);
            alert(permissionStatus.state);
            if (permissionStatus.state === "granted") {
              // Permission granted, get the location
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  console.log(position.coords);
                  const { latitude, longitude } = position.coords;
                  alert(latitude);
                  alert(longitude);

                  setUserLocation({ lat: latitude, lon: longitude });
                  console.log(userLocation);
                },
                (error) => {
                  console.error("Error retrieving location:", error);
                  setError("Unable to retrieve your location.");
                  setShowModal(true);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
              );
            } else if (permissionStatus.state === "prompt") {
              // Permission prompt, request location access
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  setUserLocation({ lat: latitude, lon: longitude });
                },
                (error) => {
                  if (error.code === error.PERMISSION_DENIED) {
                    setError(
                      "Location permission denied. Please enable location services to proceed."
                    );
                  } else {
                    setError("Unable to retrieve your location.");
                  }
                  setShowModal(true);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
              );
            } else if (permissionStatus.state === "denied") {
              // Permission denied
              setError(
                "Location access is denied. Please enable location services in your browser settings and try again."
              );
              setShowModal(true);
            }

            // Listen for permission state changes
            permissionStatus.onchange = () => {
              console.log(
                "Permission state changed to:",
                permissionStatus.state
              );
            };
          } else {
            // Fallback for browsers without Permissions API
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lon: longitude });
              },
              (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                  setError(
                    "Location permission denied. Please enable location services to proceed."
                  );
                } else {
                  setError("Unable to retrieve your location.");
                }
                setShowModal(true);
              },
              { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
          }
        } catch (error) {
          console.error("Error accessing geolocation:", error);
          setError("An unexpected error occurred while accessing location.");
          setShowModal(true);
        }
      };
      setError("");
      setIsLoading(true);

      try {
        // Ensure location is enabled and available
        if (!userLocation) {
          await getUserLocation();
          return;
        }

        // Proceed with QR login
        const response = await axios.post(`${baseUrl}/auth/login-qr`, {
          token,
        });
        if (response.status === 200) {
          setPlaceLocation(response.data.placeLocation);
          prompt("location", response.data.placeLocation.long);
          // Check distance
          const distance = calculateDistance(userLocation, placeLocation);
          prompt("distance", distance);
          if (distance > 30) {
            setError("You are too far from the coffee shop to log in.");
            setShowModal(true);
            return;
          }
          if (distance < 30) {
            localStorage.setItem("tableToken", response.data.token);
            localStorage.setItem("tableNumber", response.data.tableNumber);
            localStorage.setItem("placeName", response.data.placeName);
            navigate(`/menu`);
          } else {
            setError("an error occured please try again.");
            setShowModal(true);
          }
        }
      } catch (error) {
        console.error(
          "Error logging in:",
          error.response?.data?.msg || error.message
        );
        setError(error.response?.data?.msg || "Login failed");
        setShowModal(true);
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, userLocation, placeLocation]
  );

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    if (token) {
      handleQRLogin(token);
    }
  }, [location.search, handleQRLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${baseUrl}/auth/login-table`, {
        email,
        password,
      });

      if (response.status === 200) {
        // Store the new token
        localStorage.setItem("tableToken", response.data.token);
        navigate(`/menu`);
      }
    } catch (error) {
      console.error(
        "Error logging in:",
        error.response?.data?.msg || error.message
      );
      setError(error.response?.data?.msg || "Login failed");
      setShowModal(true); // Show modal on error
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

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
            retryAction={retryLogin} // Pass the retry function to the modal
          />
        )}{" "}
        <Content>
          <MainContainer>
            <LogoLink href={logoLinkUrl}>
              <LogoImage src={logo} />
            </LogoLink>
            <MainContent>
              <Heading>{headingText}</Heading>
              <FormContainer>
                <Form onSubmit={handleSubmit}>
                  <Input
                    type="email"
                    placeholder={Language.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder={Language.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <SubmitButton type="submit" disabled={isLoading}>
                    <SubmitButtonIcon className="icon" />
                    <span className="text">{submitButtonText}</span>
                  </SubmitButton>
                </Form>
                <ErrorMessage>{error}</ErrorMessage>{" "}
                <p tw="mt-6 text-xs text-gray-600 text-center">
                  <a
                    href={forgotPasswordUrl}
                    tw="border-b border-gray-500 border-dotted"
                  >
                    Forgot Password?
                  </a>
                </p>
              </FormContainer>
            </MainContent>
          </MainContainer>
          <IllustrationContainer>
            <IllustrationImage imageSrc={illustrationImageSrc} />
          </IllustrationContainer>
        </Content>
      </Container>
    </AnimationRevealPage>
  );
};

export default Login;
