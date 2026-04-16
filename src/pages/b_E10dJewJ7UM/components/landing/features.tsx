"use client"

import { Card } from "@/components/ui/card"
import { 
  Sparkles, 
  PieChart, 
  Shield, 
  Zap, 
  Bell, 
  Target 
} from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "Análisis con IA",
    description: "Obtén insights automáticos sobre tus patrones de gasto y recomendaciones personalizadas.",
    color: "text-primary",
    bg: "bg-purple-100",
  },
  {
    icon: PieChart,
    title: "Visualizaciones claras",
    description: "Gráficos intuitivos que te muestran exactamente a dónde va tu dinero cada mes.",
    color: "text-blue-500",
    bg: "bg-blue-100",
  },
  {
    icon: Shield,
    title: "100% privado y seguro",
    description: "Tus datos financieros están encriptados y nunca se comparten con terceros.",
    color: "text-emerald-500",
    bg: "bg-emerald-100",
  },
  {
    icon: Zap,
    title: "Registro en segundos",
    description: "Añade gastos rápidamente con nuestra interfaz simple y fluida.",
    color: "text-yellow-500",
    bg: "bg-yellow-100",
  },
  {
    icon: Bell,
    title: "Alertas inteligentes",
    description: "Recibe notificaciones cuando te acerques a tus límites de presupuesto.",
    color: "text-orange-500",
    bg: "bg-orange-100",
  },
  {
    icon: Target,
    title: "Metas de ahorro",
    description: "Define objetivos financieros y haz seguimiento de tu progreso fácilmente.",
    color: "text-indigo-500",
    bg: "bg-indigo-100",
  },
]

export function Features() {
  return (
    <section className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Todo en un mismo lugar, sin complicaciones
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Las herramientas que necesitas para tomar el control de tus finanzas personales.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group bg-card"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
