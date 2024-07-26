// src/components/LanguageSelector.js
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import tw from "twin.macro";
import { changeLanguage } from "features/languageSlice";

const SelectContainer = styled.div`
  ${tw`relative inline-block mr-6`}
`;

const Select = styled.select`
  ${tw`appearance-none border border-primary-500 rounded px-4 py-2 bg-white text-primary-700`}
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  padding-right: 2.5rem; /* Space for the custom arrow */

  &:focus {
    ${tw`border-primary-700`}
  }

  &:hover {
    ${tw`border-primary-600`}
  }
`;

const Arrow = styled.div`
  ${tw`absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none`}
  svg {
    ${tw`w-4 h-4 text-primary-700`}
  }
`;

const LanguageSelector = () => {
  const dispatch = useDispatch();
  const currentLanguage = useSelector((state) => state.language.language);

  const handleLanguageChange = (event) => {
    dispatch(changeLanguage(event.target.value));
  };

  return (
    <SelectContainer>
      <Select value={currentLanguage} onChange={handleLanguageChange}>
        <option value="English">English</option>
        <option value="French">Français</option>
        <option value="Italian">Italiano</option>
      </Select>
      <Arrow>
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v12a1 1 0 01-2 0V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      </Arrow>
    </SelectContainer>
  );
};

export default LanguageSelector;
