import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { DockerComposeAstBuilder } from '../src/modules/ast/DockerComposeAstBuilder';
import path from 'path';

// Helper to load yaml file
function loadCompose(file: string) {
  const content = readFileSync(path.resolve(__dirname, file), 'utf-8');
  return parse(content);
}

describe('DockerComposeAstBuilder', () => {
  it('builds AST for docker-compose-9.yaml with expected services, networks and volumes', () => {
    const compose = loadCompose('docker-compose-9.yaml');
    const builder = new DockerComposeAstBuilder(compose);
    const ast = builder.buildAst();

    // Services
    expect(ast.services.length).toBe(5);
    const serviceNames = ast.services.map(s => s.name).sort();
    expect(serviceNames).toEqual(['grafana', 'influxdb', 'mosquitto', 'nodered', 'telegraf']);

    const influx = ast.services.find(s => s.name === 'influxdb');
    expect(influx).toBeDefined();
    expect(influx?.image.name).toBe('influxdb');
    expect(influx?.image.tag.startsWith('2.7')).toBe(true); // tag may include suffix
    expect(influx?.ports).toContain('8087:8086');
    expect(influx?.volumes.some(v => v.includes('influxdb_data'))).toBe(true);

    // Networks
    expect(ast.networks?.length).toBe(1);
    expect(ast.networks?.[0].name).toBe('iot-net');

    // Volumes
    const volumeNames = (ast.volumes || []).map(v => v.name).sort();
    expect(volumeNames).toEqual(['grafana_data', 'influxdb_data']);
  });

  it('throws when no services are present', () => {
    const compose: any = { version: '3.9', networks: { demo: {} } };
    const builder = new DockerComposeAstBuilder(compose);
    expect(() => builder.buildAst()).toThrow(/No services/);
  });
});
