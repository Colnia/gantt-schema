"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, ArrowLeft } from "lucide-react"
import { Navbar } from "../../../Projektordning/projektordning-git/app/components/navbar"
import Link from "next/link"

export default function NewResourcePage() {
  const [resourceType, setResourceType] = useState("PERSON")

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link href="/resources">
              <Button variant="outline" size="sm" className="flex items-center mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tillbaka till resurser
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
              <User className="mr-3 h-8 w-8" /> 
              Lägg till ny resurs
            </h1>
          </div>
          <p className="text-muted-foreground">Skapa en ny resurs i systemet</p>
        </div>
        
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Resursinformation</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resource-name">Namn</Label>
                <Input id="resource-name" placeholder="Ange resursens namn" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resource-type">Typ</Label>
                <Select value={resourceType} onValueChange={setResourceType}>
                  <SelectTrigger id="resource-type">
                    <SelectValue placeholder="Välj resurstyp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSON">Tekniker</SelectItem>
                    <SelectItem value="EQUIPMENT">Utrustning</SelectItem>
                    <SelectItem value="MATERIAL">Material</SelectItem>
                    <SelectItem value="OTHER">Annat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {resourceType === "PERSON" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="resource-email">E-post</Label>
                    <Input id="resource-email" type="email" placeholder="E-postadress" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="resource-phone">Telefon</Label>
                    <Input id="resource-phone" placeholder="Telefonnummer" />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="resource-cost">Kostnad per timme (kr)</Label>
                <Input id="resource-cost" type="number" placeholder="0" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resource-capacity">Kapacitet (timmar per vecka)</Label>
                <Input id="resource-capacity" type="number" defaultValue="40" />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button">Avbryt</Button>
                <Button type="submit">Spara</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 