import { useState } from 'react';
import Editor from '@monaco-editor/react';
import yaml from 'yaml';
import { useTheme } from '../../context/ThemeContext';

interface DockerComposeViewerProps {
    yamlObject: any;
    onClose?: () => void;
}

export default function DockerComposeViewer({ yamlObject, onClose }: DockerComposeViewerProps) {
    const [isVisible, setIsVisible] = useState(true);
    const { themeMode } = useTheme();

    // Convert the YAML object back to a prettified YAML string
    const yamlString = yamlObject ? yaml.stringify(yamlObject, {
        indent: 2,
        lineWidth: 0,
        minContentWidth: 0,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        singleQuote: false
    }) : '';

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) {
            onClose();
        }
    };

    if (!isVisible || !yamlObject) {
        return null;
    }

    return (
        <div className="h-full flex flex-col bg-gray-800 border-t border-gray-600">
            {/* Header with title and close button */}
            <div className="flex items-center justify-between p-3 dark:bg-gray-900 bg-gray-400">
                <div className="flex items-center space-x-2">
                    <svg 
                        className="w-5 h-5 " 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                    </svg>
                    <h3 className="text-sm font-medium dark:text-gray-200 text-black">Docker Compose File</h3>
                </div>
                <button
                    onClick={handleClose}
                    className="p-1 rounded hover:bg-gray-700 text-black dark:text-gray-400 hover:text-gray-200 transition-colors"
                    aria-label="Close Docker Compose viewer"
                >
                    <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M6 18L18 6M6 6l12 12" 
                        />
                    </svg>
                </button>
            </div>
            
            {/* Monaco Editor */}
            <div className="flex-grow">
                <Editor
                    height="100%"
                    language="yaml"
                    value={yamlString}
                    theme={themeMode === 'dark' ? "vs-dark" : "vs-light"}
                    options={{
                        readOnly: true,
                        minimap: { enabled: true },
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        lineNumbers: 'on',
                        glyphMargin: false,
                        folding: true,
                        lineDecorationsWidth: 0,
                        lineNumbersMinChars: 3,
                        renderWhitespace: 'selection',
                        tabSize: 2,
                        insertSpaces: true,
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollbar: {
                            vertical: 'auto',
                            horizontal: 'auto'
                        }
                    }}
                    loading={
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-400">Loading editor...</div>
                        </div>
                    }
                />
            </div>
        </div>
    );
}
