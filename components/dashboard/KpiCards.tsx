'use client';

import React from 'react';
import {
  TrendingUp,
  MoreVertical,
  Users2,
  CalendarCheck,
  UserPlus,
  Layers,
  BarChart2,
} from 'lucide-react';

interface KpiCardsProps {
  onOpenDuplas?: () => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ onOpenDuplas }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      {/* 2x2 Metric Cards (Left 2 columns on XL) */}
      <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Total Pacientes Ingresados */}
        <div className="bg-surface rounded-[var(--radius-md)] border border-border p-5 shadow-xs hover:shadow-sm transition-all relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-primary/10 text-primary flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-text">Pacientes Ingresados</span>
            </div>
            <button className="text-text-muted hover:text-text p-1 rounded-[var(--radius-xs)]">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">148</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-[var(--radius-xs)]">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +13.6%
              </span>
              <span className="text-xs text-text-muted">vs mes anterior</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Atenciones */}
        <div className="bg-surface rounded-[var(--radius-md)] border border-border p-5 shadow-xs hover:shadow-sm transition-all relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-secondary/15 text-secondary flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-text">Total Atenciones</span>
            </div>
            <button className="text-text-muted hover:text-text p-1 rounded-[var(--radius-xs)]">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">429</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-xs font-semibold text-secondary bg-secondary/15 px-1.5 py-0.5 rounded-[var(--radius-xs)]">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +19.2%
              </span>
              <span className="text-xs text-text-muted">vs mes anterior</span>
            </div>
          </div>
        </div>

        {/* Card 3: Casos Activos / Seguimiento */}
        <div className="bg-surface rounded-[var(--radius-md)] border border-border p-5 shadow-xs hover:shadow-sm transition-all relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-primary/10 text-primary flex items-center justify-center">
                <Users2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-text">Casos en Seguimiento</span>
            </div>
            <button className="text-text-muted hover:text-text p-1 rounded-[var(--radius-xs)]">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">86</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-[var(--radius-xs)]">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +8.2%
              </span>
              <span className="text-xs text-text-muted">adherencia alta</span>
            </div>
          </div>
        </div>

        {/* Card 4: Duplas Operativas */}
        <div className="bg-surface rounded-[var(--radius-md)] border border-border p-5 shadow-xs hover:shadow-sm transition-all relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-secondary/15 text-secondary flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-text">Duplas de Atención</span>
            </div>
            <button className="text-text-muted hover:text-text p-1 rounded-[var(--radius-xs)]">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">4 Activas</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-xs font-semibold text-secondary bg-secondary/15 px-1.5 py-0.5 rounded-[var(--radius-xs)]">
                100%
              </span>
              <span className="text-xs text-text-muted">cobertura clínica</span>
            </div>
            {onOpenDuplas && (
              <button
                onClick={onOpenDuplas}
                className="mt-3 text-xs font-semibold text-primary hover:text-primary-hover underline underline-offset-2 transition-colors"
              >
                Gestionar duplas →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Visual Chart Card (Reporte Atenciones por Dupla) */}
      <div className="bg-surface rounded-[var(--radius-md)] border border-border p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-primary/10 text-primary flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-text">Reporte por Dupla</span>
            </div>
            <button className="text-text-muted hover:text-text p-1 rounded-[var(--radius-xs)]">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-3 px-1">
            <span className="text-xs font-semibold text-text-muted">388 atenciones</span>
            <span className="text-xs font-bold text-primary">429 atenciones</span>
          </div>

          {/* Stylized Segmented Bars using Primary & Secondary Tokens */}
          <div className="grid grid-cols-3 gap-6 h-36 items-end my-3 px-2">
            {/* Octubre */}
            <div className="flex flex-col items-center gap-1 h-full justify-end">
              <div className="w-full flex flex-col gap-1 items-center">
                <div className="w-8 h-8 rounded-[var(--radius-xs)] bg-primary" title="Dupla 1: 140" />
                <div className="w-8 h-6 rounded-[var(--radius-xs)] bg-secondary" title="Dupla 2: 95" />
                <div className="w-8 h-8 rounded-[var(--radius-xs)] bg-success" title="Dupla 3: 110" />
              </div>
              <span className="text-[11px] text-text-muted font-medium mt-1">Oct</span>
            </div>

            {/* Noviembre */}
            <div className="flex flex-col items-center gap-1 h-full justify-end">
              <div className="w-full flex flex-col gap-1 items-center">
                <div className="w-8 h-10 rounded-[var(--radius-xs)] bg-primary" title="Dupla 1: 160" />
                <div className="w-8 h-8 rounded-[var(--radius-xs)] bg-secondary" title="Dupla 2: 120" />
                <div className="w-8 h-7 rounded-[var(--radius-xs)] bg-success" title="Dupla 3: 108" />
              </div>
              <span className="text-[11px] text-text-muted font-medium mt-1">Nov</span>
            </div>

            {/* Diciembre */}
            <div className="flex flex-col items-center gap-1 h-full justify-end">
              <div className="w-full flex flex-col gap-1 items-center">
                <div className="w-8 h-12 rounded-[var(--radius-xs)] bg-primary" title="Dupla 1: 185" />
                <div className="w-8 h-7 rounded-[var(--radius-xs)] bg-secondary" title="Dupla 2: 114" />
                <div className="w-8 h-9 rounded-[var(--radius-xs)] bg-success" title="Dupla 3: 130" />
              </div>
              <span className="text-[11px] text-text-muted font-medium mt-1">Dic</span>
            </div>
          </div>
        </div>

        {/* Legend using Primary, Secondary and Success */}
        <div className="flex items-center justify-center gap-4 pt-3 border-t border-border text-[11px] text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[var(--radius-full)] bg-primary" /> Dupla 1 (Psico-TO)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[var(--radius-full)] bg-secondary" /> Dupla 2 (Psico-TS)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[var(--radius-full)] bg-success" /> Dupla 3 (Infanto)
          </span>
        </div>
      </div>
    </div>
  );
};
