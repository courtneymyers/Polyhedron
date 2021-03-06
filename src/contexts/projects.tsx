import React from 'react';
// components
import { Database } from 'components/App';
// utilities
import { setKeyValue } from 'utilities';
// databases
import firebase, { version } from 'config/firebase';

type Props = {
  db: Database;
  userId: string | null;
  children: React.ReactNode;
};

export type ProjectProps = {
  id: string;
  meta: { time: number; title: string; desc: string };
  blockIds: string[];
};

type Context = {
  activeProjectId: string;
  assignActiveProjectId(projectId: string): void;
  projects: ProjectProps[];
  addProject(): void;
  removeProject(projectId: string): void;
  updateProjectFieldText(projectId: string, field: string, text: string): void;
  addBlockIdToProject(
    projectId: string,
    blockId: string,
    toIndex?: number,
  ): void;
  removeBlockIdFromProject(projectId: string, blockId: string): void;
  removeBlockIdFromAllProjects(blockId: string): void;
  reorderBlocksInProject(
    projectId: string,
    fromIndex: number,
    toIndex: number,
  ): void;
};

const ProjectsContext = React.createContext<Context | undefined>(undefined);

function useProjectsContext() {
  const context = React.useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error(
      'useProjectsContext must be used within a ProjectsProvider',
    );
  }
  return context;
}

function ProjectsProvider({ db, userId, children }: Props) {
  const [activeProjectId, setActiveProjectId] = React.useState('');
  const [projects, setProjects] = React.useState<ProjectProps[]>([]);

  // firebase db reference to user
  const dbUser =
    db === 'firebase' && userId
      ? firebase.database().ref(`version/${version}/users/${userId}`)
      : null;

  // firebase db reference to user's active project
  const dbActiveProject = dbUser ? dbUser.child('activeProject') : null;

  // firebase db reference to user's projects
  const dbProjects = dbUser ? dbUser.child('projects') : null;

  function assignActiveProjectId(projectId: string): void {
    if (db === 'memory') {
      setActiveProjectId(projectId);
    }

    if (db === 'firebase') {
      if (!dbActiveProject) return;

      dbActiveProject.set(projectId);
    }
  }

  function addProject(): void {
    const currentTime = new Date().getTime();

    if (db === 'memory') {
      const projectId = currentTime.toString();

      setActiveProjectId(projectId);

      setProjects((projects) => {
        return projects.concat({
          id: projectId,
          meta: { time: currentTime, title: '', desc: '' },
          blockIds: [],
        });
      });
    }

    if (db === 'firebase') {
      if (!dbProjects || !dbActiveProject) return;

      const project = dbProjects.push({
        meta: { time: currentTime, title: '', desc: '' },
      });

      dbActiveProject.set(project.key);
    }
  }

  function removeProject(projectId: string): void {
    if (db === 'memory') {
      setProjects((projects) => {
        return projects.filter((project) => project.id !== projectId);
      });
    }

    if (db === 'firebase') {
      if (!dbProjects) return;

      const project = dbProjects.child(projectId);
      project.remove();
    }
  }

  function updateProjectFieldText(
    projectId: string,
    field: string,
    text: string,
  ): void {
    const fields = field.split('.'); // 'meta.title' -> ['meta', 'title']

    if (db === 'memory') {
      setProjects((projects) => {
        const updatedProjects = [...projects];
        const project = updatedProjects.filter((p) => p.id === projectId)[0];
        setKeyValue(project, fields, text);
        return updatedProjects;
      });
    }

    if (db === 'firebase') {
      if (!dbProjects) return;

      const path = fields.join('/'); // ['meta', 'title'] -> 'meta/title'
      dbProjects.child(`${projectId}/${path}`).set(text);
    }
  }

  function addBlockIdToProject(
    projectId: string,
    blockId: string,
    toIndex?: number,
  ): void {
    if (db === 'memory') {
      setProjects((projects) => {
        const updatedProjects = [...projects];
        const project = updatedProjects.filter((p) => p.id === projectId)[0];
        // if toIndex (third argument) isn't passed to method,
        // set toIndex so block will be added to the end
        if (!toIndex) toIndex = project.blockIds.length;
        // insert block at toIndex
        project.blockIds.splice(toIndex, 0, blockId);
        return updatedProjects;
      });
    }

    if (db === 'firebase') {
      if (!dbProjects) return;

      const dbBlockIds = dbProjects.child(`${projectId}/blockIds`);
      // add blockId to the end of the project's blockIds array
      dbBlockIds.push(blockId);
      // if toIndex (third argument) isn't passed to method, we're done
      // else, we need to re-order the project's blockIds
      if (toIndex === undefined) return;
      // firebase stores everything as objects, so we need to convert the
      // blockIds data back to an array by iterating over each object's key
      // (key is the key auto-generated by firebase)
      let blockIds: string[] = [];
      dbBlockIds.on('value', (snapshot) => {
        const blockIdsObject = snapshot.val();
        for (let key in blockIdsObject) {
          blockIds.push(blockIdsObject[key]);
        }
      });
      // remove blockId from end, and re-insert back at toIndex
      blockIds.splice(-1, 1);
      blockIds.splice(toIndex, 0, blockId);
      // store re-ordered blockIds in firebase
      dbBlockIds.remove();
      blockIds.forEach((blockId) => dbBlockIds.push(blockId));
    }
  }

  function removeBlockIdFromProject(projectId: string, blockId: string): void {
    if (db === 'memory') {
      setProjects((projects) => {
        const updatedProjects = [...projects];
        const project = projects.filter((p) => p.id === projectId)[0];
        const updatedBlockIds = project.blockIds.filter((id) => id !== blockId);
        project.blockIds = updatedBlockIds;
        return updatedProjects;
      });
    }

    if (db === 'firebase') {
      if (!dbProjects) return;

      dbProjects
        .child(`${projectId}/blockIds`)
        .orderByValue()
        .equalTo(blockId)
        .once('child_added', (snapshot) => snapshot.ref.remove());
    }
  }

  function removeBlockIdFromAllProjects(blockId: string): void {
    if (db === 'memory') {
      setProjects((projects) => {
        const updatedProjects = [...projects];
        updatedProjects.map((project) => {
          project.blockIds = project.blockIds.filter((id) => id !== blockId);
          return project;
        });
        return updatedProjects;
      });
    }

    if (db === 'firebase') {
      if (!dbProjects) return;

      projects.forEach((project) => {
        dbProjects
          .child(`${project.id}/blockIds`)
          .orderByValue()
          .equalTo(blockId)
          .once('child_added', (snapshot) => snapshot.ref.remove());
      });
    }
  }

  function reorderBlocksInProject(
    projectId: string,
    fromIndex: number,
    toIndex: number,
  ): void {
    if (db === 'memory') {
      setProjects((projects) => {
        const updatedProjects = [...projects];
        const project = projects.filter((p) => p.id === projectId)[0];
        // remove block at fromIndex, and re-insert back at toIndex
        const blockId = project.blockIds.splice(fromIndex, 1)[0];
        project.blockIds.splice(toIndex, 0, blockId);
        return updatedProjects;
      });
    }

    if (db === 'firebase') {
      if (!dbProjects) return;

      const dbBlockIds = dbProjects.child(`${projectId}/blockIds`);
      // firebase stores everything as objects, so we need to convert the
      // blockIds data back to an array by iterating over each object's key
      // (key is the key auto-generated by firebase)
      let blockIds: string[] = [];
      dbBlockIds.on('value', (snapshot) => {
        const blockIdsObject = snapshot.val();
        for (let key in blockIdsObject) {
          blockIds.push(blockIdsObject[key]);
        }
      });
      // remove block at fromIndex, and re-insert back at toIndex
      const blockId = blockIds.splice(fromIndex, 1)[0];
      blockIds.splice(toIndex, 0, blockId);
      // store re-ordered blockIds in firebase
      dbBlockIds.remove();
      blockIds.forEach((blockId) => dbBlockIds.push(blockId));
    }
  }

  // initialize active project id from firebase databse after first render
  const [projectIdInitialized, setProjectIdInitialized] = React.useState(false);
  React.useEffect(() => {
    if (db !== 'firebase') return;
    if (projectIdInitialized) return;
    if (!dbActiveProject) return;

    dbActiveProject.on('value', (snapshot) => {
      setProjectIdInitialized(true);
      setActiveProjectId(snapshot.val());
    });
  }, [db, dbActiveProject, projectIdInitialized]);

  // initialize projects from firebase databse after first render
  const [projectsInitialized, setProjectsInitialized] = React.useState(false);
  React.useEffect(() => {
    if (db !== 'firebase') return;
    if (projectsInitialized) return;
    if (!dbProjects) return;

    dbProjects.on('value', (snapshot) => {
      const projectsObject = snapshot.val();
      // firebase stores everything as objects, so we need to convert the
      // projects data back to an array by iterating over each object's key
      // (projectsKey is the key auto-generated by firebase)
      let updatedProjects = [];
      for (let projectsKey in projectsObject) {
        const project = projectsObject[projectsKey];
        // same song and dance for building up blockIds array...
        // (blocksIdKey is the key auto-generated by firebase)
        let blockIds = [];
        for (let blocksIdKey in project.blockIds) {
          blockIds.push(project.blockIds[blocksIdKey]);
        }
        updatedProjects.push({
          id: projectsKey,
          meta: project.meta,
          blockIds: blockIds,
        });
      }
      setProjects(updatedProjects);
      setProjectsInitialized(true);
    });
  }, [db, dbProjects, projectsInitialized]);

  return (
    <ProjectsContext.Provider
      value={{
        activeProjectId,
        assignActiveProjectId,
        projects,
        addProject,
        removeProject,
        updateProjectFieldText,
        addBlockIdToProject,
        removeBlockIdFromProject,
        removeBlockIdFromAllProjects,
        reorderBlocksInProject,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export { ProjectsProvider, useProjectsContext };
