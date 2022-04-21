import type { Tsoa } from './../metadataGeneration/tsoa';
import type { TsoaRoute } from './../routeGeneration/tsoa-route';

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

export function toXml(models: TsoaRoute.Models, schema: TsoaRoute.ModelSchema | TsoaRoute.PropertySchema, value: any, name = 'response'): jsontoxmlNode {
  function rec(schema: TsoaRoute.ModelSchema | TsoaRoute.PropertySchema, value: any, parent: jsontoxmlNode, outerName: string, outerXml?: Tsoa.XML) {
    if ((schema as Record<string, any>).ref)
      return rec(models[(schema as Record<string, any>).ref], value, parent, schema?.xml?.name ?? outerName, schema.xml ?? outerXml)
    const name = (schema as Record<string, any>).xml?.name ?? outerName;
    switch (schema.dataType) {
      case 'refObject':
      case 'nestedObjectLiteral': {
        const properties = schema.dataType === 'refObject' ? (schema as TsoaRoute.RefObjectModelSchema).properties : (schema ).nestedProperties ?? {}
        const wrapper = makeNode(name);
        addChild(parent, wrapper);
        for (const [propertyKey, propertySchema] of Object.entries(properties)) {
          const propertyValue = value[propertyKey];
          if (propertyValue !== undefined) {
            //console.log('toXml propertyKey', propertyKey);
            rec(propertySchema, propertyValue, wrapper, propertySchema.xml?.name ?? propertyKey, propertySchema.xml);
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
        for (const item of value) rec(schema.array ?? {}, item, wrapper, name, outerXml);
        break;
      }
      case 'refAlias': {
        rec((schema as TsoaRoute.RefTypeAliasModelSchema).type, value, parent, name, schema?.xml ?? outerXml);
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
