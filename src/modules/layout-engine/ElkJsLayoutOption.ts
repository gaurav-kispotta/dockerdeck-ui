import { LayoutOptions } from "elkjs/lib/elk.bundled";
import { ILayoutOptions, LayoutAlgorithm } from "../../interface/layout-engine/ILayoutOptions";

export class ElkJsLayoutOptions implements ILayoutOptions {
    private options: LayoutOptions = {};

    setPadding(padding: number): ILayoutOptions {
        this.options['elk.padding'] = padding.toString();
        return this;
    }

    setMargin(margin: number): ILayoutOptions {
        this.options['elk.margin'] = margin.toString();
        return this;
    }

    setSpacing(spacing: number): ILayoutOptions {
        this.options['elk.spacing'] = spacing.toString();
        return this;
    }

    setWidth(width: number): ILayoutOptions {
        this.options['elk.width'] = width.toString();
        return this;
    }

    setHeight(height: number): ILayoutOptions {
        this.options['elk.height'] = height.toString();
        return this;
    }

    setLayoutAlgorithm(algorithm: LayoutAlgorithm): ILayoutOptions {
        switch (algorithm) {
            case 'box':
                this.options['elk.algorithm'] = 'org.eclipse.elk.box';
                break;
            case 'grid':
                this.options['elk.algorithm'] = 'org.eclipse.elk.grid';
                break;
            case 'flex':
                this.options['elk.algorithm'] = 'org.eclipse.elk.flex';
                break;
        }
        return this;
    }

    setCustomOption(options: Record<string, any>): ILayoutOptions {
        this.options = { ...this.options, ...options };
        return this;
    }

    getOptions(): LayoutOptions {
        return this.options;
    }

    build(): LayoutOptions {
        return this.getOptions();
    }
}
