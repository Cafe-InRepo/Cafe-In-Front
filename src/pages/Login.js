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

  // deepseek try
  const LOCATION_ACCURACY_THRESHOLD = 50; // meters
  // const getAccurateLocation = async () => {
  //   return new Promise((resolve, reject) => {
  //     if (!navigator.geolocation) {
  //       reject(new Error("Geolocation not supported"));
  //       return;
  //     }

  //     let bestResult = null;
  //     let attempts = 0;
  //     const maxAttempts = 5;
  //     const watchId = navigator.geolocation.watchPosition(
  //       (position) => {
  //         attempts++;
  //         const { latitude, longitude, accuracy } = position.coords;

  //         // Accept if accuracy is good enough
  //         if (accuracy <= LOCATION_ACCURACY_THRESHOLD) {
  //           navigator.geolocation.clearWatch(watchId);
  //           resolve({
  //             lat: latitude,
  //             lon: longitude,
  //             accuracy: accuracy,
  //           });
  //           return;
  //         }

  //         // Track best result so far
  //         if (!bestResult || accuracy < bestResult.accuracy) {
  //           bestResult = {
  //             lat: latitude,
  //             lon: longitude,
  //             accuracy: accuracy,
  //           };
  //         }

  //         // After max attempts, return best result
  //         if (attempts >= maxAttempts) {
  //           navigator.geolocation.clearWatch(watchId);
  //           if (bestResult) {
  //             resolve(bestResult);
  //           } else {
  //             reject(new Error("Could not get accurate location"));
  //           }
  //         }
  //       },
  //       (error) => {
  //         navigator.geolocation.clearWatch(watchId);
  //         reject(error);
  //       },
  //       {
  //         enableHighAccuracy: true,
  //         maximumAge: 0,
  //         timeout: 10000,
  //       }
  //     );
  //   });
  // };

  //
  // Get geolocation with permission handling
  // const getUserLocation = async () => {
  //   try {
  //     if (!navigator.geolocation) {
  //       throw new Error("Votre navigateur ne supporte pas la géolocalisation.");
  //     }

  //     return new Promise((resolve, reject) => {
  //       if ("permissions" in navigator && navigator.permissions.query) {
  //         navigator.permissions
  //           .query({ name: "geolocation" })
  //           .then((status) => {
  //             if (status.state === "granted" || status.state === "prompt") {
  //               navigator.geolocation.getCurrentPosition(
  //                 (pos) => {
  //                   const { latitude, longitude } = pos.coords;
  //                   resolve({ lat: latitude, lon: longitude });
  //                 },
  //                 (err) => reject(err),
  //                 { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  //               );
  //             } else {
  //               reject({ code: 1 }); // PERMISSION_DENIED
  //             }
  //           });
  //       } else {
  //         // Fallback
  //         navigator.geolocation.getCurrentPosition(
  //           (pos) => {
  //             const { latitude, longitude } = pos.coords;
  //             resolve({ lat: latitude, lon: longitude });
  //           },
  //           (err) => reject(err),
  //           { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  //         );
  //       }
  //     });
  //   } catch (error) {
  //     throw new Error(error.message || "Erreur d'accès à la géolocalisation.");
  //   }
  // };
  // const calculateDistance = (loc1, loc2) => {
  //   if (
  //     !loc1 ||
  //     !loc2 ||
  //     loc1.lat == null ||
  //     loc1.lon == null ||
  //     loc2.lat == null ||
  //     loc2.lon == null
  //   ) {
  //     return null;
  //   }

  //   const R = 6371e3; // Earth radius in meters
  //   const φ1 = (loc1.lat * Math.PI) / 180;
  //   const φ2 = (loc2.lat * Math.PI) / 180;
  //   const Δφ = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  //   const Δλ = ((loc2.lon - loc1.lon) * Math.PI) / 180;

  //   const a =
  //     Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
  //     Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  //   return R * c;
  // };
  // Distance calculator (Haversine) – DO NOT modify this line:
  // const calculateDistance = (loc1, loc2) => {
  //   const toRadians = (degree) => (parseFloat(degree) * Math.PI) / 180;

  //   if (
  //     !loc1 ||
  //     !loc2 ||
  //     loc1.lat == null ||
  //     loc1.lon == null ||
  //     loc2.lat == null ||
  //     loc2.long == null
  //   ) {
  //     console.warn(
  //       "Missing latitude or longitude data for distance calculation."
  //     );
  //     return null; // or throw an error if you prefer to handle it explicitly
  //   }

  //   const R = 6371e3; // Earth radius in meters
  //   const φ1 = toRadians(loc1.lat);
  //   const φ2 = toRadians(loc2.lat);
  //   const Δφ = toRadians(loc2.lat - loc1.lat);
  //   const Δλ = toRadians(loc2.long - loc1.lon);

  //   const a =
  //     Math.sin(Δφ / 2) ** 2 +
  //     Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  //   return R * c; // distance in meters
  // };

  // Retry logic for rescan button
  const retryLogin = async () => {
    setShowModal(false);
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    if (token) await handleQRLogin(token);
  };

  // QR Token login logic
  // const handleQRLogin = useCallback(
  //   async (token) => {
  //     setError("");
  //     setIsLoading(true);

  //     try {
  //       const currentLocation = await getAccurateLocation();
  //       setUserLocation(currentLocation);

  //       const response = await axios.post(`${baseUrl}/auth/login-qr`, {
  //         token,
  //       });

  //       if (response.status === 200) {
  //         alert(currentLocation.lat);
  //         alert(currentLocation.lon);
  //         const savedLocation = response.data.placeLocation;

  //         const distance = calculateDistance(currentLocation, savedLocation);
  //         if (distance === null) {
  //           setError(
  //             "Données de localisation manquantes. Impossible de vérifier la distance."
  //           );
  //           setShowModal(true);
  //           return;
  //         }
  //         alert("calculated distance");
  //         alert(distance);
  //         alert("saved distance");
  //         alert(response.data.distance);
  //         if (distance > response.data.distance) {
  //           setError("Vous êtes trop loin du restaurant pour vous connecter.");
  //           setShowModal(true);
  //           return;
  //         }

  //         const { token: newToken, tableNumber, placeName } = response.data;
  //         dispatch(setTableInfo({ tableNumber, placeName }));
  //         TokenManager.setToken(newToken);
  //         navigate("/menu");
  //       } else {
  //         setError("Erreur inattendue, veuillez réessayer.");
  //         setShowModal(true);
  //       }
  //     } catch (error) {
  //       console.error("Login error:", error);
  //       setError(getFriendlyErrorMessage(error));
  //       setShowModal(true);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   },
  //   [dispatch, navigate]
  // );
  const MAX_LOCATION_ATTEMPTS = 5;
  const MAX_ALLOWED_DISTANCE = 100; // meters (adjust based on coffee shop size)
  const LOCATION_TIMEOUT = 10000; // 10 seconds

  const handleQRLogin = useCallback(
    async (token) => {
      setError("");
      setIsLoading(true);

      try {
        // 1. Get accurate user location
        const getAccurateLocation = async () => {
          return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error("Geolocation not supported"));
              return;
            }

            let bestResult = null;
            let attempts = 0;

            const watchId = navigator.geolocation.watchPosition(
              (position) => {
                attempts++;
                const { latitude, longitude, accuracy } = position.coords;

                console.log(`Location attempt ${attempts}:`, {
                  latitude,
                  longitude,
                  accuracy,
                });

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
                if (attempts >= MAX_LOCATION_ATTEMPTS) {
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
                timeout: LOCATION_TIMEOUT,
              }
            );
          });
        };

        const currentLocation = await getAccurateLocation();
        //setUserLocation(currentLocation);

        // 2. Verify location with server
        const response = await axios.post(`${baseUrl}/auth/login-qr`, {
          token,
          currentLocation: {
            latitude: currentLocation.lat,
            longitude: currentLocation.lon,
            accuracy: currentLocation.accuracy,
          },
        });

        if (response.status === 200) {
          const {
            token: authToken,
            tableNumber,
            placeName,
            placeLocation,
            allowedDistance = MAX_ALLOWED_DISTANCE,
          } = response.data;

          // 3. Calculate distance to coffee shop
          const calculateDistance = (loc1, loc2) => {
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

          const savedLocation = {
            lat: placeLocation.latitude,
            lon: placeLocation.longitude,
          };

          const distance = calculateDistance(currentLocation, savedLocation);
          alert(distance);
          console.log("Distance calculation:", {
            currentLocation,
            savedLocation,
            distance,
            accuracy: currentLocation.accuracy,
            allowedDistance,
          });

          // 4. Validate the distance
          if (distance === null) {
            throw new Error("Could not calculate distance");
          }

          if (currentLocation.accuracy > LOCATION_ACCURACY_THRESHOLD) {
            throw new Error(
              "Your location reading isn't precise enough. Please try again."
            );
          }

          // Add buffer for GPS inaccuracy
          const effectiveAllowedDistance =
            allowedDistance + currentLocation.accuracy;

          if (distance > effectiveAllowedDistance) {
            throw new Error(
              `You're ${Math.round(distance)}m away from ${placeName}. ` +
                `Must be within ${allowedDistance}m to connect.`
            );
          }

          // 5. Complete login
          dispatch(setTableInfo({ tableNumber, placeName }));
          TokenManager.setToken(authToken);
          navigate("/menu");
        } else {
          throw new Error(response.data?.message || "Login failed");
        }
      } catch (error) {
        console.error("QR Login Error:", error);

        let friendlyError = "An error occurred during login";

        if (error.message.includes("timeout")) {
          friendlyError =
            "Location detection timed out. Please try again in an open area.";
        } else if (error.message.includes("denied")) {
          friendlyError =
            "Location access was denied. Please enable location services.";
        } else if (
          error.message.includes("Distance") ||
          error.message.includes("away from")
        ) {
          friendlyError = error.message; // Use the exact distance message
        } else {
          friendlyError = getFriendlyErrorMessage(error);
        }

        setError(friendlyError);
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
