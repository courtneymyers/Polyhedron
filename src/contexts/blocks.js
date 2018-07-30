// @flow

import React from 'react';
// types
import type { Database } from 'components/App';
import type { Node } from 'react';
// databases
import firebase from 'databases/firebase.js';

// --- contexts
export const BlocksContext = React.createContext();

// --- components
type Props = {
  db: Database,
  children: Node,
};

export type BlockProps = {|
  id: string,
  time: number,
  title: string,
  desc: string,
  body: string,
|};

type State = {
  blocks: Array<BlockProps>,
};

export class BlocksProvider extends React.Component<Props, State> {
  dbBlocks: Object; // firebase database reference
  addBlock: () => string;
  removeBlock: (string) => void;
  updateBlockFieldText: (string, string, string) => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      blocks: [],
    };

    this.dbBlocks = firebase.database().ref('blocks');

    this.addBlock = () => {
      const currentTime = new Date().getTime();

      if (this.props.db === 'memory') {
        this.setState((prevState) => ({
          blocks: prevState.blocks.concat({
            id: currentTime.toString(),
            time: currentTime,
            title: '',
            desc: '',
            body: '',
          }),
        }));

        return currentTime.toString();
      }

      if (this.props.db === 'firebase') {
        const newBlock = this.dbBlocks.push({
          time: currentTime,
          title: '',
          desc: '',
          body: '',
        });

        return newBlock.key;
      }

      return '';
    };

    this.removeBlock = (blockId) => {
      if (this.props.db === 'memory') {
        this.setState((prevState) => ({
          blocks: prevState.blocks.filter((block) => block.id !== blockId),
        }));
      }

      if (this.props.db === 'firebase') {
        const dbBlock = this.dbBlocks.child(blockId);
        dbBlock.remove();
      }
    };

    this.updateBlockFieldText = (blockId, fieldName, text) => {
      if (this.props.db === 'memory') {
        this.setState((prevState) => {
          const blocks = [...prevState.blocks];
          const block = blocks.filter((block) => block.id === blockId)[0];
          block[fieldName] = text;

          return {
            blocks: blocks,
          };
        });
      }

      if (this.props.db === 'firebase') {
        this.dbBlocks.child(`${blockId}/${fieldName}`).set(text);
      }
    };
  }

  componentDidMount() {
    if (this.props.db === 'firebase') {
      this.dbBlocks.on('value', (snapshot) => {
        const blocks = snapshot.val();
        // firebase stores everything as objects, so we need to convert the
        // blocks data back to an array by iterating over each object's key
        // (blocksKey below is the key auto-generated by firebase)
        let updatedBlocks = [];
        for (let blocksKey in blocks) {
          const block = blocks[blocksKey];

          updatedBlocks.push({
            id: blocksKey,
            time: block.time,
            title: block.title,
            desc: block.desc,
            body: block.body,
          });
        }

        this.setState((prevState) => ({
          blocks: updatedBlocks,
        }));
      });
    }
  }

  render() {
    return (
      <BlocksContext.Provider
        value={{
          ...this.state,
          addBlock: this.addBlock,
          removeBlock: this.removeBlock,
          updateBlockFieldText: this.updateBlockFieldText,
        }}
      >
        {this.props.children}
      </BlocksContext.Provider>
    );
  }
}
