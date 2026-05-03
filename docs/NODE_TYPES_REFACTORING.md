# Node Types Refactoring

## Overview

The NodeTypes system has been refactored to be fully configurable based on the `NodesConfig.json` file. This allows for easy addition of new Docker service types without modifying code.

## How It Works

### 1. Configuration File (`NodesConfig.json`)

The configuration file defines all supported Docker images with their metadata:

```json
[
  {
    "dockerImageName": "mysql",
    "dockerTag": "8.0",
    "dockerIconUrl": "https://www.vectorlogo.zone/logos/mysql/mysql-icon.svg"
  },
  ...
]
```

### 2. Dynamic Node Generation (`NodeTypes.tsx`)

The system now:
- Reads all entries from `NodesConfig.json`
- For each entry, creates a React component using `DockerDeckNode.tsx` as a template
- Registers each component with the docker image name as its key
- Maintains backward compatibility with legacy node types (redis, nodejs, group)

### 3. Automatic Node Type Assignment (`ServiceNodeBuilder.ts`)

When building a service node:
- The builder now uses `serviceAst.image.name` to determine the node type
- This automatically maps to the corresponding component from the config
- Example: A service using `image: postgres:16` will use the `postgres` node type

## Adding New Docker Services

To add support for a new Docker service:

1. Add an entry to `src/components/deck/config/NodesConfig.json`:
```json
{
  "dockerImageName": "newservice",
  "dockerTag": "latest",
  "dockerIconUrl": "https://example.com/icon.svg"
}
```

2. That's it! The system will automatically:
   - Generate a node component for the new service
   - Use the correct icon when rendering
   - Handle all the node interactions

## Benefits

- **Maintainability**: No code changes needed to add new services
- **Scalability**: Currently supports 35+ Docker services from a single config file
- **Consistency**: All services use the same `DockerDeckNode` template
- **Type Safety**: Full TypeScript support with proper types from @xyflow/react

## Tests

Tests have been added to ensure:
- All config entries generate valid node components
- ServiceNodeBuilder correctly assigns node types based on image names
- Backward compatibility with legacy node types is maintained
