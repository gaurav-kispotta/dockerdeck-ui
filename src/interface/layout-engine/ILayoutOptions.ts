export type LayoutAlgorithm = 'box' | 'grid' | 'flex';

export interface ILayoutOptions {
    setPadding(padding: number): ILayoutOptions;
    setMargin(margin: number): ILayoutOptions;
    setSpacing(spacing: number): ILayoutOptions;
    setWidth(width: number): ILayoutOptions;
    setHeight(height: number): ILayoutOptions;

    setLayoutAlgorithm(algorithm: LayoutAlgorithm): ILayoutOptions;
    setCustomOption(options: Record<string, any>): ILayoutOptions;
    build(): any;
}