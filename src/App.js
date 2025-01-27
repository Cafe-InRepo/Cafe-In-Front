import React from "react";
import tw from "twin.macro";
import GlobalStyles from "styles/GlobalStyles";
import { css } from "styled-components/macro"; //eslint-disable-line
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ThankYouPage from "ThankYouPage.js";
import SliderCard from "./components/cards/ThreeColSlider.js";
import TabGrid from "components/cards/TabCardGrid.js";
import Orders from "components/features/DashedBorderSixFeatures";
import RatePage from "components/features/RatePage.js";
import PrivateRoute from "./components/privateRoute.js";
import LoginPage from "./pages/Login";
import translations from "app/language.js";
import { useSelector } from "react-redux";
import SectionSelector from "components/SectionsBobbles.js/DisplaySections.js";
import TipsPage from "components/features/TipsPage.js";
// import NotFoundPage from "./pages/NotFoundPage"; // Import the NotFoundPage component

// Move HighlightedText definition outside of the App component
const HighlightedText = tw.span`bg-primary-500 text-gray-100 px-4 transform -skew-x-12 inline-block`;

export default function App() {
  const t = useSelector((state) => state.language.language);
  const Language = translations[t];
  // Retrieve table info from Redux
  const tableNumber = useSelector((state) => state.table.tableNumber);
  const placeName = useSelector((state) => state.table.placeName);

  return (
    <>
      <GlobalStyles />
      <Router>
        <Routes>
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
            path="/order/tips/:orderId"
            element={
              <PrivateRoute>
                <TipsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <PrivateRoute>
                {/* <TabGrid
                  heading={
                    <>
                      {Language.menuCheck}{" "}
                      <HighlightedText>{Language.menu}</HighlightedText>
                    </>
                  }
                /> */}
                <SectionSelector
                  heading={
                    <>
                      Welcome to:
                      <HighlightedText>{placeName}</HighlightedText>
                    </>
                  }
                  subHeading={
                    <>
                      {Language.tabnum}:
                      <HighlightedText>{tableNumber}</HighlightedText>
                    </>
                  }
                />
              </PrivateRoute>
            }
          />
          <Route
            path="/categories/:categoryId"
            element={
              <>
                <TabGrid
                  heading={
                    <PrivateRoute>
                      {Language.menuCheck}{" "}
                      <HighlightedText>{Language.menu}</HighlightedText>
                    </PrivateRoute>
                  }
                />
              </>
            }
          />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/menu" />} />
          {/* <Route path="/404" element={<NotFoundPage />} /> */}
          <Route path="*" element={<Navigate to="/404" />} />{" "}
          {/* Catch-all route */}
        </Routes>
      </Router>
    </>
  );
}
