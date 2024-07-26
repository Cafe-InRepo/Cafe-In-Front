import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line
import translations from "app/language.js";
import Header, {
  LogoLink,
  NavLinks,
  NavLink as NavLinkBase,
} from "../headers/light.js";
import { useSelector } from "react-redux";

const StyledHeader = styled(Header)`
  ${tw`justify-between`}
  ${LogoLink} {
    ${tw`mr-8 pb-0`}
  }
`;

const NavLink = tw(NavLinkBase)`
  sm:text-sm sm:mx-6
`;

const Container = tw.div`relative -mx-8 -mt-8`;
const TwoColumn = tw.div`flex flex-col lg:flex-row bg-gray-100`;
const LeftColumn = tw.div`ml-8 mr-8 xl:pl-10 py-2`;

const Nav = () => {
  const t = useSelector((state) => state.language.language);
  const Language = translations[t];

  const navLinks = [
    <NavLinks key={1}>
      <NavLink href="/menu">{Language.menu}</NavLink>
      <NavLink href="/orders">{Language.myOrders}</NavLink>
    </NavLinks>,
  ];

  return (
    <Container>
      <TwoColumn>
        <LeftColumn>
          <StyledHeader links={navLinks} collapseBreakpointClass="sm" />
        </LeftColumn>
      </TwoColumn>
    </Container>
  );
};

export default Nav;
