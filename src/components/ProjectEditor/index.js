// @flow

import React from 'react';
import styled from 'styled-components';
// components
import Field from 'components/Field';
import Block from 'components/Block/container.js';
import BlockButton from 'components/BlockButton';
// types
import type { ProjectProps } from 'contexts/projects';
import type { BlockProps } from 'contexts/blocks';

// --- styled components
const ProjectField = styled(Field)`
  margin-top: 1rem;
  padding: 0;

  :first-of-type {
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
  projects: Array<ProjectProps>,
  activeProjectId: string,
  updateProjectFieldText: (string, string, string) => void,
  addBlockIdToProject: (string, string) => void,
  removeBlockIdFromProject: (string, string) => void,
  blocks: Array<BlockProps>,
  addBlock: () => void,
};

const ProjectEditor = (props: Props) => {
  const { projects, activeProjectId, blocks } = props;
  const project = projects.filter((p) => p.id === activeProjectId)[0];
  const projectBlocks = !project
    ? []
    : blocks.filter((block) => project.blockIds.indexOf(block.id) !== -1);

  return (
    <React.Fragment>
      {!project ? (
        <p>No project selected. Select a project or create a new one!</p>
      ) : (
        <React.Fragment>
          <ProjectField
            type="text"
            label="Project Title"
            text={project.title}
            updateText={(text) =>
              props.updateProjectFieldText(project.id, 'title', text)
            }
          />

          <ProjectField
            type="text"
            label="Project Description"
            text={project.desc}
            updateText={(text) =>
              props.updateProjectFieldText(project.id, 'desc', text)
            }
          />

          <Heading>Blocks</Heading>

          {projectBlocks.map((block) => (
            <Block
              key={block.id}
              id={block.id}
              time={block.time}
              title={block.title}
              desc={block.desc}
              body={block.body}
              removeBlock={(blockId) =>
                props.removeBlockIdFromProject(project.id, blockId)
              }
            />
          ))}

          <AddButton
            text="+"
            href=""
            title="Add Block"
            onClick={(ev) => {
              ev.preventDefault();
              const blockId = props.addBlock();
              if (blockId) props.addBlockIdToProject(project.id, blockId);
            }}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default ProjectEditor;