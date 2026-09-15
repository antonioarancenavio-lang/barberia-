import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      {/* NAVBAR */}
      <header className="border-b border-warm-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="font-display text-xl text-ink">Cortia</span>
          <nav className="hidden items-center gap-8 sm:flex">
            <a href="#producto" className="nav-link">Producto</a>
            <a href="#como-funciona" className="nav-link">Cómo funciona</a>
            <a href="#precios" className="nav-link">Precios</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="nav-link hidden sm:block">Iniciar sesión</Link>
            <Link href="/register" className="btn-primary !px-5 !py-2 !text-[14px]">Crear mi agenda gratis</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="section-eyebrow">Para barberías</p>
          <h1 className="font-display text-5xl font-medium leading-[1.1] tracking-tight text-ink sm:text-6xl">
            Deja de responder mensajes.<br />Empieza a recibir reservas.
          </h1>
          <p className="mt-6 max-w-md text-lg text-warm-700">
            Tus clientes reservan su corte online las 24 horas, aunque estés ocupado cortando.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/register" className="btn-primary">Crear mi agenda gratis</Link>
            <a href="#como-funciona" className="btn-secondary">Ver cómo funciona</a>
          </div>
          <p className="mt-4 text-sm text-warm-500">Sin tarjeta · Sin permanencia · Configuración en 2 minutos</p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="hero-mock-card">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-warm-500">Hoy · Martes</p>
            <div className="hero-mock-row">
              <span className="hero-mock-time">09:30</span>
              <span className="hero-mock-name">Marcos Ruiz</span>
              <span className="hero-mock-tag">Fade</span>
            </div>
            <div className="hero-mock-row">
              <span className="hero-mock-time">10:15</span>
              <span className="hero-mock-name">Diego Torres</span>
              <span className="hero-mock-tag">Corte + Barba</span>
            </div>
            <div className="hero-mock-row">
              <span className="hero-mock-time">11:00</span>
              <span className="hero-mock-name">Nueva reserva</span>
              <span className="hero-mock-tag">Online</span>
            </div>
            <div className="hero-mock-row">
              <span className="hero-mock-time">11:45</span>
              <span className="hero-mock-name">Álvaro Gil</span>
              <span className="hero-mock-tag">Afeitado</span>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="border-y border-warm-100 bg-surface px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">Tu WhatsApp no debería ser tu agenda.</h2>
          <div className="mt-10 flex flex-col gap-3 text-left">
            <p className="text-warm-700">❌ "¿Tienes hueco mañana?"</p>
            <p className="text-warm-700">❌ "¿A qué hora puedo ir?"</p>
            <p className="text-warm-700">❌ "¿Me puedes apuntar para el viernes?"</p>
            <p className="text-warm-700">❌ "¿A qué hora tenía la cita?"</p>
            <p className="text-warm-700">❌ Mensajes esperando respuesta mientras tienes las manos ocupadas.</p>
          </div>
        </div>
      </section>

      {/* SOLUCION */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="section-title">Tus clientes reservan solos, mientras tú cortas.</h2>
          <p className="mx-auto mt-4 max-w-xl text-warm-700">
            Agenda, reservas, barberos, servicios y horarios, todo en el mismo lugar — sin cuadernos, sin
            hojas de cálculo, sin depender de estar pendiente del móvil todo el día.
          </p>
        </div>
      </section>

      {/* ANTES / DESPUES */}
      <section className="border-y border-warm-100 bg-surface px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="section-title mb-10 text-center">Antes y después de Cortia</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="benefit-card">
              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-warm-500">Sin Cortia</p>
              <p className="text-warm-700">📱 WhatsApps sin parar</p>
              <p className="mt-2 text-warm-700">📞 Llamadas a deshoras</p>
              <p className="mt-2 text-warm-700">📒 Agenda de papel</p>
              <p className="mt-2 text-warm-700">❌ Clientes esperando</p>
              <p className="mt-2 text-warm-700">❌ Huecos vacíos</p>
              <p className="mt-2 text-warm-700">❌ Citas olvidadas</p>
            </div>
            <div className="benefit-card" style={{ borderColor: '#B5502A' }}>
              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-accent">Con Cortia</p>
              <p className="text-ink">📅 Agenda siempre organizada</p>
              <p className="mt-2 text-ink">📲 Reservas automáticas</p>
              <p className="mt-2 text-ink">🔔 Aviso de cada cita nueva</p>
              <p className="mt-2 text-ink">⏰ Horarios claros para todos</p>
              <p className="mt-2 text-ink">💈 Tú, dedicado a cortar</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="section-eyebrow text-center">Cómo funciona</p>
          <h2 className="section-title text-center">Tres pasos. Nada más.</h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            <div className="step-item">
              <span className="step-num">01</span>
              <span className="step-name">Configura tu barbería</span>
              <span className="step-desc">Servicios, precios, barberos y horarios. Diez minutos y listo.</span>
            </div>
            <div className="step-item">
              <span className="step-num">02</span>
              <span className="step-name">Comparte tu enlace</span>
              <span className="step-desc">Tu propia página de reservas, lista para poner en Instagram o Google.</span>
            </div>
            <div className="step-item">
              <span className="step-num">03</span>
              <span className="step-name">Empieza a recibir reservas</span>
              <span className="step-desc">Tus clientes reservan solos. Tú solo tienes que abrir la puerta.</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTO / RESERVAS */}
      <section id="producto" className="border-y border-warm-100 bg-surface px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-eyebrow">La experiencia de tu cliente</p>
          <h2 className="section-title">Tan sencillo que se reserva solo.</h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-ink">
            {['Servicio', 'Barbero', 'Fecha', 'Hora', 'Reserva'].map((step, i, arr) => (
              <span key={step} className="flex items-center gap-3">
                <span className="rounded-full border border-warm-300 px-4 py-2">{step}</span>
                {i < arr.length - 1 && <span className="text-warm-500">→</span>}
              </span>
            ))}
          </div>
          <p className="mt-8 text-warm-700">Sin llamadas. Sin esperar respuesta. A cualquier hora del día.</p>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="benefit-card">
              <p className="benefit-title">📅 Tu agenda siempre organizada</p>
              <p className="benefit-desc">Olvídate de apuntar citas a mano o de perder el hilo con el móvil.</p>
            </div>
            <div className="benefit-card">
              <p className="benefit-title">📲 Reservas 24/7</p>
              <p className="benefit-desc">Tus clientes reservan incluso cuando estás trabajando o cerrado.</p>
            </div>
            <div className="benefit-card">
              <p className="benefit-title">💈 Menos WhatsApp</p>
              <p className="benefit-desc">Deja que tus clientes gestionen sus propias reservas, sin escribirte.</p>
            </div>
            <div className="benefit-card">
              <p className="benefit-title">🔔 Aviso de cada cita nueva</p>
              <p className="benefit-desc">Sabrás al momento cuándo entra una reserva, sin estar mirando el móvil.</p>
            </div>
            <div className="benefit-card">
              <p className="benefit-title">👥 Gestiona tu equipo</p>
              <p className="benefit-desc">Cada barbero tiene su propia agenda, sin confusiones ni dobles citas.</p>
            </div>
            <div className="benefit-card">
              <p className="benefit-title">✂️ Tu página, con tu marca</p>
              <p className="benefit-desc">Logo y color propios — no parece una web genérica de terceros.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precios" className="border-y border-warm-100 bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="section-eyebrow">Precios</p>
            <h2 className="section-title">Empieza gratis. Crece cuando lo necesites.</h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            <div className="pricing-card">
              <span className="plan-name">Free</span>
              <div>
                <span className="plan-price">0€</span>
                <span className="plan-price-period"> /mes</span>
              </div>
              <div>
                <p className="plan-feature">1 barbero</p>
                <p className="plan-feature">30 citas al mes</p>
                <p className="plan-feature">Página de reservas propia</p>
              </div>
              <Link href="/register" className="btn-secondary mt-auto">Crear mi agenda gratis</Link>
            </div>

            <div className="pricing-card pricing-card-featured">
              <span className="pricing-badge">Recomendado</span>
              <span className="plan-name">Pro</span>
              <div>
                <span className="plan-price">19€</span>
                <span className="plan-price-period"> /mes</span>
              </div>
              <p className="text-xs text-warm-500">Menos de 1€ al día — menos de lo que cuesta perder un cliente por no contestar a tiempo.</p>
              <div>
                <p className="plan-feature">Hasta 5 barberos</p>
                <p className="plan-feature">Citas ilimitadas</p>
                <p className="plan-feature">Personalización de tu página</p>
              </div>
              <Link href="/register" className="btn-primary mt-auto">Empezar con Pro</Link>
            </div>

            <div className="pricing-card">
              <span className="plan-name">Premium</span>
              <div>
                <span className="plan-price">39€</span>
                <span className="plan-price-period"> /mes</span>
              </div>
              <div>
                <p className="plan-feature">Barberos ilimitados</p>
                <p className="plan-feature">Citas ilimitadas</p>
                <p className="plan-feature">Recordatorios automáticos</p>
                <p className="plan-feature">Funciones avanzadas</p>
              </div>
              <Link href="/register" className="btn-secondary mt-auto">Empezar con Premium</Link>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMA FUNDADOR */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-lg">
          <p className="section-eyebrow">Programa fundador</p>
          <h2 className="section-title">Buscamos las primeras 20 barberías.</h2>
          <p className="mt-4 text-warm-700">
            6 meses de Cortia Pro gratis. A cambio, solo queremos tu opinión sincera para mejorar el producto.
          </p>
          <div className="mt-8">
            <Link href="/register" className="btn-primary">Quiero ser barbería fundadora</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-y border-warm-100 bg-surface px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <p className="section-eyebrow text-center">Preguntas frecuentes</p>
          <h2 className="section-title mb-10 text-center">Lo que sueles preguntar</h2>

          <details className="faq-item">
            <summary className="faq-question">¿Quién está detrás de Cortia?</summary>
            <p className="faq-answer">Un proyecto español en fase inicial. Por eso buscamos las primeras barberías fundadoras y cuidamos cada detalle con quien lo prueba.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">¿Mis clientes tienen que descargar algo?</summary>
            <p className="faq-answer">No. Reservan desde el navegador, con su nombre y teléfono, sin crear ninguna cuenta.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">¿Puedo seguir usando WhatsApp?</summary>
            <p className="faq-answer">Sí, cuando quieras. Cortia quita el trabajo repetitivo, no te obliga a dejar nada.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">¿Puedo usarlo si trabajo solo?</summary>
            <p className="faq-answer">Sí, el plan Free está pensado exactamente para eso: 1 barbero, sin coste.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">¿Puedo poner mi enlace en Instagram?</summary>
            <p className="faq-answer">Sí, es lo habitual — muchas barberías lo ponen en la biografía o en el enlace de "reservar cita".</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">¿Puedo cancelar cuando quiera?</summary>
            <p className="faq-answer">Sí, sin permanencia, desde tu panel en cualquier momento.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">¿Puedo probarlo gratis?</summary>
            <p className="faq-answer">Sí, el plan Free no caduca y no pide tarjeta.</p>
          </details>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-ink px-6 py-24 text-center">
        <h2 className="mx-auto max-w-xl font-display text-4xl font-medium leading-tight text-bg sm:text-5xl">
          Tu próxima reserva podría llegar mientras estás cortando.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-warm-500">Crea tu agenda online y deja que tus clientes hagan el resto.</p>
        <div className="mt-8">
          <Link href="/register" className="btn-primary !bg-accent hover:!bg-white hover:!text-ink">
            Crear mi agenda gratis
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <span className="font-display text-lg text-ink">Cortia</span>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#producto" className="footer-link">Producto</a>
            <a href="#precios" className="footer-link">Precios</a>
            <a href="#faq" className="footer-link">Ayuda</a>
            <a href="#" className="footer-link">Contacto</a>
            <a href="#" className="footer-link">Privacidad</a>
            <a href="#" className="footer-link">Términos</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
