/// <reference types="react" />

"use client"

import React from "react"
import { 
  CheckSquare, 
  Milestone, 
  Package, 
  Truck,
  FileCheck, 
  Folder, 
  FolderOpen, 
  CircleDashed,
  Flag, 
  HelpCircle 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface IconProps {
  className?: string
  size?: number
}

export function TaskIcon({ className, size = 16 }: IconProps) {
  return <CheckSquare className={cn("text-blue-500", className)} size={size} />
}

export function MilestoneIcon({ className, size = 16 }: IconProps) {
  return <Milestone className={cn("text-gray-700 fill-gray-700", className)} size={size} />
}

export function DeliveryIcon({ className, size = 16 }: IconProps) {
  return <Truck className={cn("text-amber-500 fill-amber-500", className)} size={size} />
}

export function DecisionIcon({ className, size = 16 }: IconProps) {
  return <FileCheck className={cn("text-green-500", className)} size={size} />
}

export function PhaseIconClosed({ className, size = 16 }: IconProps) {
  return <Folder className={cn("text-slate-500", className)} size={size} />
}

export function PhaseIconOpen({ className, size = 16 }: IconProps) {
  return <FolderOpen className={cn("text-slate-500", className)} size={size} />
}

export function UnknownTypeIcon({ className, size = 16 }: IconProps) {
  return <HelpCircle className={cn("text-gray-500", className)} size={size} />
}

export function getActivityIcon(type: string | null | undefined, expanded: boolean = false) {
  if (!type) return <UnknownTypeIcon />
  
  switch (type.toLowerCase()) {
    case "task":
      return <TaskIcon />
    case "milestone":
      return <MilestoneIcon />
    case "delivery":
      return <DeliveryIcon />
    case "decision":
      return <DecisionIcon />
    case "phase":
      return expanded ? <PhaseIconOpen /> : <PhaseIconClosed />
    default:
      return <UnknownTypeIcon />
  }
} 