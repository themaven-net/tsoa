import { Tsoa } from './../metadataGeneration/tsoa';

type jsontoxmlNode = {
  name: string;
  attrs: Record<string, string>;
  children: Array<jsontoxmlNode | string>;
};

function makeNode(name: string): jsontoxmlNode {
  return { name, attrs: {}, children: [] };
}

function addChild(node: jsontoxmlNode, child: jsontoxmlNode | string) {
  node.children.push(child);
}

function addAttribute(node: jsontoxmlNode, name: string, value: any) {
  node.attrs[name] = String(value);
}

export function toXml(schema: Tsoa.Type, value: any, name = 'response'): jsontoxmlNode {
  function rec(schema: Tsoa.Type, value: any, parent: jsontoxmlNode, outerName: string, outerXml?: Tsoa.XML) {
    const name = (schema as Record<string, any>).xml?.name ?? outerName;
    switch (schema.dataType) {
      case 'refObject':
      case 'nestedObjectLiteral': {
        const wrapper = makeNode(name);
        addChild(parent, wrapper);
        for (const property of schema.properties) {
          const propertyValue = value[property.name];
          if (propertyValue !== undefined) {
            //console.log('toXml property', property.name);
            rec(property.type, propertyValue, wrapper, property.xml?.name ?? property.name, property.xml);
          }
        }
        break;
      }
      case 'array': {
        let wrapper = parent;
        if (outerXml?.wrapper) {
          wrapper = makeNode(name);
          addChild(parent, wrapper);
        }
        for (const item of value) rec(schema.elementType, item, wrapper, name, outerXml);
        break;
      }
      case 'refAlias': {
        rec(schema.type, value, parent, name, schema?.xml ?? outerXml);
        break;
      }
      default: {
        if (((schema as Record<string, any>).xml ?? outerXml)?.attribute) addAttribute(parent, name, value);
        else {
          const child = makeNode(name);
          addChild(child, String(value));
          addChild(parent, child);
        }
        break;
      }
    }
  }
  const root = makeNode(name);
  rec(schema, value, root, name);
  return typeof root.children[0] === 'string' ? root : root.children[0];
}
