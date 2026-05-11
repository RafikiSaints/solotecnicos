import { ShieldCheck, MapPin, Phone } from 'lucide-react'

export function TopStrip() {
  return (
    <div className="hidden md:block bg-azul text-white/90 text-xs">
      <div className="container-st flex items-center justify-between py-2">
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-oro" />
            Técnicos verificados en toda Chile
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} className="text-oro" />
            16 regiones
          </span>
        </div>
        <div className="flex items-center gap-5">
          <a href="/registro-tecnico" className="hover:text-oro transition-colors">¿Eres técnico? Únete gratis</a>
          <a href="/emergencias" className="inline-flex items-center gap-1 hover:text-oro transition-colors">
            <Phone size={12} /> Emergencias 24/7
          </a>
        </div>
      </div>
    </div>
  )
}
