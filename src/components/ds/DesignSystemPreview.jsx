import { useState } from 'react';
import {
  Home,
  Wallet,
  PieChart,
  Bell,
  Settings,
  TrendingUp,
  Search,
  Star,
} from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';

// Design System — Saldo Design Constitution v1.2
// (docs/design/constitution/Saldo Design Constitution.dc.html)
//
// Página presentacional interna para comparar la implementación contra el
// documento de diseño. NO se monta en la navegación de App — se importa
// manualmente (o se agrega a una ruta temporal) solo para capturas de
// verificación. No contiene lógica de negocio.

const PALETTE = [
  { name: 'bg/base', swatch: 'bg-ds-bg-base', hex: '#FAFAFA' },
  { name: 'surface/raised', swatch: 'bg-ds-surface-raised', hex: '#FFFFFF' },
  { name: 'surface/sunken', swatch: 'bg-ds-surface-sunken', hex: '#F5F5F5' },
  { name: 'surface/inverse', swatch: 'bg-ds-surface-inverse', hex: '#1A1A1A' },
  { name: 'text/primary', swatch: 'bg-ds-text-primary', hex: '#1A1A1A' },
  { name: 'text/secondary', swatch: 'bg-ds-text-secondary', hex: '#6B6B6B' },
  { name: 'text/tertiary', swatch: 'bg-ds-text-tertiary', hex: '#9E9E9E' },
  { name: 'text/disabled', swatch: 'bg-ds-text-disabled', hex: '#C4C4C4' },
  { name: 'border/default', swatch: 'bg-ds-border', hex: '#E6E6E6' },
  { name: 'border/separator', swatch: 'bg-ds-border-separator', hex: '#F0F0F0' },
  { name: 'action/primary (acento)', swatch: 'bg-ds-accent', hex: '#3E5568' },
  { name: 'action/primary — hover', swatch: 'bg-ds-accent-hover', hex: '#384d5f' },
  { name: 'action/primary — tenue', swatch: 'bg-ds-accent-tint', hex: '#EEF1F4' },
  { name: 'state/success', swatch: 'bg-ds-success', hex: '#37725A' },
  { name: 'state/success — tenue', swatch: 'bg-ds-success-tint', hex: '#EDF4F0' },
  { name: 'state/warning', swatch: 'bg-ds-warning', hex: '#A97E38' },
  { name: 'state/warning — tenue', swatch: 'bg-ds-warning-tint', hex: '#F8F2E7' },
  { name: 'state/danger', swatch: 'bg-ds-danger', hex: '#A14D44' },
];

const TYPE_SPECIMENS = [
  { name: 'display', className: 'text-ds-display', sample: 'Balance total' },
  { name: 'heading', className: 'text-ds-heading', sample: 'Resumen del mes' },
  { name: 'title', className: 'text-ds-title', sample: 'Gastos por categoría' },
  { name: 'subtitle', className: 'text-ds-subtitle', sample: 'Últimos movimientos' },
  { name: 'body', className: 'text-ds-body', sample: 'Registrá tus ingresos y gastos con facilidad.' },
  { name: 'caption', className: 'text-ds-caption', sample: 'Actualizado hace 2 minutos' },
  { name: 'overline', className: 'text-ds-overline', sample: 'categoría' },
];

const ICON_ROW = [Home, Wallet, PieChart, Bell, Settings, TrendingUp, Search, Star];

const BUTTON_VARIANTS = ['primary', 'secondary', 'ghost'];
const BUTTON_SIZES = ['compact', 'standard', 'prominent'];

function SectionTitle({ children }) {
  return <h2 className="text-ds-title text-ds-text-primary mb-4">{children}</h2>;
}

function Swatch({ name, swatch, hex }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-16 w-full rounded-ds-surface border border-ds-border ${swatch}`} />
      <div className="text-ds-caption text-ds-text-primary font-medium">{name}</div>
      <div className="text-ds-caption">{hex}</div>
    </div>
  );
}

export function DesignSystemPreview() {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="font-ds min-h-screen bg-ds-bg-base p-12">
      <header className="mb-16">
        <p className="text-ds-overline mb-2">design system</p>
        <h1 className="text-ds-display text-ds-text-primary">Saldo — Fundación de Diseño</h1>
        <p className="text-ds-body text-ds-text-secondary mt-2">
          Especímenes de la Constitución de Diseño v1.2 para comparación lado a lado.
        </p>
      </header>

      {/* Paleta ------------------------------------------------------- */}
      <section className="mb-16">
        <SectionTitle>Paleta</SectionTitle>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {PALETTE.map((color) => (
            <Swatch key={color.name} {...color} />
          ))}
        </div>
      </section>

      {/* Tipografía ----------------------------------------------------- */}
      <section className="mb-16">
        <SectionTitle>Escala tipográfica</SectionTitle>
        <div className="flex flex-col gap-6">
          {TYPE_SPECIMENS.map((spec) => (
            <div key={spec.name} className="border-b border-ds-border-separator pb-6">
              <p className="text-ds-caption mb-1">{spec.name}</p>
              <p className={`${spec.className} text-ds-text-primary`}>{spec.sample}</p>
            </div>
          ))}

          {/* Numérica — cifra protagonista con decimales de-enfatizados */}
          <div className="border-b border-ds-border-separator pb-6">
            <p className="text-ds-caption mb-1">numeric-xl (con decimales al 50%/500/terciario)</p>
            <p className="text-ds-numeric-xl text-ds-text-primary text-left inline-flex items-baseline">
              24.860
              <span className="text-[50%] font-medium text-ds-text-secondary" style={{ fontVariantNumeric: 'tabular-nums' }}>
                ,32&nbsp;€
              </span>
            </p>
          </div>

          <div>
            <p className="text-ds-caption mb-1">numeric (tabular-nums, alineada a la derecha)</p>
            <p className="text-ds-numeric text-ds-text-primary w-48">1.204,50 €</p>
          </div>
        </div>
      </section>

      {/* Botones -------------------------------------------------------- */}
      <section className="mb-16">
        <SectionTitle>Button</SectionTitle>
        <div className="flex flex-col gap-8">
          {BUTTON_VARIANTS.map((variant) => (
            <div key={variant}>
              <p className="text-ds-caption mb-2">{variant}</p>
              <div className="flex flex-wrap items-center gap-4">
                {BUTTON_SIZES.map((size) => (
                  <Button key={size} variant={variant} size={size}>
                    {size}
                  </Button>
                ))}
                <Button variant={variant} icon={Star}>
                  con ícono
                </Button>
                <Button variant={variant} disabled>
                  disabled
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Input ------------------------------------------------------------ */}
      <section className="mb-16">
        <SectionTitle>Input</SectionTitle>
        <div className="grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          <Input
            label="Normal"
            placeholder="Descripción del movimiento"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Input label="Focus (hacé click)" placeholder="Tocá para ver el ring de foco" />
          <Input label="Error" placeholder="Monto" error="Ingresá un monto válido" />
          <Input label="Disabled" placeholder="No editable" disabled />
        </div>
      </section>

      {/* Card -------------------------------------------------------------- */}
      <section className="mb-16">
        <SectionTitle>Card</SectionTitle>
        <div className="max-w-md">
          <Card>
            <p className="text-ds-title text-ds-text-primary mb-2">Presupuesto mensual</p>
            <p className="text-ds-body text-ds-text-secondary">
              Superficie raised, borde 1px default, radio surface (10px), sin sombra en reposo.
            </p>
          </Card>
        </div>
      </section>

      {/* Iconografía --------------------------------------------------------- */}
      <section>
        <SectionTitle>Iconografía (Lucide, trazo 1.5)</SectionTitle>
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-ds-caption mb-2">20px — interfaz densa</p>
            <div className="flex items-center gap-4 text-ds-text-primary">
              {ICON_ROW.map((Icon, i) => (
                <Icon key={i} size={20} strokeWidth={1.5} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-ds-caption mb-2">24px — navegación</p>
            <div className="flex items-center gap-4 text-ds-text-primary">
              {ICON_ROW.map((Icon, i) => (
                <Icon key={i} size={24} strokeWidth={1.5} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DesignSystemPreview;
