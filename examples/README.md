# Example Docker Compose Files

This directory contains example Docker Compose files that demonstrate the NodeTypes refactoring.

## multi-service-compose.yml

This example demonstrates a multi-tier application with:
- **Databases**: PostgreSQL, MySQL, MongoDB
- **Cache**: Redis
- **Application**: Node.js API
- **Web Server**: Nginx

Each service uses a different Docker image that is configured in `NodesConfig.json`. When this compose file is loaded into DockerDeck:

1. **postgres** service → Uses the `postgres` node type with PostgreSQL icon
2. **mysql** service → Uses the `mysql` node type with MySQL icon
3. **mongodb** service → Uses the `mongodb` node type with MongoDB icon
4. **redis** service → Uses the `redis` node type with Redis icon
5. **api** service → Uses the `node` node type with Node.js icon
6. **nginx** service → Uses the `nginx` node type with Nginx icon

## How It Works

The system automatically:
1. Reads the `image:` field from each service (e.g., `postgres:16`)
2. Extracts the image name (`postgres`)
3. Finds the matching entry in `NodesConfig.json`
4. Renders the node with the correct icon and styling

## Testing

To test this example:
1. Start the DockerDeck UI application
2. Upload the `multi-service-compose.yml` file
3. Observe that each service renders with its specific icon from the configuration
4. Verify that the nodes show the correct relationships (depends_on, networks)
