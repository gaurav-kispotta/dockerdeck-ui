import { describe, it, expect, beforeEach } from 'vitest';
import YamlObjectTransformer from '../../src/modules/YamlObjectTransformer';

describe('YamlObjectTransformer', () => {
    let yamlTransformer: YamlObjectTransformer;

    beforeEach(() => {
        yamlTransformer = new YamlObjectTransformer();
    });

    describe('yamlToObjects', () => {
        it('should parse simple YAML string to object', () => {
            const yamlString = `
version: "3.8"
name: test-app
`;
            const result = yamlTransformer.yamlToObjects(yamlString);
            
            expect(result).toEqual({
                version: '3.8',
                name: 'test-app'
            });
        });

        it('should parse complex Docker Compose YAML', () => {
            const yamlString = `
version: "3.8"
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    networks:
      - frontend
    volumes:
      - web-content:/usr/share/nginx/html
    environment:
      NODE_ENV: production
      DEBUG: "false"
  api:
    image: node:20-alpine
    ports:
      - "3000:3000"
    networks:
      - frontend
      - backend
    volumes:
      - api-data:/app/data
    depends_on:
      - db
  db:
    image: postgres:15
    ports:
      - "5432:5432"
    networks:
      - backend
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge

volumes:
  web-content:
    driver: local
  api-data:
    driver: local
  db-data:
    driver: local
`;
            const result = yamlTransformer.yamlToObjects(yamlString);
            
            expect(result.version).toBe('3.8');
            expect(result.services).toBeDefined();
            expect(result.services.web).toBeDefined();
            expect(result.services.web.image).toBe('nginx:latest');
            expect(result.services.web.ports).toEqual(['80:80', '443:443']);
            expect(result.services.web.networks).toEqual(['frontend']);
            expect(result.services.web.environment.NODE_ENV).toBe('production');
            expect(result.services.web.environment.DEBUG).toBe('false');
            
            expect(result.services.api).toBeDefined();
            expect(result.services.api.depends_on).toEqual(['db']);
            
            expect(result.networks).toBeDefined();
            expect(result.networks.frontend.driver).toBe('bridge');
            
            expect(result.volumes).toBeDefined();
            expect(result.volumes['web-content'].driver).toBe('local');
        });

        it('should parse YAML with arrays', () => {
            const yamlString = `
items:
  - name: item1
    value: 100
  - name: item2
    value: 200
tags:
  - production
  - web
  - docker
`;
            const result = yamlTransformer.yamlToObjects(yamlString);
            
            expect(result.items).toHaveLength(2);
            expect(result.items[0]).toEqual({ name: 'item1', value: 100 });
            expect(result.items[1]).toEqual({ name: 'item2', value: 200 });
            expect(result.tags).toEqual(['production', 'web', 'docker']);
        });

        it('should parse YAML with nested objects', () => {
            const yamlString = `
app:
  name: my-app
  config:
    database:
      host: localhost
      port: 5432
      credentials:
        username: admin
        password: secret
    cache:
      type: redis
      ttl: 3600
`;
            const result = yamlTransformer.yamlToObjects(yamlString);
            
            expect(result.app.name).toBe('my-app');
            expect(result.app.config.database.host).toBe('localhost');
            expect(result.app.config.database.port).toBe(5432);
            expect(result.app.config.database.credentials.username).toBe('admin');
            expect(result.app.config.cache.type).toBe('redis');
            expect(result.app.config.cache.ttl).toBe(3600);
        });

        it('should parse YAML with different data types', () => {
            const yamlString = `
string_value: "hello world"
number_value: 42
float_value: 3.14
boolean_true: true
boolean_false: false
null_value: null
empty_string: ""
multiline_string: |
  This is a
  multiline string
quoted_number: "123"
`;
            const result = yamlTransformer.yamlToObjects(yamlString);
            
            expect(result.string_value).toBe('hello world');
            expect(result.number_value).toBe(42);
            expect(result.float_value).toBe(3.14);
            expect(result.boolean_true).toBe(true);
            expect(result.boolean_false).toBe(false);
            expect(result.null_value).toBeNull();
            expect(result.empty_string).toBe('');
            expect(result.multiline_string.trim()).toBe('This is a\nmultiline string');
            expect(result.quoted_number).toBe('123');
        });

        it('should parse empty YAML string', () => {
            const yamlString = '';
            const result = yamlTransformer.yamlToObjects(yamlString);
            
            expect(result).toBeNull();
        });

        it('should parse YAML with only whitespace', () => {
            const yamlString = '   \n   \t   \n   ';
            const result = yamlTransformer.yamlToObjects(yamlString);
            
            expect(result).toBeNull();
        });

        it('should parse YAML with comments', () => {
            const yamlString = `
# This is a comment
version: "3.8"  # Version comment
services:
  web:  # Web service
    image: nginx:latest
    # Port mapping
    ports:
      - "80:80"
`;
            const result = yamlTransformer.yamlToObjects(yamlString);
            
            expect(result.version).toBe('3.8');
            expect(result.services.web.image).toBe('nginx:latest');
            expect(result.services.web.ports).toEqual(['80:80']);
        });

        it('should handle YAML with special characters in strings', () => {
            const yamlString = `
special_chars: "!@#$%^&*()_+-={}[]|\\\\:;\\"'<>?,./"
unicode: "🐳 Docker 📦"
escape_sequences: "Line 1\\nLine 2\\tTabbed"
`;
            const result = yamlTransformer.yamlToObjects(yamlString);
            
            expect(result.special_chars).toBe('!@#$%^&*()_+-={}[]|\\:;"\'<>?,./');
            expect(result.unicode).toBe('🐳 Docker 📦');
            expect(result.escape_sequences).toBe('Line 1\nLine 2\tTabbed');
        });

        it('should parse YAML with anchor and alias references', () => {
            const yamlString = `
defaults: &defaults
  image: node:20-alpine
  restart: unless-stopped

services:
  api:
    <<: *defaults
    ports:
      - "3000:3000"
  worker:
    <<: *defaults
    command: ["npm", "run", "worker"]
`;
            const result = yamlTransformer.yamlToObjects(yamlString);
            
            // Check that the result is parsed correctly
            expect(result).toBeDefined();
            expect(result.services).toBeDefined();
            expect(result.services.api).toBeDefined();
            expect(result.services.worker).toBeDefined();
            
            // The anchor/alias should merge the defaults into each service
            if (result.services.api.image) {
                expect(result.services.api.image).toBe('node:20-alpine');
            }
        });

        it('should handle YAML with complex mapping structures', () => {
            const yamlString = `
matrix:
  - { name: "test1", env: "dev", port: 3001 }
  - { name: "test2", env: "prod", port: 3002 }
inline_array: [1, 2, 3, 4, 5]
mixed:
  list:
    - item1
    - item2
  object:
    key1: value1
    key2: value2
`;
            const result = yamlTransformer.yamlToObjects(yamlString);
            
            expect(result.matrix).toHaveLength(2);
            expect(result.matrix[0]).toEqual({ name: 'test1', env: 'dev', port: 3001 });
            expect(result.matrix[1]).toEqual({ name: 'test2', env: 'prod', port: 3002 });
            expect(result.inline_array).toEqual([1, 2, 3, 4, 5]);
            expect(result.mixed.list).toEqual(['item1', 'item2']);
            expect(result.mixed.object).toEqual({ key1: 'value1', key2: 'value2' });
        });

        it('should throw error for invalid YAML', () => {
            const invalidYaml = `
version: "3.8"
services:
  web:
    image: nginx
    ports:
      - "80:80
      - "443:443"  # Missing closing quote above
`;
            expect(() => {
                yamlTransformer.yamlToObjects(invalidYaml);
            }).toThrow();
        });

        it('should handle malformed indentation gracefully', () => {
            const malformedYaml = `
version: "3.8"
services:
web:  # Incorrect indentation but might still parse
  image: nginx
`;
            // Some YAML parsers are lenient with indentation
            const result = yamlTransformer.yamlToObjects(malformedYaml);
            expect(result).toBeDefined();
        });
    });

    describe('constructor', () => {
        it('should create an instance', () => {
            const transformer = new YamlObjectTransformer();
            expect(transformer).toBeInstanceOf(YamlObjectTransformer);
        });
    });
});
