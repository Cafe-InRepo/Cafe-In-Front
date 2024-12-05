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

  // Handle QR code login based on token from URL

  const handleQRLogin = useCallback(
    async (token) => {
      console.log(token);
      setIsLoading(true);
      setError("");

      try {
        const response = await axios.post(`${baseUrl}/auth/login-qr`, {
          token, // Send only the token
        });

        if (response.status === 200) {
          // Store the new token
          localStorage.setItem("tableToken", response.data.token);
          localStorage.setItem("tableNumber", response.data.tableNumber);
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
    },
    [navigate]
  ); // useCallback ensures this function is memoized and won't change unless navigate changes

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    if (token) {
      handleQRLogin(token); // Send only the token now
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
        {showModal && <ErrorModal error={error} closeModal={closeModal} />}{" "}
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
