import { useContext } from 'react'

import {
  AppPreferencesContext,
} from './AppPreferencesContext'

export function useAppPreferences() {
  const context =
    useContext(
      AppPreferencesContext,
    )

  if (!context) {
    throw new Error(
      'useAppPreferences must be used inside AppPreferencesProvider.',
    )
  }

  return context
}