import {
  ConfigurationNode,
  GeneratorConfiguration,
  ReaderConfiguration,
  SourceLanguage,
  WriterConfiguration,
} from '../../types'
import { createPrinter, factory, NewLineKind, NodeFlags, Statement, SyntaxKind } from 'typescript'
import typescriptParser from 'prettier/parser-typescript'
import prettier from 'prettier/standalone'
import { isNil } from 'lodash'
import { CommentConfig } from '@oats-ts/typescript-writer'
import { defaultPrettierConfig } from './deafultPrettierConfig'
import YAML from 'yamljs'

function getCompressedSource(source: string, language: SourceLanguage): string {
  try {
    if (language === 'yaml') {
      return YAML.stringify(YAML.parse(source))
    } else if (language === 'json') {
      return JSON.stringify(JSON.parse(source))
    }
  } catch (e) {
    console.error(e)
  }
  return source
}

function getInlineVariable(reader: ReaderConfiguration) {
  const compressedSource = getCompressedSource(reader.inlineContent, reader.inlineLanguage)
  return factory.createVariableStatement(
    undefined,
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier(`${reader.inlineLanguage}Source`),
          undefined,
          undefined,
          factory.createNoSubstitutionTemplateLiteral(compressedSource, compressedSource),
        ),
      ],
      NodeFlags.Const,
    ),
  )
}

function getInlineReaderAst(reader: ReaderConfiguration) {
  const inlinePath = `inline.${reader.inlineLanguage}`
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createPropertyAccessExpression(factory.createIdentifier('readers'), factory.createIdentifier('test')),
      factory.createIdentifier(reader.inlineLanguage),
    ),
    undefined,
    [
      factory.createObjectLiteralExpression(
        [
          factory.createPropertyAssignment(factory.createIdentifier('path'), factory.createStringLiteral(inlinePath)),
          factory.createPropertyAssignment(
            factory.createIdentifier('content'),
            factory.createObjectLiteralExpression([
              factory.createPropertyAssignment(
                factory.createStringLiteral(inlinePath),
                factory.createIdentifier(`${reader.inlineLanguage}Source`),
              ),
            ]),
          ),
        ],
        true,
      ),
    ],
  )
}

function getRemoteReaderAst(reader: ReaderConfiguration) {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier('readers'),
        factory.createIdentifier(reader.remoteProtocol),
      ),
      factory.createIdentifier(reader.remoteLanguage),
    ),
    undefined,
    [factory.createStringLiteral(reader.remotePath)],
  )
}

function getReaderAst(reader: ReaderConfiguration) {
  if (reader.readerType === 'inline') {
    return getInlineReaderAst(reader)
  } else {
    return getRemoteReaderAst(reader)
  }
}

function getGenerators(generator: GeneratorConfiguration) {
  return factory.createArrayLiteralExpression(
    generator.generators.map((target) =>
      factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier('generators'),
          factory.createIdentifier('create'),
        ),
        undefined,
        [factory.createStringLiteral(target)],
      ),
    ),
    true,
  )
}

function getPreset(generator: GeneratorConfiguration) {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier('presets'),
      factory.createIdentifier(generator.preset),
    ),
    undefined,
    [],
  )
}

function getGeneratorChildren(generator: GeneratorConfiguration) {
  return generator.configurationStyle === 'preset' ? getPreset(generator) : getGenerators(generator)
}

function getGeneratorAst(generator: GeneratorConfiguration) {
  return factory.createCallExpression(factory.createIdentifier('generator'), undefined, [
    factory.createObjectLiteralExpression(
      [
        factory.createPropertyAssignment(
          factory.createIdentifier('nameProvider'),
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier('nameProviders'),
              factory.createIdentifier('default'),
            ),
            undefined,
            [],
          ),
        ),
        factory.createPropertyAssignment(
          factory.createIdentifier('pathProvider'),
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier('pathProviders'),
              factory.createIdentifier(generator.pathProviderType),
            ),
            undefined,
            [factory.createStringLiteral(generator.rootPath)],
          ),
        ),
        factory.createPropertyAssignment(factory.createIdentifier('children'), getGeneratorChildren(generator)),
      ],
      true,
    ),
  ])
}

function getLiteral(input: number | string | boolean) {
  switch (typeof input) {
    case 'boolean':
      return input ? factory.createTrue() : factory.createFalse()
    case 'number':
      return factory.createNumericLiteral(input)
    case 'string':
      return factory.createStringLiteral(input)
  }
}

function getFormatterAst(writer: WriterConfiguration) {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier('formatters'),
      factory.createIdentifier('prettier'),
    ),
    undefined,
    [
      factory.createObjectLiteralExpression(
        [
          factory.createPropertyAssignment(
            factory.createIdentifier('parser'),
            factory.createStringLiteral('typescript'),
          ),
          ...Object.entries(writer.prettier)
            .filter(([key, value]) => !isNil(value) && value !== (defaultPrettierConfig as Record<string, any>)[key])
            .map(([key, value]) => factory.createPropertyAssignment(factory.createIdentifier(key), getLiteral(value))),
        ],
        true,
      ),
    ],
  )
}

function getLeadingOrTrailingCommentsAst(comments: CommentConfig[]) {
  return factory.createArrayLiteralExpression(
    comments.map((comment) =>
      factory.createObjectLiteralExpression(
        [
          factory.createPropertyAssignment(factory.createIdentifier('type'), factory.createStringLiteral(comment.type)),
          factory.createPropertyAssignment(factory.createIdentifier('text'), factory.createStringLiteral(comment.text)),
        ],
        false,
      ),
    ),
  )
}

function getCommentsAst(comments: WriterConfiguration) {
  return factory.createObjectLiteralExpression(
    [
      ...(comments.leadingComments.length > 0
        ? [
            factory.createPropertyAssignment(
              factory.createIdentifier('leadingComments'),
              getLeadingOrTrailingCommentsAst(comments.leadingComments),
            ),
          ]
        : []),
      ...(comments.trailingComments.length > 0
        ? [
            factory.createPropertyAssignment(
              factory.createIdentifier('trailingComments'),
              getLeadingOrTrailingCommentsAst(comments.trailingComments),
            ),
          ]
        : []),
    ],
    true,
  )
}

function getWriterAst(writer: WriterConfiguration) {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier('writers'),
        factory.createIdentifier('typescript'),
      ),
      factory.createIdentifier(writer.writerType),
    ),
    undefined,
    [
      factory.createObjectLiteralExpression(
        [
          ...(writer.useFormatter
            ? [factory.createPropertyAssignment(factory.createIdentifier('format'), getFormatterAst(writer))]
            : []),
          ...(writer.leadingComments.length > 0 || writer.trailingComments.length > 0
            ? [factory.createPropertyAssignment(factory.createIdentifier('comments'), getCommentsAst(writer))]
            : []),
        ],
        true,
      ),
    ],
  )
}

function getGenerateCallAst(config: ConfigurationNode) {
  return factory.createExpressionStatement(
    factory.createCallExpression(factory.createIdentifier('generate'), undefined, [
      factory.createObjectLiteralExpression(
        [
          factory.createPropertyAssignment(
            factory.createIdentifier('logger'),
            factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier('loggers'),
                factory.createIdentifier('simple'),
              ),
              undefined,
              [],
            ),
          ),
          factory.createPropertyAssignment(
            factory.createIdentifier('validator'),
            factory.createCallExpression(factory.createIdentifier('validator'), undefined, []),
          ),
          factory.createPropertyAssignment(factory.createIdentifier('reader'), getReaderAst(config.reader)),
          factory.createPropertyAssignment(factory.createIdentifier('generator'), getGeneratorAst(config.generator)),
          factory.createPropertyAssignment(factory.createIdentifier('writer'), getWriterAst(config.writer)),
        ],
        true,
      ),
    ]),
  )
}

function getImportDeclarations({ writer, generator }: ConfigurationNode) {
  const openApiImports = [
    'formatters',
    'generator',
    'generators',
    'loggers',
    'nameProviders',
    'pathProviders',
    'presets',
    'readers',
    'validator',
    'writers',
  ]
    .filter((name) => (name === 'formatters' ? writer.useFormatter : true))
    .filter((name) => (generator.configurationStyle === 'generators' ? name !== 'presets' : name !== 'generators'))
    .map((name) => factory.createImportSpecifier(false, undefined, factory.createIdentifier(name)))

  const openApiImport = factory.createImportDeclaration(
    undefined,
    undefined,
    factory.createImportClause(false, undefined, factory.createNamedImports(openApiImports)),
    factory.createStringLiteral('@oats-ts/openapi'),
    undefined,
  )

  const generateImport = factory.createImportDeclaration(
    undefined,
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports([
        factory.createImportSpecifier(false, undefined, factory.createIdentifier('generate')),
      ]),
    ),
    factory.createStringLiteral('@oats-ts/oats-ts'),
    undefined,
  )

  return [generateImport, openApiImport]
}

export function getGeneratorSource(config: ConfigurationNode): string {
  const contents: Statement[][] = [
    getImportDeclarations(config),
    config.reader.readerType === 'inline' ? [getInlineVariable(config.reader)] : [],
    [getGenerateCallAst(config)],
  ]

  const sourceFiles = contents
    .filter((statements) => statements.length > 0)
    .map((statements) =>
      factory.createSourceFile(statements, factory.createToken(SyntaxKind.EndOfFileToken), NodeFlags.None),
    )

  const printer = createPrinter({
    newLine: NewLineKind.LineFeed,
    removeComments: false,
  })

  return prettier.format(sourceFiles.map((file) => printer.printFile(file)).join('\n\n'), {
    parser: 'typescript',
    plugins: [typescriptParser],
  })
}
