// @flow

import React from 'react';
import styled from 'styled-components';
// components
import Field from 'components/Field';
import Block from 'components/Block/container.js';
import BlockButton from 'components/BlockButton';
// types
import type { BlockProps } from 'contexts/blocks';

// --- styled components
const ArticleField = styled(Field)`
  margin-top: 1rem;
  padding: 0;

  :first-child {
    margin-top: 0;
  }

  label {
    background-color: #ccbee4;
  }
`;

const Heading = styled.h3`
  margin-top: 1rem;
  margin-bottom: 0;
  border-bottom: 1px solid #ccbee4;
  font-size: 0.9325rem;
  color: #360a80;
`;

const AddButton = styled(BlockButton)`
  margin: 0.5rem auto 0;
`;

// --- components
type Props = {
  // context props
  blocks: Array<BlockProps>,
  addBlock: () => void,
  removeBlock: (string) => void,
};

const ArticleEditor = (props: Props) => (
  <React.Fragment>
    <ArticleField
      type="text"
      label="Article Title"
      text={'(title)'}
      updateText={(text) => true}
    />

    <ArticleField
      type="text"
      label="Article Description"
      text={'(description)'}
      updateText={(text) => true}
    />

    <Heading>Blocks</Heading>

    {props.blocks.map((block) => (
      <Block
        key={block.id}
        id={block.id}
        time={block.time}
        title={block.title}
        desc={block.desc}
        body={block.body}
        removeBlock={(blockId) => props.removeBlock(blockId)}
      />
    ))}

    <AddButton
      text="+"
      href=""
      title="Add Block"
      onClick={(ev) => {
        ev.preventDefault();
        props.addBlock();
      }}
    />
  </React.Fragment>
);

export default ArticleEditor;
