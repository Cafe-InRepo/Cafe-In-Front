import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { ReactComponent as CloseIcon } from "feather-icons/dist/icons/x.svg";

const ModalOverlay = tw.div`fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center`;
const ModalContainer = tw.div`bg-white w-full max-w-md mx-auto rounded-lg shadow-lg p-6`;
const ModalHeader = tw.div`flex justify-between items-center`;
const ModalTitle = tw.h2`text-xl font-semibold text-gray-800`;
const ModalCloseButton = tw.button`text-gray-600 hover:text-gray-800 focus:outline-none`;

const ModalBody = tw.div`mt-4 text-sm text-gray-700`;
const ModalFooter = tw.div`mt-6 flex justify-end space-x-4`;
const ModalButton = tw.button`bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition duration-300`;

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>Confirm</ModalTitle>
          <ModalCloseButton onClick={onCancel}>
            <CloseIcon />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>{message}</ModalBody>
        <ModalFooter>
          <ModalButton onClick={onConfirm}>Yes</ModalButton>
          <ModalButton tw="ml-4 bg-gray-300 text-gray-700" onClick={onCancel}>
            No
          </ModalButton>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ConfirmationModal;
