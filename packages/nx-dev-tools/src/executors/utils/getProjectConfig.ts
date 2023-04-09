import { ExecutorContext, ProjectConfiguration } from '@nrwl/devkit';

export const getProjectConfig = ({
  projectName = '',
  projectsConfigurations,
}: ExecutorContext): ProjectConfiguration | undefined => {
  const projectConfig = projectsConfigurations.projects[projectName];
  return projectConfig;
};
