import React, { useState, useEffect, useCallback } from "react";
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
import { useNavigate, useLocation } from "react-router-dom";
import ErrorModal from "../helpers/modals/ErrorModal";
import { useDispatch, useSelector } from "react-redux";
import translations from "app/language";
import { setTableInfo } from "features/TableSlice";
import { TokenManager } from "../utils/TokenManager";

// UI components (styled)
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

// Helper function for clear error messages
const getFriendlyErrorMessage = (error) => {
  if (!error) return "Une erreur inconnue est survenue.";
  if (typeof error === "string") return error;

  if (error.message) {
    if (error.message.includes("Network Error"))
      return "Erreur réseau : vérifiez votre connexion Internet.";
    if (error.message.includes("timeout"))
      return "La requête a expiré. Réessayez.";
  }

  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Accès à la localisation refusé. Activez-le dans les paramètres du navigateur.";
    case error.POSITION_UNAVAILABLE:
      return "Position indisponible. Essayez à l'extérieur.";
    case error.TIMEOUT:
      return "Temps d'attente dépassé pour la localisation.";
    default:
      return "Erreur inattendue. Veuillez réessayer.";
  }
};

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  //const [userLocation, setUserLocation] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const t = useSelector((state) => state.language.language);
  const Language = translations[t];
  const dispatch = useDispatch();

  const LOCATION_ACCURACY_THRESHOLD = 50; // meters
  //const MAX_ALLOWED_DISTANCE = 100; // meters (adjust based on coffee shop size)

  const getAccurateLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      let bestResult = null;
      let attempts = 0;
      const maxAttempts = 5;
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          attempts++;
          const { latitude, longitude, accuracy } = position.coords;

          // Accept if accuracy is good enough
          if (accuracy <= LOCATION_ACCURACY_THRESHOLD) {
            navigator.geolocation.clearWatch(watchId);
            resolve({
              lat: latitude,
              lon: longitude,
              accuracy: accuracy,
            });
            return;
          }

          // Track best result so far
          if (!bestResult || accuracy < bestResult.accuracy) {
            bestResult = {
              lat: latitude,
              lon: longitude,
              accuracy: accuracy,
            };
          }

          // After max attempts, return best result
          if (attempts >= maxAttempts) {
            navigator.geolocation.clearWatch(watchId);
            if (bestResult) {
              resolve(bestResult);
            } else {
              reject(new Error("Could not get accurate location"));
            }
          }
        },
        (error) => {
          navigator.geolocation.clearWatch(watchId);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );
    });
  };

  // Improved distance calculation
  const calculateDistance = (loc1, loc2) => {
    if (
      !loc1 ||
      !loc2 ||
      loc1.lat == null ||
      loc1.lon == null ||
      loc2.lat == null ||
      loc2.long == null
    ) {
      return null;
    }

    const R = 6371e3; // Earth radius in meters
    const φ1 = (loc1.lat * Math.PI) / 180;
    const φ2 = (loc2.lat * Math.PI) / 180;
    const Δφ = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const Δλ = ((loc2.long - loc1.lon) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Retry logic for rescan button
  const retryLogin = async () => {
    setShowModal(false);
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    if (token) await handleQRLogin(token);
  };

  // QR Token login logic
  const handleQRLogin = useCallback(
    async (token) => {
      setError("");
      setIsLoading(true);

      try {
        const currentLocation = await getAccurateLocation();

        //setUserLocation(currentLocation);

        const response = await axios.post(`${baseUrl}/auth/login-qr`, {
          token,
        });

        if (response.status === 200) {
          alert(currentLocation.lat);
          alert(currentLocation.lon);
          const distance = calculateDistance(
            currentLocation,
            response.data.placeLocation
          );
          alert("calculated distance");
          alert(distance);
          alert("saved distance");
          alert(response.data.distance);
          if (distance === null) {
            throw new Error("Missing location data");
          }

          // Check if accuracy is good enough
          if (currentLocation.accuracy > LOCATION_ACCURACY_THRESHOLD) {
            throw new Error("Location reading not precise enough");
          }

          // Check distance with buffer for GPS inaccuracy
          if (distance > response.data.distance + currentLocation.accuracy) {
            throw new Error("You are too far from the coffee shop");
          }
          // if (distance > response.data.distance) {
          //   setError("Vous êtes trop loin du restaurant pour vous connecter.");
          //   setShowModal(true);
          //   return;
          // }

          const { token: newToken, tableNumber, placeName } = response.data;
          dispatch(setTableInfo({ tableNumber, placeName }));
          TokenManager.setToken(newToken);
          navigate("/menu");
        } else {
          setError("Erreur inattendue, veuillez réessayer.");
          setShowModal(true);
        }
      } catch (error) {
        console.error("Login error:", error);
        setError(getFriendlyErrorMessage(error));
        setShowModal(true);
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, navigate]
  );

  const closeModal = () => setShowModal(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    if (token) {
      handleQRLogin(token);
    }
  }, [location.search, handleQRLogin]);

  if (isLoading) return <Loading />;

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
                {Language.qrRescanTitle || "Veuillez rescanner votre QR Code"}
              </Heading>
              <Description>
                {Language.qrRescanDescription ||
                  "Tenez votre appareil droit et alignez le QR Code dans le cadre pour continuer."}
              </Description>

              <RescanButton onClick={retryLogin}>
                <ScanIcon className="icon" />
                {Language.rescanButton || "Rescanner le QR Code"}
              </RescanButton>

              <HelpLink href="#">
                {Language.needHelp || "Besoin d'aide ?"}
              </HelpLink>
            </MainContent>
          </MainContainer>
        </Content>
      </Container>
    </AnimationRevealPage>
  );
};

export default Login;
