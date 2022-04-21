import { Tsoa } from './../metadataGeneration/tsoa';

/**
 * For Swagger, additionalProperties is implicitly allowed. So use this function to clarify that undefined should be associated with allowing additional properties
 * @param test if this is undefined then you should interpret it as a "yes"
 */
export function isDefaultForAdditionalPropertiesAllowed(test: TsoaRoute.RefObjectModelSchema['additionalProperties']): test is undefined {
  return test === undefined;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TsoaRoute {
  export interface Models {
    [name: string]: ModelSchema;
  }

  /**
   * This is a convenience type so you can check .properties on the items in the Record without having TypeScript throw a compiler error. That's because this Record can't have enums in it. If you want that, then just use the base interface
   */
  export interface RefObjectModels extends TsoaRoute.Models {
    [refNames: string]: TsoaRoute.RefObjectModelSchema;
  }

  export interface RefEnumModelSchema {
    dataType: 'refEnum';
    enums: Array<string | number>;
    xml?: Tsoa.XML;
  }

  export interface RefObjectModelSchema {
    dataType: 'refObject';
    properties: { [name: string]: PropertySchema };
    additionalProperties?: boolean | PropertySchema;
    xml?: Tsoa.XML;
  }

  export interface RefTypeAliasModelSchema {
    dataType: 'refAlias';
    type: PropertySchema;
    xml?: Tsoa.XML;
  }

  export type ModelSchema = RefEnumModelSchema | RefObjectModelSchema | RefTypeAliasModelSchema;

  export type PropertySchema = RefSchema | ArraySchema | EnumSchema | IntersectionSchema | UnionSchema | NestedObjectLiteralSchema | PrimitiveSchema;

  export type ValidatorSchema = Tsoa.Validators;

  export interface SchemaBase {
    required?: boolean;
    validators?: ValidatorSchema;
    default?: unknown;
    xml?: Tsoa.XML;
  }

  export interface RefSchema extends SchemaBase {
    dataType?: undefined;
    ref: string;
  }

  export interface ArraySchema extends SchemaBase {
    dataType: 'array';
    array: PropertySchema;
  }

  export interface EnumSchema extends SchemaBase {
    dataType: 'enum';
    enums?: Array<string | number | boolean | null>;
  }

  export interface IntersectionSchema extends SchemaBase {
    dataType: 'intersection';
    subSchemas: PropertySchema[];
  }

  export interface UnionSchema extends SchemaBase {
    dataType: 'union';
    subSchemas: PropertySchema[];
  }

  export interface NestedObjectLiteralSchema extends SchemaBase {
    dataType: 'nestedObjectLiteral';
    additionalProperties?: boolean | PropertySchema;
    nestedProperties: { [name: string]: PropertySchema };
  }

  export interface PrimitiveSchema extends SchemaBase {
    dataType: 'string' | 'boolean' | 'integer' | 'long' | 'float' | 'double' | 'date' | 'datetime' | 'buffer' | 'undefined' | 'any' | 'object' | 'void' | 'file' | 'binary' | 'byte';
  }

  export type ParameterSchema = PropertySchema & {
    name: string;
    in: string;
  };

  export interface Security {
    [key: string]: string[];
  }
}
