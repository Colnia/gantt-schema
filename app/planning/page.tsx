"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderClosed, Plus } from "lucide-react"
import { Navbar } from "../../Projektordning/projektordning-git/app/components/navbar"

export default function PlanningPage() {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <FolderClosed className="mr-3 h-8 w-8" /> 
            Projektplanering
          </h1>
          <p className="text-muted-foreground">Hantera och övervaka dina projekt</p>
        </div>
        
        <div className="grid gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Projektlista</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Här visas en lista över alla projekt.</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Skapa nytt projekt
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 