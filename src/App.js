import React from "react";
import tw from "twin.macro";
import GlobalStyles from "styles/GlobalStyles";
import { css } from "styled-components/macro"; //eslint-disable-line
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ComponentRenderer from "ComponentRenderer.js";
import MainLandingPage from "MainLandingPage.js";
import ThankYouPage from "ThankYouPage.js";
import SliderCard from "./components/cards/ThreeColSlider.js";
import TabGrid from "components/cards/TabCardGrid.js";
import Orders from "components/features/DashedBorderSixFeatures";
import RatePage from "components/features/RatePage.js";
import PrivateRoute from "./components/privateRoute.js";
import LoginPage from "./pages/Login";

export default function App() {
  const HighlightedText = tw.span`bg-primary-500 text-gray-100 px-4 transform -skew-x-12 inline-block`;

  return (
    <>
      <GlobalStyles />
      <Router>
        <Routes>
          <Route
            path="/components/:type/:subtype/:name"
            element={<ComponentRenderer />}
          />
          <Route
            path="/components/:type/:name"
            element={<ComponentRenderer />}
          />
          <Route
            path="/order/:orderId?"
            element={
              <PrivateRoute>
                <SliderCard />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            }
          />
          <Route
            path="/order/rate/:orderId"
            element={
              <PrivateRoute>
                <RatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <PrivateRoute>
                <TabGrid
                  heading={
                    <>
                      Checkout our <HighlightedText>menu.</HighlightedText>
                    </>
                  }
                />
              </PrivateRoute>
            }
          />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainLandingPage />} />
        </Routes>
      </Router>
    </>
  );
}
