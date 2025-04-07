"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart, PieChart } from "lucide-react"
import { Navbar } from "../../../Projektordning/projektordning-git/app/components/navbar"

export default function StatsPage() {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <BarChart className="mr-3 h-8 w-8" /> 
            Projektstatistik
          </h1>
          <p className="text-muted-foreground">Analysera projektdata och prestationsstatistik</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="h-5 w-5 mr-2" />
                Projektframgång
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Grafvisning av projektframgång kommer här.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Resursanvändning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Grafvisning av resursanvändning kommer här.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Budgetanalys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Grafvisning av budgetanalys kommer här.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 