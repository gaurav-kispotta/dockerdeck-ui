import { describe, it, expect, beforeEach } from 'vitest';
import { ElkJsLayoutOptions } from '../../../src/modules/layout-engine/ElkJsLayoutOption';
import { ILayoutOptions, LayoutAlgorithm } from '../../../src/interface/layout-engine/ILayoutOptions';
import { LayoutOptions } from 'elkjs/lib/elk.bundled';

describe('ElkJsLayoutOptions', () => {
    let layoutOptions: ElkJsLayoutOptions;

    beforeEach(() => {
        layoutOptions = new ElkJsLayoutOptions();
    });

    describe('constructor', () => {
        it('should initialize with empty options', () => {
            const options = layoutOptions.getOptions();
            expect(options).toEqual({});
        });

        it('should implement ILayoutOptions interface', () => {
            expect(layoutOptions).toBeInstanceOf(ElkJsLayoutOptions);
            expect(layoutOptions satisfies ILayoutOptions).toBeTruthy();
        });
    });

    describe('setPadding', () => {
        it('should set elk.padding option and return self', () => {
            const result = layoutOptions.setPadding(10);
            
            expect(result).toBe(layoutOptions);
            expect(layoutOptions.getOptions()['elk.padding']).toBe('10');
        });

        it('should handle zero padding', () => {
            layoutOptions.setPadding(0);
            expect(layoutOptions.getOptions()['elk.padding']).toBe('0');
        });

        it('should handle large padding values', () => {
            layoutOptions.setPadding(1000);
            expect(layoutOptions.getOptions()['elk.padding']).toBe('1000');
        });

        it('should handle decimal padding values', () => {
            layoutOptions.setPadding(15.5);
            expect(layoutOptions.getOptions()['elk.padding']).toBe('15.5');
        });
    });

    describe('setMargin', () => {
        it('should set elk.margin option and return self', () => {
            const result = layoutOptions.setMargin(20);
            
            expect(result).toBe(layoutOptions);
            expect(layoutOptions.getOptions()['elk.margin']).toBe('20');
        });

        it('should handle zero margin', () => {
            layoutOptions.setMargin(0);
            expect(layoutOptions.getOptions()['elk.margin']).toBe('0');
        });

        it('should handle negative margin', () => {
            layoutOptions.setMargin(-10);
            expect(layoutOptions.getOptions()['elk.margin']).toBe('-10');
        });
    });

    describe('setSpacing', () => {
        it('should set elk.spacing option and return self', () => {
            const result = layoutOptions.setSpacing(15);
            
            expect(result).toBe(layoutOptions);
            expect(layoutOptions.getOptions()['elk.spacing']).toBe('15');
        });

        it('should handle zero spacing', () => {
            layoutOptions.setSpacing(0);
            expect(layoutOptions.getOptions()['elk.spacing']).toBe('0');
        });
    });

    describe('setWidth', () => {
        it('should set elk.width option and return self', () => {
            const result = layoutOptions.setWidth(100);
            
            expect(result).toBe(layoutOptions);
            expect(layoutOptions.getOptions()['elk.width']).toBe('100');
        });

        it('should handle zero width', () => {
            layoutOptions.setWidth(0);
            expect(layoutOptions.getOptions()['elk.width']).toBe('0');
        });

        it('should handle large width values', () => {
            layoutOptions.setWidth(5000);
            expect(layoutOptions.getOptions()['elk.width']).toBe('5000');
        });
    });

    describe('setHeight', () => {
        it('should set elk.height option and return self', () => {
            const result = layoutOptions.setHeight(200);
            
            expect(result).toBe(layoutOptions);
            expect(layoutOptions.getOptions()['elk.height']).toBe('200');
        });

        it('should handle zero height', () => {
            layoutOptions.setHeight(0);
            expect(layoutOptions.getOptions()['elk.height']).toBe('0');
        });
    });

    describe('setLayoutAlgorithm', () => {
        it('should set box algorithm correctly', () => {
            const result = layoutOptions.setLayoutAlgorithm('box');
            
            expect(result).toBe(layoutOptions);
            expect(layoutOptions.getOptions()['elk.algorithm']).toBe('org.eclipse.elk.box');
        });

        it('should set grid algorithm correctly', () => {
            layoutOptions.setLayoutAlgorithm('grid');
            expect(layoutOptions.getOptions()['elk.algorithm']).toBe('org.eclipse.elk.grid');
        });

        it('should set flex algorithm correctly', () => {
            layoutOptions.setLayoutAlgorithm('flex');
            expect(layoutOptions.getOptions()['elk.algorithm']).toBe('org.eclipse.elk.flex');
        });

        it('should handle all valid algorithm types', () => {
            const algorithms: LayoutAlgorithm[] = ['box', 'grid', 'flex'];
            const expectedValues = [
                'org.eclipse.elk.box',
                'org.eclipse.elk.grid',
                'org.eclipse.elk.flex'
            ];

            algorithms.forEach((algorithm, index) => {
                const options = new ElkJsLayoutOptions();
                options.setLayoutAlgorithm(algorithm);
                expect(options.getOptions()['elk.algorithm']).toBe(expectedValues[index]);
            });
        });
    });

    describe('setCustomOption', () => {
        it('should set custom options and return self', () => {
            const customOptions = {
                'elk.direction': 'DOWN',
                'elk.hierarchyHandling': 'INCLUDE_CHILDREN'
            };
            
            const result = layoutOptions.setCustomOption(customOptions);
            
            expect(result).toBe(layoutOptions);
            expect(layoutOptions.getOptions()['elk.direction']).toBe('DOWN');
            expect(layoutOptions.getOptions()['elk.hierarchyHandling']).toBe('INCLUDE_CHILDREN');
        });

        it('should merge with existing options', () => {
            layoutOptions.setPadding(10);
            layoutOptions.setCustomOption({ 'elk.direction': 'DOWN' });
            
            const options = layoutOptions.getOptions();
            expect(options['elk.padding']).toBe('10');
            expect(options['elk.direction']).toBe('DOWN');
        });

        it('should override existing options with same key', () => {
            layoutOptions.setPadding(10);
            layoutOptions.setCustomOption({ 'elk.padding': '20' });
            
            expect(layoutOptions.getOptions()['elk.padding']).toBe('20');
        });

        it('should handle empty custom options', () => {
            layoutOptions.setPadding(10);
            layoutOptions.setCustomOption({});
            
            expect(layoutOptions.getOptions()['elk.padding']).toBe('10');
        });

        it('should handle nested object values', () => {
            const nestedOptions = {
                'elk.config': { enabled: true, value: 42 }
            };
            
            layoutOptions.setCustomOption(nestedOptions);
            
            expect(layoutOptions.getOptions()['elk.config']).toEqual({ enabled: true, value: 42 });
        });
    });

    describe('getOptions', () => {
        it('should return current options object', () => {
            layoutOptions.setPadding(10);
            layoutOptions.setMargin(20);
            
            const options = layoutOptions.getOptions();
            
            expect(options).toEqual({
                'elk.padding': '10',
                'elk.margin': '20'
            });
        });

        it('should return current options object', () => {
            layoutOptions.setPadding(10);
            layoutOptions.setMargin(20);
            
            const options = layoutOptions.getOptions();
            
            expect(options).toEqual({
                'elk.padding': '10',
                'elk.margin': '20'
            });
        });
    });

    describe('build', () => {
        it('should return the same as getOptions', () => {
            layoutOptions.setPadding(10);
            layoutOptions.setMargin(20);
            
            const builtOptions = layoutOptions.build();
            const gottenOptions = layoutOptions.getOptions();
            
            expect(builtOptions).toEqual(gottenOptions);
        });

        it('should return LayoutOptions type', () => {
            const result: LayoutOptions = layoutOptions.build();
            expect(result).toBeDefined();
        });
    });

    describe('method chaining', () => {
        it('should support fluent interface pattern', () => {
            const result = layoutOptions
                .setPadding(10)
                .setMargin(20)
                .setSpacing(15)
                .setWidth(100)
                .setHeight(200)
                .setLayoutAlgorithm('box')
                .setCustomOption({ 'elk.direction': 'DOWN' });
            
            expect(result).toBe(layoutOptions);
            
            const options = layoutOptions.build();
            expect(options).toEqual({
                'elk.padding': '10',
                'elk.margin': '20',
                'elk.spacing': '15',
                'elk.width': '100',
                'elk.height': '200',
                'elk.algorithm': 'org.eclipse.elk.box',
                'elk.direction': 'DOWN'
            });
        });

        it('should allow partial configuration', () => {
            const result = layoutOptions
                .setPadding(5)
                .setLayoutAlgorithm('grid');
            
            expect(result).toBe(layoutOptions);
            expect(layoutOptions.getOptions()).toEqual({
                'elk.padding': '5',
                'elk.algorithm': 'org.eclipse.elk.grid'
            });
        });
    });

    describe('edge cases', () => {
        it('should handle multiple calls to same setter', () => {
            layoutOptions.setPadding(10);
            layoutOptions.setPadding(20);
            
            expect(layoutOptions.getOptions()['elk.padding']).toBe('20');
        });

        it('should handle setting multiple custom options', () => {
            layoutOptions.setCustomOption({ 'option1': 'value1' });
            layoutOptions.setCustomOption({ 'option2': 'value2' });
            
            const options = layoutOptions.getOptions();
            expect(options['option1']).toBe('value1');
            expect(options['option2']).toBe('value2');
        });

        it('should preserve option order through chaining', () => {
            layoutOptions
                .setPadding(10)
                .setMargin(20)
                .setSpacing(15);
            
            const options = layoutOptions.getOptions();
            const keys = Object.keys(options);
            
            expect(keys).toContain('elk.padding');
            expect(keys).toContain('elk.margin');
            expect(keys).toContain('elk.spacing');
        });
    });
});
