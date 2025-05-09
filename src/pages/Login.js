import React, { useState, useEffect } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Container as ContainerBase } from "components/misc/Layouts";
import tw from "twin.macro";
import styled from "styled-components";
//import { css } from "styled-components/macro";
import qrIllustration from "images/qr-scan-illustration.png"; // Add this new image
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

  const handleQRLogin = useCallback(
    async (token) => {
      setError("");
      setIsLoading(true);

      try {
        const response = await axios.post(`${baseUrl}/auth/login-qr`, {
          token,
        });

        if (response.status === 200) {
          const { token: newToken, tableNumber, placeName } = response.data;
          dispatch(setTableInfo({ tableNumber, placeName }));
          TokenManager.setToken(newToken);
          navigate(`/menu`);
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
    [dispatch, navigate]
  );

  const retryLogin = () => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    if (token) {
      handleQRLogin(token);
    }
  };

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
