import React from "react";
import { motion } from "framer-motion";
import styled from "styled-components";
import tw from "twin.macro";
import { ReactComponent as FoodIcon } from "../images/dish.svg";
import { ReactComponent as CoffeeIcon } from "../images/coffee.svg";
import { ReactComponent as IceCreamIcon } from "../images/ice-cream.svg";

const LoadingContainer = styled.div`
  ${tw`flex justify-center items-center h-screen w-full bg-gray-100`}
`;

const Tray = styled(motion.div)`
  ${tw`relative flex justify-center items-center bg-white p-4 rounded-full shadow-lg`}
  width: 150px;
  height: 150px;
`;

const IconContainer = styled.div`
  ${tw`absolute`}
  width: 10px;
  height: 10px;
`;

const LoadingText = styled(motion.div)`
  ${tw`mt-4 text-lg font-semibold text-gray-700 text-center`}
`;

const trayVariants = {
  animate: {
    rotate: 360,
    transition: {
      rotate: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 3,
        ease: "linear",
      },
    },
  },
};

const textVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

const Loading = () => {
  return (
    <LoadingContainer>
      <div className="flex flex-col items-center">
        <Tray variants={trayVariants} initial="initial" animate="animate">
          <IconContainer
            style={{
              top: "10%",
              left: "40%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <FoodIcon />
          </IconContainer>
          <IconContainer
            style={{
              top: "41%",
              right: "30%",
              transform: "translate(-50%, 50%)",
            }}
          >
            <CoffeeIcon />
          </IconContainer>
          <IconContainer
            style={{
              top: "50%",
              left: "10%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <IceCreamIcon />
          </IconContainer>
        </Tray>
        <LoadingText
          initial="initial"
          animate="animate"
          variants={textVariants}
          transition={{ duration: 0.5, yoyo: Infinity, delay: 0.8 }}
        >
          Loading...
        </LoadingText>
      </div>
    </LoadingContainer>
  );
};

export default Loading;
