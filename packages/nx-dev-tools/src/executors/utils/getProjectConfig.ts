import { ExecutorContext, ProjectConfiguration } from '@nx/devkit';

export const getProjectConfig = ({
  projectName = '',
  projectsConfigurations,
}: ExecutorContext): ProjectConfiguration | undefined => {
  const projectConfig = projectsConfigurations.projects[projectName];
  return projectConfig;
};
