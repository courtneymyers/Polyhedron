/** @jsx jsx */

import React from 'react';
import styled from '@emotion/styled/macro';
import { css, jsx } from '@emotion/core';
// components
import BlockButton from 'components/BlockButton';
import UserLoginButton from 'components/UserLoginButton';
import ProjectLibrary from 'components/ProjectLibrary';
import BlockLibrary from 'components/BlockLibrary';
import ProjectEditor from 'components/ProjectEditor';
import ProjectPreview from 'components/ProjectPreview';

const buttonHeight = 1.5;
const headerPadding = 1;
const headerHeight = buttonHeight + 2 * headerPadding;

const Container = styled.div`
  margin: 0 auto;
  max-width: 80rem;
`;

const Header = styled.header`
  box-sizing: border-box;
  position: fixed;
  top: 0;
  width: 100%;
  height: ${headerHeight}rem;
  display: flex;
  align-items: center;
  padding: ${headerPadding}rem;
  background-color: #360a80;
`;

const headerButtonStyles = css`
  height: ${buttonHeight}rem;
  line-height: ${buttonHeight}rem;
  background-color: #60449a;

  :hover,
  :focus {
    background-color: #60449a;
  }
`;

const ToggleButton = styled(BlockButton)`
  ${headerButtonStyles};
  width: ${buttonHeight}rem;
`;

const UserButton = styled(UserLoginButton)`
  ${headerButtonStyles};
  margin-left: 1rem;
  padding: 0 0.625rem;
  width: auto;
  font-size: 0.8125rem;
`;

const ButtonLabel = styled.p`
  margin: 0;
  padding: 0 0.625rem;
  font-size: 0.875rem;
  color: #9a87c2;
`;

const Heading = styled.h1`
  flex: 1;
  margin: 0.1875rem 0.75rem 0;
  font-size: 1.3125rem;
  font-weight: normal;
  text-align: center;
  color: #fff;
`;

const Main = styled.main`
  display: flex;
  margin-top: ${headerHeight}rem;
  border: 1px solid #ccbee4;
  border-top: none;
`;

const Panel = styled.section`
  padding: 1rem;
`;

const SubHeading = styled.h2`
  margin-top: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #ccbee4;
  font-size: 1.125rem;
  color: #360a80;

  :first-of-type {
    margin-top: 0;
  }
`;

const LeftPanel = styled(Panel)`
  flex: 0 0 15rem;
  border-right: 1px solid #ccbee4;
  background-color: #e2ddef;
`;

const MiddlePanel = styled(Panel)`
  flex: 1;
  background-color: #edeaf3;
`;

const RightPanel = styled(Panel)`
  flex: 1;
  border-left: 1px solid #ccbee4;
  background-color: #e2ddef;
`;

type Props = {};

function AppUserInterface({ ...props }: Props) {
  const [leftPanelShown, setLeftPanelShown] = React.useState(true);
  const [rightPanelShown, setRightPanelShown] = React.useState(true);

  return (
    <Container>
      <Header>
        <ToggleButton
          text="☰"
          href="#library"
          title="Toggle Library"
          onClick={(ev) => {
            ev.preventDefault();
            setLeftPanelShown(!leftPanelShown);
          }}
        />
        <ButtonLabel>Library</ButtonLabel>
        <Heading>Polyhedron</Heading>
        <ButtonLabel>Preview</ButtonLabel>
        <ToggleButton
          text="☰"
          href="#preview"
          title="Toggle Preview"
          onClick={(ev) => {
            ev.preventDefault();
            setRightPanelShown(!rightPanelShown);
          }}
        />
        <UserButton />
      </Header>

      <Main>
        {leftPanelShown && (
          <LeftPanel>
            <SubHeading>Project Library</SubHeading>
            <ProjectLibrary />

            <SubHeading>Block Library</SubHeading>
            <BlockLibrary />
          </LeftPanel>
        )}

        <MiddlePanel>
          <SubHeading>Project Editor</SubHeading>
          <ProjectEditor />
        </MiddlePanel>

        {rightPanelShown && (
          <RightPanel>
            <SubHeading>Project Preview</SubHeading>
            <ProjectPreview />
          </RightPanel>
        )}
      </Main>
    </Container>
  );
}

export default AppUserInterface;
export { Container, Header, UserButton, Heading, Main };
