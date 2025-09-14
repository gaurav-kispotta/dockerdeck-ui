import { useAppSelector } from '../store/hooks';
import { IDockerComposeAst } from '../modules/ast/DockerComposeAstBuilder';

/**
 * Custom hook to access the Docker Compose AST from Redux state
 * @returns The current AST object or null if not available
 */
export const useDockerComposeAst = (): IDockerComposeAst | null => {
    const astObject = useAppSelector((state) => state.uploadedFile.astObject);
    return astObject || null;
};

/**
 * Custom hook to check if an AST is available
 * @returns boolean indicating if AST is available
 */
export const useHasDockerComposeAst = (): boolean => {
    const astObject = useAppSelector((state) => state.uploadedFile.astObject);
    return astObject !== null && astObject !== undefined;
};

/**
 * Custom hook to get specific AST data
 * @returns object with services, networks, and volumes arrays
 */
export const useDockerComposeAstData = () => {
    const astObject = useAppSelector((state) => state.uploadedFile.astObject);
    
    return {
        services: astObject?.services || [],
        networks: astObject?.networks || [],
        volumes: astObject?.volumes || [],
        hasAst: astObject !== null && astObject !== undefined,
    };
};
