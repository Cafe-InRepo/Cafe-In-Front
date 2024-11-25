import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  width: 100vw;
  height: ${({ number }) => (number > 6 ? "100vh" : "50vh")};
`;

const BubbleWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 150px; /* Fixed height for grid cells */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const Bubble = styled.div`
  position: absolute;
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  background-color: ${({ color }) => color};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: white;
  cursor: pointer;
  animation: ${({ animationName }) => animationName}
    ${({ duration }) => `${duration}s`} ease-in-out infinite;
`;

const Bobbles = ({ sections, onBubbleClick }) => {
  const [bubbles, setBubbles] = useState([]);
  const [animations, setAnimations] = useState([]);

  useEffect(() => {
    const createRandomAnimations = () => {
      return sections.map(() => {
        const x1 = Math.random() * 40 - 20; // Random x movement (-20px to 20px)
        const y1 = Math.random() * 40 - 20; // Random y movement (-20px to 20px)
        const x2 = Math.random() * 40 - 20;
        const y2 = Math.random() * 40 - 20;

        return keyframes`
          0% { transform: translate(0, 0); }
          25% { transform: translate(${x1}px, ${y1}px); }
          50% { transform: translate(${x2}px, ${y2}px); }
          75% { transform: translate(${x1}px, ${y1}px); }
          100% { transform: translate(0, 0); }
        `;
      });
    };

    const createBubbles = () => {
      const generatedBubbles = sections.map((section) => ({
        id: section._id,
        name: section.name,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        size: 100, // Random size between 100px and 150px
        duration: 7, // Random duration between 2s and 5s
      }));
      setBubbles(generatedBubbles);
      setAnimations(createRandomAnimations());
    };

    createBubbles();
  }, [sections]);

  return (
    <Container number={sections.lenght}>
      {bubbles.map((bubble, index) => (
        <BubbleWrapper key={bubble.id}>
          <Bubble
            size={bubble.size}
            color={bubble.color}
            duration={bubble.duration}
            animationName={animations[index]}
            onClick={() => onBubbleClick(bubble.id)}
          >
            {bubble.name}
          </Bubble>
        </BubbleWrapper>
      ))}
    </Container>
  );
};

export default Bobbles;
