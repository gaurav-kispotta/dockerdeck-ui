import React from 'react';
import { useAppSelector } from '../../store/hooks';

/**
 * Debug component to display the current AST object from Redux state
 * This component can be used to verify that the AST is being stored properly
 */
export const AstDebugViewer: React.FC = () => {
    const astObject = useAppSelector((state) => state.uploadedFile.astObject);

    if (!astObject) {
        return (
            <div className="p-4 bg-gray-100 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Docker Compose AST Debug</h3>
                <p className="text-gray-600">No AST object available</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <div className="pb-2 mb-4 border-b border-gray-300">
                <h3 className="text-lg font-semibold">Docker Compose AST Debug</h3>
            </div>
            
            <div className="space-y-4">
                <div>
                    <h4 className="font-medium text-gray-700 py-1">
                        Services ({astObject.services.length})
                    </h4>
                    <ul className="ml-4 list-disc space-y-1">
                        {astObject.services.map((service, index) => (
                            <li key={index} className="text-sm text-gray-600">
                                {service.name} - {service.image.name}:{service.image.tag}
                                {service.ports && service.ports.length > 0 && (
                                    <span className="text-xs text-blue-600 ml-2">
                                        Ports: {service.ports.map(p => `${p.external}:${p.internal}`).join(', ')}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {astObject.networks && astObject.networks.length > 0 && (
                    <div>
                        <h4 className="font-medium text-gray-700 py-1">
                            Networks ({astObject.networks.length})
                        </h4>
                        <ul className="ml-4 list-disc space-y-1">
                            {astObject.networks.map((network, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                    {network.name} - {network.driver}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {astObject.volumes && astObject.volumes.length > 0 && (
                    <div>
                        <h4 className="font-medium text-gray-700 py-1">
                            Volumes ({astObject.volumes.length})
                        </h4>
                        <ul className="ml-4 list-disc space-y-1">
                            {astObject.volumes.map((volume, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                    {volume.name} - {volume.driver}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <details className="mt-4">
                <summary className="cursor-pointer font-medium text-gray-700 py-1">
                    Raw AST Object
                </summary>
                <div className="mt-2">
                    <pre className="p-2 bg-gray-200 rounded text-xs whitespace-pre-wrap break-words">
                        {JSON.stringify(astObject, null, 2)}
                    </pre>
                </div>
            </details>
        </div>
    );
};

export default AstDebugViewer;
