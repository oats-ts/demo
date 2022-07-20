import isNil from 'lodash/isNil'
import React, { FC } from 'react'
import { useGeneratorContext } from '../model/useGenerator'
import { useColorMode } from '../../useColorMode'
import { ConfigurationEditorWrapper } from './configuration/ConfigurationEditorWrapper'
import { NoEditor } from './NoEditor'
import { ReadonlyTypescriptEditor } from './ReadonlyTypescriptEditor'
import { IssuesPanel } from './IssuesPanel'

export const EditorView: FC = () => {
  const { editorInput, isLoading } = useGeneratorContext()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  if (isNil(editorInput)) {
    return <NoEditor isDark={isDark} isLoading={isLoading} />
  }
  switch (editorInput?.type) {
    case 'file': {
      return <ReadonlyTypescriptEditor input={editorInput} isDark={isDark} isLoading={isLoading} />
    }
    case 'configuration': {
      return <ConfigurationEditorWrapper />
    }
    case 'issues': {
      return <IssuesPanel isLoading={isLoading} isDark={isDark} node={editorInput} />
    }
    default:
      throw new TypeError(`Unexpected input of type "${editorInput.type}"`)
  }
}
