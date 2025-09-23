import { closest } from 'fastest-levenshtein';
export const getActivePath = (
  pathname: string,
  paths: string[],
  ignorePaths?: string[],
) => {
  const closestPath = closest(pathname, paths.concat(ignorePaths ?? []));
  const index = paths.indexOf(closestPath);

  return { active: closestPath, activeIndex: index };
};
