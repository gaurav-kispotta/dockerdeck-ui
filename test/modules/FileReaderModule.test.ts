import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileReaderModule } from '../../src/modules/FileReaderModule';

describe('FileReaderModule', () => {
    let fileReaderModule: FileReaderModule;

    beforeEach(() => {
        // Mock FileReader globally
        (global as any).FileReader = vi.fn().mockImplementation(() => ({
            readAsText: vi.fn(),
            onload: null,
            result: null
        }));
        
        fileReaderModule = new FileReaderModule();
    });

    describe('constructor', () => {
        it('should create an instance with FileReader', () => {
            expect(fileReaderModule.fileReader).toBeDefined();
        });
    });

    describe('onChangeOfFileInput', () => {
        it('should create a promise and set up file reading', () => {
            const mockFile = new File(['content'], 'test.yml', { type: 'text/yaml' });
            const mockEvent = {
                target: {
                    files: [mockFile]
                }
            };

            const promise = fileReaderModule.onChangeOfFileInput(mockEvent);
            
            expect(promise).toBeInstanceOf(Promise);
            expect(fileReaderModule.fileReader.readAsText).toHaveBeenCalledWith(mockFile);
        });

        it('should handle file reading setup', () => {
            const mockFile = new File(['test content'], 'test.yml', { type: 'text/yaml' });
            const mockEvent = {
                target: {
                    files: [mockFile]
                }
            };

            fileReaderModule.onChangeOfFileInput(mockEvent);
            
            // Verify onload handler is set
            expect(fileReaderModule.fileReader.onload).toBeInstanceOf(Function);
        });
    });
});
