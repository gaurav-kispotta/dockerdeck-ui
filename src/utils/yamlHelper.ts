import yaml from 'yaml'

export const getYamlObjects = (yamlString: string) => {
    const yamlObject = yaml.parse(yamlString)

    return yamlObject
}