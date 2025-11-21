'use client'

import { ReactNode } from 'react'

interface Props {
  formName: string
  formVersion?: string
  children: ReactNode
}

export function FormContainer({ formName, formVersion, children }: Props) {
  // Minimal container - only renders the form content without any additional UI
  // The form itself should handle all visual elements
  return <>{children}</>
}