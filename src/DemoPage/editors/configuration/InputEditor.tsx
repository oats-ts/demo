import { isNil } from 'lodash'
import React, { FC } from 'react'
import { GeneratorConfiguration, ReaderConfiguration } from '../../../types'
import { useColorMode } from '../../../useColorMode'
import { useGenerator } from '../../model/useGenerator'
import { ReadonlyGeneratorSourceEditor } from '../ReadonlyGeneratorSourceEditor'
import { GeneratorEditor } from './GeneratorEditor'
import { InlineReaderEditor } from './InlineReaderEditor'
import { RemoteReaderEditor } from './RemoteReaderEditor'

export const InputEditor: FC = () => {
  const { editorInput, samples, configuration, generatorSource, setConfiguration } = useGenerator()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  if (isNil(editorInput) || editorInput.type !== 'configuration') {
    return null
  }
  switch (editorInput.active) {
    case 'inline-reader': {
      const onChange = (reader: ReaderConfiguration) =>
        setConfiguration({ ...configuration, active: 'inline-reader', reader })
      return <InlineReaderEditor input={editorInput.reader} isDark={isDark} onChange={onChange} />
    }
    case 'remote-reader': {
      const onChange = (reader: ReaderConfiguration) =>
        setConfiguration({ ...configuration, active: 'remote-reader', reader })
      return <RemoteReaderEditor input={editorInput.reader} isDark={isDark} onChange={onChange} samples={samples} />
    }
    case 'generator': {
      const onChange = (generator: GeneratorConfiguration) =>
        setConfiguration({ ...configuration, active: 'generator', generator })
      return <GeneratorEditor input={editorInput.generator} isDark={isDark} onChange={onChange} />
    }
    case 'generator-source': {
      return <ReadonlyGeneratorSourceEditor source={generatorSource} isDark={isDark} />
    }
  }
}
