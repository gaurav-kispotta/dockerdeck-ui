import yaml from 'yaml'

export default class YamlObjectTransformer {
    
    public yamlToObjects(yamlString: string) {
        const yamlObject = yaml.parse(yamlString)
        return yamlObject;
    }
}