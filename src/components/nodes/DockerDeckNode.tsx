import { useAppSelector } from '../../hooks/useReduxHooks';
import ArchitectureNode from './views/architecture/ArchitectureNode';
import PortsNode from './views/ports/PortsNode';
import NetworksNode from './views/networks/NetworksNode';
import VolumesNode from './views/volumes/VolumesNode';
import BootOrderNode from './views/boot-order/BootOrderNode';

export interface DockerDeckNodeProps {
  dockerServiceId: string;
  dockerImageName: string;
  dockerIconUrl?: string;
  nodeType?: 'service' | 'network' | 'volume';
}

export default function DockerDeckNode(props: DockerDeckNodeProps) {
  const viewMode = useAppSelector((s) => s.settings.viewMode);

  switch (viewMode) {
    case 'ports':      return <PortsNode {...props} />;
    case 'networks':   return <NetworksNode {...props} />;
    case 'volumes':    return <VolumesNode {...props} />;
    case 'boot-order': return <BootOrderNode {...props} />;
    default:           return <ArchitectureNode {...props} />;
  }
}
