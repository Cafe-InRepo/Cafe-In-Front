import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { ReactComponent as CloseIcon } from "feather-icons/dist/icons/x.svg";
import { motion, AnimatePresence } from "framer-motion";

// Base styles
const ModalOverlay = tw.div`fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center`;
const ModalHeader = tw.div`flex justify-between items-center border-b border-gray-200 pb-3`;
const ModalTitle = tw.h2`text-xl font-bold text-gray-800`;
const ModalCloseButton = tw.button`text-gray-600 hover:text-gray-800 focus:outline-none`;
const ModalBody = tw.div`mt-4 text-gray-700 text-sm leading-relaxed`;
const ButtonGroup = tw.div`flex justify-end gap-4 mt-6`;
const RetryButton = tw.button`bg-primary-500 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded transition duration-200`;
const CancelButton = tw.button`bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded transition duration-200`;

// ✅ COMBINAISON styled + motion + tw
const ModalContainer = styled(motion.div)`
  ${tw`bg-white w-full max-w-md mx-auto rounded-2xl shadow-2xl p-6`}
`;

const ErrorModal = ({ error, closeModal, retryAction }) => {
  return (
    <AnimatePresence>
      <ModalOverlay>
        <ModalContainer
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ModalHeader>
            <ModalTitle>Erreur détectée</ModalTitle>
            <ModalCloseButton onClick={closeModal}>
              <CloseIcon />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>{error}</ModalBody>
          <ButtonGroup>
            {retryAction && (
              <RetryButton onClick={retryAction}>Réessayer</RetryButton>
            )}
            <CancelButton onClick={closeModal}>Fermer</CancelButton>
          </ButtonGroup>
        </ModalContainer>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default ErrorModal;
