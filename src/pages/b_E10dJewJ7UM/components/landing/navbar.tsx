"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg bg-gradient-to-r from-blue-500 via-primary to-pink-500 bg-clip-text text-transparent">
              Budget Calculator
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Link 
              href="#" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Iniciar sesión
            </Link>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
              Comenzar gratis
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
