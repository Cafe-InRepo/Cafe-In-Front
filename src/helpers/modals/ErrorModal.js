import React from "react";
import tw from "twin.macro";
import { ReactComponent as CloseIcon } from "feather-icons/dist/icons/x.svg";

const ModalOverlay = tw.div`fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center`;
const ModalContainer = tw.div`bg-white w-full max-w-md mx-auto rounded-lg shadow-lg p-6`;
const ModalHeader = tw.div`flex justify-between items-center`;
const ModalTitle = tw.h2`text-xl font-semibold text-gray-800`;
const ModalCloseButton = tw.button`text-gray-600 hover:text-gray-800 focus:outline-none`;

const ModalBody = tw.div`mt-4 text-sm text-gray-700`;

const ErrorModal = ({ error, closeModal, retryAction }) => {
  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>Error</ModalTitle>
          <ModalCloseButton onClick={closeModal}>
            <CloseIcon />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          {error}

          {retryAction && <button onClick={retryAction}>Retry</button>}
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ErrorModal;
