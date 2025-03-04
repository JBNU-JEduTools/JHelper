import styled from '@emotion/styled';
import { Link } from 'gatsby';
import React from 'react';
import Logo from '../logo.mdx';

const LogoWrapper = () => (
  <StyledLogoWrapper>
    <LogoLink to="/">
      <Logo />
    </LogoLink>
  </StyledLogoWrapper>
);

const StyledLogoWrapper = styled.div`
  display: flex;
  align-items: center;
  p {
    margin: 1rem 0.5rem;
    font-size: 30px;
    line-height: 1;
    font-weight: bold;
    font-family: 'Inter', ${p => p.theme.fonts.body};
  }
`;

const LogoLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: ${p => p.theme.colors.text};
  transition: color ${p => p.theme.transition};
  &:hover,
  &:focus {
    color: ${p => p.theme.colors.primary};
  }
`;

export default LogoWrapper;
