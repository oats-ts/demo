import { generate, Logger } from '@oats-ts/oats-ts'
import typescriptParser from 'prettier/parser-typescript'
import {
  formatters,
  validator,
  readers,
  writers,
  presets,
  nameProviders,
  pathProviders,
  generator,
  loggers,
} from '@oats-ts/openapi'
import debounce from 'lodash/debounce'
import isNil from 'lodash/isNil'
import {
  EditorInput,
  ExplorerTreeState,
  GeneratorContextType,
  GeneratorOutput,
  InlineOpenAPINode,
  OpenAPIInputNode,
  RemoteOpenAPINode,
} from '../types'
import { Options } from 'prettier'
import { useContext, useEffect, useState } from 'react'
import { isSuccess, Try } from '@oats-ts/try'
import { GeneratedFile } from '@oats-ts/typescript-writer'
import { OpenAPIGeneratorTarget } from '@oats-ts/openapi-common'
import { storage, Ttl } from '../storage'
import { defaultGenerators } from './defaultGenerators'
import { getSampleFiles } from './getSampleFiles'
import { buildExplorerTree } from './buildExplorerTree'
import { GeneratorContext } from './GeneratorContext'
import { demoDoc } from './demoDoc'

const baseOptions: Options = {
  parser: 'typescript',
  plugins: [typescriptParser],
}

function createReader(input: OpenAPIInputNode) {
  switch (input.type) {
    case 'inline-openapi':
      return readers.test[input.language]({
        path: '',
        content: new Map().set('', input.content),
      })
    case 'remote-openapi':
      return readers[input.protocol][input.language](input.path)
  }
}

export function useGeneratorContext(): GeneratorContextType {
  const [samples, setSamples] = useState<string[]>([])
  const [inlineSource, setInlineSource] = useState<InlineOpenAPINode>({
    type: 'inline-openapi',
    content: demoDoc,
    language: 'json',
  })
  const [remoteSource, setRemoteSource] = useState<RemoteOpenAPINode>({
    type: 'remote-openapi',
    language: 'mixed',
    path: '',
    protocol: 'mixed',
  })
  const [source, _setSource] = useState<OpenAPIInputNode>(inlineSource)
  const [generators, setGenerators] = useState<Record<OpenAPIGeneratorTarget, boolean>>(() =>
    storage.get('generators', defaultGenerators),
  )
  const [isSamplesLoading, setSamplesLoading] = useState<boolean>(true)
  const [isGenerating, setGenerating] = useState<boolean>(true)
  const [isIssuesPanelOpen, setIssuesPanelOpen] = useState<boolean>(false)
  const [isConfigurationPanelOpen, setConfigurationPanelOpen] = useState<boolean>(false)
  const [results, setResults] = useState<GeneratorOutput>({
    data: { type: 'folder', path: '/', name: '/', children: [] },
    status: 'success',
    issues: [],
  })
  const [editorInput, setEditorInput] = useState<EditorInput | undefined>(source)
  const [explorerTreeState, setExplorerTreeState] = useState<ExplorerTreeState>({})

  function processResult(output: Try<GeneratedFile[]>): void {
    setExplorerTreeState({})
    if (isSuccess(output)) {
      const { data } = output
      setResults({ data: buildExplorerTree(data), issues: [], status: 'success' })
    } else {
      setResults({
        data: { type: 'folder', name: '/', path: '/', children: [] },
        issues: [],
        status: 'failure',
      })
    }
  }

  function setSource(input: OpenAPIInputNode): void {
    _setSource(input)
    if (input.type === 'inline-openapi') {
      setInlineSource(input)
    } else {
      setRemoteSource(input)
    }
    setEditorInput(input)
  }

  useEffect(
    debounce(() => {
      storage.set('generators', generators, Ttl.days(1))
    }, 1000),
    [generators],
  )

  useEffect(() => {
    setSamplesLoading(true)
    const inStorage = storage.get<string[]>('samples')
    if (!isNil(inStorage) && Array.isArray(inStorage)) {
      setSamples(inStorage)
      setSamplesLoading(false)
    } else {
      getSampleFiles(['schemas', 'generated-schemas'])
        .then((fetchedSamples) => {
          setSamples(fetchedSamples)
          storage.set('samples', fetchedSamples, Ttl.hours(1))
        })
        .finally(() => setSamplesLoading(false))
    }
  }, [])

  useEffect(
    debounce(() => {
      setGenerating(true)
      setResults({
        data: { type: 'folder', children: [], name: '/', path: '/' },
        issues: [],
        status: 'working',
      })
      // TODO warnings not emmited for some reason
      const logger: Logger = (emitter) => {
        loggers.simple()(emitter)
        emitter.addListener('validator-step-completed', ({ issues }) => {
          setResults((results) => ({ ...results, issues }))
        })
      }
      generate({
        logger,
        validator: validator(),
        reader: createReader(source),
        generator: generator({
          nameProvider: nameProviders.default(),
          pathProvider: pathProviders.default(''),
          children: presets.fullStack({ overrides: generators }),
        }),
        writer: writers.typescript.memory({
          format: formatters.prettier({ ...baseOptions }),
        }),
      })
        .then(processResult)
        .finally(() => setGenerating(false))
    }, 500),
    [generators, source],
  )

  return {
    generators,
    inlineSource,
    remoteSource,
    results,
    samples,
    isLoading: isSamplesLoading || isGenerating,
    isConfigurationPanelOpen,
    isIssuesPanelOpen,
    editorInput,
    explorerTreeState,
    source,
    setSource,
    setInlineSource,
    setRemoteSource,
    setExplorerTreeState,
    setEditorInput,
    setIssuesPanelOpen,
    setConfigurationPanelOpen,
    setGenerators,
  }
}

export function useGenerator(): GeneratorContextType {
  return useContext(GeneratorContext)
}
