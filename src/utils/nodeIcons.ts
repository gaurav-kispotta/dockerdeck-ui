import nodesConfig from '../components/deck/config/NodesConfig.json';

const UNKNOWN_ICON = nodesConfig.find(n => n.dockerImageName === 'unknown-type')?.dockerIconUrl
  ?? 'https://www.svgrepo.com/show/445669/container-optimize.svg';

export function getIconUrl(imageName: string): string {
  if (!imageName) return UNKNOWN_ICON;
  const lower = imageName.toLowerCase();
  const match = nodesConfig.find(n =>
    n.dockerImageName !== 'unknown-type' &&
    n.dockerImageName !== 'volume' &&
    lower.includes(n.dockerImageName.toLowerCase())
  );
  return match?.dockerIconUrl ?? UNKNOWN_ICON;
}

export const VOLUME_ICON = nodesConfig.find(n => n.dockerImageName === 'volume')?.dockerIconUrl
  ?? 'https://www.svgrepo.com/show/524492/database.svg';
