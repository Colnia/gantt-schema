"use client"

import React, { ReactNode } from "react"
import { ProjectProvider } from "./ProjectContext"
import { UIProvider } from "./UIContext"
import { SelectionProvider } from "./SelectionContext"
import { InteractionProvider } from "./InteractionContext"

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ProjectProvider>
      <UIProvider>
        <SelectionProvider>
          <InteractionProvider>
            {children}
          </InteractionProvider>
        </SelectionProvider>
      </UIProvider>
    </ProjectProvider>
  )
} 