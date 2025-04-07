"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, User, Database, Bell } from "lucide-react"
import { Navbar } from "../../Projektordning/projektordning-git/app/components/navbar"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Settings className="mr-3 h-8 w-8" /> 
            Inställningar
          </h1>
          <p className="text-muted-foreground">Hantera applikationsinställningar och användarkonfiguration</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Användarprofil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Hantera din användarprofil och inställningar.</p>
              <Button className="mt-4" variant="outline">Redigera profil</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifieringar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Hantera notifieringsinställningar.</p>
              <Button className="mt-4" variant="outline">Konfigurera notifieringar</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Systemkonfiguration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Konfigurera systemrelaterade inställningar.</p>
              <Button className="mt-4" variant="outline">Systemkonfiguration</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 