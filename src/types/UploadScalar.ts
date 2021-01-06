import { scalarType } from '@nexus/schema'

export const UploadScalar = scalarType({
  name: 'Upload',
  description: 'The `Upload` scalar type represents a file upload.',
  parseValue(value: any) {
    return value
  },
  serialize(value: any) {
    return value
  },
  parseLiteral(ast) {
    console.log(ast)
    throw new Error('‘Upload’ scalar literal unsupported.')
  },
})