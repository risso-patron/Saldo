"use client"

import { Card } from "@/components/ui/card"
import { 
  TrendingUp, 
  TrendingDown, 
  Coffee, 
  ShoppingBag, 
  Zap, 
  Car,
  ChevronDown
} from "lucide-react"

const transactions = [
  { icon: Coffee, label: "Starbucks", amount: -45, color: "text-amber-500", bg: "bg-amber-100" },
  { icon: ShoppingBag, label: "Supermercado", amount: -128, color: "text-blue-500", bg: "bg-blue-100" },
  { icon: Zap, label: "Luz del mes", amount: -89, color: "text-yellow-500", bg: "bg-yellow-100" },
  { icon: Car, label: "Uber", amount: -35, color: "text-slate-500", bg: "bg-slate-100" },
]

const categories = [
  { label: "Comida", percentage: 35, color: "bg-primary" },
  { label: "Transporte", percentage: 20, color: "bg-blue-500" },
  { label: "Servicios", percentage: 25, color: "bg-emerald-500" },
  { label: "Otros", percentage: 20, color: "bg-amber-500" },
]

export function AppMockup() {
  return (
    <div className="relative w-full max-w-sm lg:max-w-md transform lg:rotate-2 transition-transform hover:rotate-0 duration-500">
      {/* Phone Frame */}
      <div className="relative bg-card rounded-[2.5rem] p-3 shadow-2xl border border-border/50">
        {/* Screen */}
        <div className="bg-secondary/30 rounded-[2rem] overflow-hidden">
          {/* Status Bar */}
          <div className="bg-card px-6 py-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 bg-foreground/80 rounded-sm" />
            </div>
          </div>

          {/* App Content */}
          <div className="px-4 pb-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-lg font-semibold text-foreground">¡Hola, Luis! 👋</p>
                <p className="text-sm text-muted-foreground">Tu resumen financiero</p>
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-secondary rounded-lg text-sm text-muted-foreground">
                Abril
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Main Balance Card */}
            <Card className="p-4 bg-gradient-to-br from-primary to-violet-600 text-primary-foreground border-0">
              <p className="text-sm text-primary-foreground/80 mb-1">Saldo del mes</p>
              <p className="text-3xl font-bold">$1,240</p>
              <div className="flex items-center gap-1 mt-2 text-emerald-300">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+12% vs mes anterior</span>
              </div>
            </Card>

            {/* Income vs Expenses */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-xs text-muted-foreground">Ingresos</span>
                </div>
                <p className="text-lg font-semibold text-emerald-600">$4,500</p>
              </Card>
              <Card className="p-3 border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Gastos</span>
                </div>
                <p className="text-lg font-semibold text-red-500">$3,260</p>
              </Card>
            </div>

            {/* Spending by Category */}
            <Card className="p-4 border-border/50">
              <p className="text-sm font-medium text-foreground mb-3">Gastos por categoría</p>
              <div className="flex h-3 rounded-full overflow-hidden mb-3">
                {categories.map((cat, i) => (
                  <div 
                    key={i} 
                    className={`${cat.color}`} 
                    style={{ width: `${cat.percentage}%` }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {categories.map((cat, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                    <span className="text-xs text-muted-foreground">{cat.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Transactions */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Últimos movimientos</p>
              <div className="space-y-2">
                {transactions.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 bg-card rounded-xl border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${tx.bg} flex items-center justify-center`}>
                        <tx.icon className={`w-4 h-4 ${tx.color}`} />
                      </div>
                      <span className="text-sm text-foreground">{tx.label}</span>
                    </div>
                    <span className="text-sm font-medium text-red-500">${Math.abs(tx.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shadow effect */}
      <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-[3rem] -z-10 blur-2xl" />
    </div>
  )
}
