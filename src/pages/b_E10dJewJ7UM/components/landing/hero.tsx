"use client"

import { Button } from "@/components/ui/button"
import { Check, ArrowRight, Sparkles } from "lucide-react"
import { AppMockup } from "./app-mockup"

const benefits = [
  "Gratis para siempre en lo esencial",
  "Análisis con IA incluido desde el día uno",
  "Tus datos son privados y seguros",
]

export function Hero() {
  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/60 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-violet-200/50 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-100/40 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
          {/* Left Column */}
          <div className="flex flex-col justify-center order-2 lg:order-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium w-fit mb-6">
              <span>📊</span>
              <span>App gratuita de finanzas personales con IA</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 text-balance">
              Deja de llegar a fin de mes{" "}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-pink-500 bg-clip-text text-transparent">
                sin saber qué pasó.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-muted-foreground mb-8 max-w-lg text-pretty">
              Registra tus gastos, visualiza patrones reales y recibe análisis con IA — gratis, en segundos.
            </p>

            {/* Benefits */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-base px-8 h-12"
              >
                Comenzar gratis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-xl text-base px-8 h-12 border-border bg-card hover:bg-accent"
              >
                Ya tengo cuenta
              </Button>
            </div>
          </div>

          {/* Right Column - App Mockup */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative">
              {/* AI Active Badge */}
              <div className="absolute -top-4 right-4 lg:right-8 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-card rounded-full shadow-lg border border-border">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">IA activa</span>
              </div>
              
              <AppMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
