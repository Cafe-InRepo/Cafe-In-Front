import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { baseUrl } from "helpers/BaseUrl";
import Loading from "helpers/Loading";
import ErrorModal from "helpers/modals/ErrorModal";
import { GetToken } from "helpers/GetToken";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import { ReactComponent as SvgDecoratorBlob1 } from "images/svg-decorator-blob-5.svg";
import { ReactComponent as SvgDecoratorBlob2 } from "images/svg-decorator-blob-7.svg";
import { Container } from "components/misc/Layouts";
import Nav from "components/hero/Nav";
import tw from "twin.macro";
import { SectionHeading } from "components/misc/Headings";
import Bobbles from "./bobbles";

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two equal-width columns */
  justify-items: center;
  paddingBottom :200px;
`;

// const Bubble = styled.div`
//   width: ${({ size }) => `${size}px`};
//   height: ${({ size }) => `${size}px`};
//   background-color: ${({ bgColor }) => bgColor};
//   border-radius: 50%;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   color: white;
//   font-weight: bold;
//   text-align: center;
//   cursor: pointer;
//   transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;

//   &:hover {
//     transform: scale(1.2);
//     box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
//   }
// `;
const DecoratorBlob1 = styled(SvgDecoratorBlob1)`
  ${tw`pointer-events-none -z-20 absolute right-0 top-0 h-64 w-64 opacity-15 transform translate-x-2/3 -translate-y-12 text-pink-400`}
`;
const DecoratorBlob2 = styled(SvgDecoratorBlob2)`
  ${tw`pointer-events-none -z-20 absolute left-0 bottom-0 h-80 w-80 opacity-15 transform -translate-x-2/3 text-primary-500`}
`;
const Header = tw(SectionHeading)`mt-8`;

const SectionSelector = ({ heading }) => {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = GetToken();

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await axios.get(`${baseUrl}/sections`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSections(response.data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch sections. Please try again.");
        setIsLoading(false);
      }
    };

    fetchSections();
  }, [token]); // Include 'token' as a dependency

  const handleSectionClick = (sectionId) => {
    navigate(`/categories/${sectionId}`);
  };

  // const getRandomColor = () => {
  //   const colors = ["#6366F1", "#34D399", "#F87171", "#FBBF24", "#60A5FA"];
  //   return colors[Math.floor(Math.random() * colors.length)];
  // };

  // const getRandomSize = () => {
  //   // Generate random sizes for the bubbles (range: 100px to 150px).
  //   return Math.random() * 50 + 100;
  // };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorModal message={error} onClose={() => setError(null)} />;
  }

  return (
    <AnimationRevealPage>
      <Nav />
      <Container>
        <Header>{heading}</Header>

        <GridWrapper style={{ marginBottom: "40%" }}>
          {/* {sections?.map((section, index) => (
            <Bubble
              key={index}
              bgColor={getRandomColor()}
              size={getRandomSize()}
              onClick={() => handleSectionClick(section._id)}
            >
              {section.name}
            </Bubble>
          ))} */}
          <Bobbles onBubbleClick={handleSectionClick} sections={sections} />
        </GridWrapper>
        <DecoratorBlob1 />
        <DecoratorBlob2 />
      </Container>
    </AnimationRevealPage>
  );
};

export default SectionSelector;
