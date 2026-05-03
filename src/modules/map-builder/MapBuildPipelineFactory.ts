import { ILayoutEngine } from '../../interface/layout-engine/ILayoutEngine';
import { IMapBuildStage } from '../../interface/map-builder/IMapBuildStage';
import { SettingsState } from '../../store/slices/settingsSlice';
import { DagreLayoutEngine } from '../layout-engine/DagreLayoutEngine';
import { AstBuildStage } from './stages/AstBuildStage';
import { NodeBuildStage } from './stages/NodeBuildStage';
import { EdgeBuildStage } from './stages/EdgeBuildStage';
import { EdgeValidationStage } from './stages/EdgeValidationStage';
import { LayoutStage } from './stages/LayoutStage';
import { PositioningStage } from './stages/PositioningStage';
import { AssemblyStage } from './stages/AssemblyStage';
import { MapBuildPipeline } from './MapBuildPipeline';

export class MapBuildPipelineFactory {
    static createDefault(settings?: SettingsState, layoutEngine?: ILayoutEngine): MapBuildPipeline {
        const engine = layoutEngine ?? new DagreLayoutEngine(settings);

        const stages: IMapBuildStage[] = [
            new AstBuildStage(),
            new NodeBuildStage(),
            new EdgeBuildStage(),
            new EdgeValidationStage(),
            new LayoutStage(engine),
            new PositioningStage(),
            new AssemblyStage(),
        ];

        return new MapBuildPipeline(stages);
    }

    // For testing: assemble a pipeline with custom or partially-replaced stages.
    static createCustom(stages: IMapBuildStage[]): MapBuildPipeline {
        return new MapBuildPipeline(stages);
    }
}
