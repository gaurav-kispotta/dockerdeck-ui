import Editor from '@monaco-editor/react';
import yaml from 'yaml';
import { useAppSelector } from '../../store/hooks';
import { Tabs } from 'antd';

type MonacoEditorProps = {
    yamlString: string;
    themeMode: string;
    className?: string;
};

const MonacoEditor: React.FC<MonacoEditorProps> = ({ yamlString, themeMode, className }) => (
    <Editor
            height="100%"
            width="100%"
            className={className}
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
);

export default function DockerComposeViewer() {
    const { themeMode } = useAppSelector((state) => state.theme);
    const { yamlObject, isViewerVisible } = useAppSelector((state) => state.uploadedFile);

    // Convert the YAML object back to a prettified YAML string
    const yamlString = yamlObject ? yaml.stringify(yamlObject, {
        indent: 2,
        lineWidth: 0,
        minContentWidth: 0,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        singleQuote: false
    }) : '';

    // Convert the YAML object to formatted JSON for AST view
    const astString = yamlObject ? JSON.stringify(yamlObject.services, null, 2) : '';

    if (!isViewerVisible || !yamlObject) {
        return null;
    }

    

    return (
        <div
            className="flex flex-col flex-grow border-t border-gray-600 dark:bg-gray-800"
            style={{
            height: '100%',
            width: '100%',
            minHeight: 0,
            minWidth: 0,
            }}
        >
            <Tabs
            defaultActiveKey="1"
            className=""
            size="small"
            style={{ 
                height: '100%', 
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
            tabBarStyle={{
                margin: 0,
                flexShrink: 0
            }}
            items={[
                {
                label: 'YAML',
                key: '1',
                closable: true,
                children: (
                    <div className="h-full w-full overflow-hidden">
                        <MonacoEditor
                        className="h-full w-full"
                        yamlString={yamlString}
                        themeMode={themeMode}
                        />
                    </div>
                ),
                },
                {
                label: 'AST',
                key: '2',
                closable: true,
                children: (
                    <div className="h-full w-full overflow-hidden">
                        <Editor
                            height="100%"
                            width="100%"
                            className="h-full w-full"
                            language="json"
                            value={astString}
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
                                    <div className="text-gray-400">Loading AST editor...</div>
                                </div>
                            }
                        />
                    </div>
                ),
                },
            ]}
            />
        </div>
    );
}
