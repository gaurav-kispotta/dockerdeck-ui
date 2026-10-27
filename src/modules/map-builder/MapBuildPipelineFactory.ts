import { ILayoutEngine } from '../../interface/layout-engine/ILayoutEngine';
import { IMapBuildStage } from '../../interface/map-builder/IMapBuildStage';
import { SettingsState } from '../../store/slices/settingsSlice';
import { DagreLayoutEngine } from '../layout-engine/DagreLayoutEngine';
import { ElkJsLayoutEngine } from '../layout-engine/ElkJsLayoutEngine';
import { AstBuildStage } from './stages/AstBuildStage';
import { NodeBuildStage } from './stages/NodeBuildStage';
import { EdgeBuildStage } from './stages/EdgeBuildStage';
import { EdgeValidationStage } from './stages/EdgeValidationStage';
import { LayoutStage } from './stages/LayoutStage';
import { PositioningStage } from './stages/PositioningStage';
import { PassthroughPositioningStage } from './stages/PassthroughPositioningStage';
import { AssemblyStage } from './stages/AssemblyStage';
import { MapBuildPipeline } from './MapBuildPipeline';

export class MapBuildPipelineFactory {
    static createDefault(settings?: SettingsState, layoutEngine?: ILayoutEngine): MapBuildPipeline {
        const mapLayout = settings?.mapLayout ?? 'layered';

        let engine: ILayoutEngine;
        let positioningStage: IMapBuildStage;

        if (layoutEngine) {
            // Caller-supplied engine overrides everything — use passthrough so it controls positions.
            engine = layoutEngine;
            positioningStage = new PassthroughPositioningStage();
        } else {
            switch (mapLayout) {
                case 'dagre':
                    engine = new DagreLayoutEngine(settings);
                    positioningStage = new PassthroughPositioningStage();
                    break;
                case 'elk':
                    engine = new ElkJsLayoutEngine(settings);
                    positioningStage = new PassthroughPositioningStage();
                    break;
                case 'layered':
                default:
                    engine = new DagreLayoutEngine(settings);
                    positioningStage = new PositioningStage();
                    break;
            }
        }

        const stages: IMapBuildStage[] = [
            new AstBuildStage(),
            new NodeBuildStage(),
            new EdgeBuildStage(),
            new EdgeValidationStage(),
            new LayoutStage(engine),
            positioningStage,
            new AssemblyStage(),
        ];

        return new MapBuildPipeline(stages);
    }

    // For testing: assemble a pipeline with custom or partially-replaced stages.
    static createCustom(stages: IMapBuildStage[]): MapBuildPipeline {
        return new MapBuildPipeline(stages);
    }
}
