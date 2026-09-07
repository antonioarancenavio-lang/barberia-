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
            <Link href="/register" className="btn-primary !px-5 !py-2 !text-[14px]">Empezar gratis</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="section-eyebrow">Gestión para barberías</p>
          <h1 className="font-display text-5xl font-medium leading-[1.1] tracking-tight text-ink sm:text-6xl">
            Tu barbería. Tu agenda. Todo bajo control.
          </h1>
          <p className="mt-6 max-w-md text-lg text-warm-700">
            Gestiona tus citas, barberos y reservas online desde un solo lugar.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/register" className="btn-primary">Empezar gratis</Link>
            <a href="#como-funciona" className="btn-secondary">Ver cómo funciona</a>
          </div>
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
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="section-title">Tu día ya es suficientemente complicado.</h2>
          <div className="mt-10 grid grid-cols-2 gap-6 text-left sm:grid-cols-4">
            {['Llamadas a deshoras', 'WhatsApps sin contestar', 'Huecos sin cubrir', 'Agenda de papel'].map((item) => (
              <div key={item} className="text-sm text-warm-700">
                <div className="mb-2 h-px w-8 bg-warm-300" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSFORMACION */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="section-title">Cortia pone orden.</h2>
          <p className="mx-auto mt-4 max-w-xl text-warm-700">
            Agenda, reservas, barberos, servicios y horarios, todo en el mismo lugar — sin cuadernos, sin
            hojas de cálculo, sin depender de estar pendiente del móvil todo el día.
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="border-y border-warm-100 bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="section-eyebrow text-center">Cómo funciona</p>
          <h2 className="section-title text-center">Tres pasos. Nada más.</h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            <div className="step-item">
              <span className="step-num">01</span>
              <span className="step-title">Configura tu barbería</span>
              <span className="step-desc">Servicios, precios, barberos y horarios. Diez minutos y listo.</span>
            </div>
            <div className="step-item">
              <span className="step-num">02</span>
              <span className="step-title">Comparte tu enlace</span>
              <span className="step-desc">Tu propia página de reservas, lista para poner en Instagram o Google.</span>
            </div>
            <div className="step-item">
              <span className="step-num">03</span>
              <span className="step-title">Empieza a recibir reservas</span>
              <span className="step-desc">Tus clientes reservan solos. Tú solo tienes que abrir la puerta.</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTO / RESERVAS */}
      <section id="producto" className="px-6 py-20">
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
      <section className="border-y border-warm-100 bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="benefit-card">
              <p className="benefit-title">Deja de vivir pendiente del teléfono.</p>
              <p className="benefit-desc">Las reservas entran solas, mientras estás con un cliente en el sillón.</p>
            </div>
            <div className="benefit-card">
              <p className="benefit-title">Tus clientes reservan incluso cuando estás trabajando.</p>
              <p className="benefit-desc">Tu página está abierta las 24 horas, aunque tú no lo estés.</p>
            </div>
            <div className="benefit-card">
              <p className="benefit-title">Todos saben qué tienen y cuándo lo tienen.</p>
              <p className="benefit-desc">Cada barbero ve su propia agenda, sin confusiones ni dobles citas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precios" className="px-6 py-20">
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
              <Link href="/register" className="btn-secondary mt-auto">Empezar gratis</Link>
            </div>

            <div className="pricing-card pricing-card-featured">
              <span className="pricing-badge">Recomendado</span>
              <span className="plan-name">Pro</span>
              <div>
                <span className="plan-price">19€</span>
                <span className="plan-price-period"> /mes</span>
              </div>
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

      {/* PRUEBA SOCIAL (sin inventar nada) */}
      <section className="border-y border-warm-100 bg-surface px-6 py-16 text-center">
        <p className="section-eyebrow">Diseñado para barberías</p>
        <p className="mx-auto max-w-lg text-warm-700">
          Cortia está en fase de acceso anticipado. Si eres de los primeros en probarlo, tu opinión moldea
          el producto — únete al programa fundador.
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <p className="section-eyebrow text-center">Preguntas frecuentes</p>
          <h2 className="section-title mb-10 text-center">Lo que sueles preguntar</h2>

          <details className="faq-item">
            <summary className="faq-question">¿Necesito instalar algo?</summary>
            <p className="faq-answer">No. Cortia funciona desde el navegador, tanto para ti como para tus clientes.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">¿Mis clientes necesitan registrarse?</summary>
            <p className="faq-answer">No. Reservan con su nombre y teléfono, sin crear ninguna cuenta.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">¿Puedo tener varios barberos?</summary>
            <p className="faq-answer">Sí, según tu plan. Cada barbero tiene su propia agenda dentro de tu barbería.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">¿Puedo cambiar mis horarios cuando quiera?</summary>
            <p className="faq-answer">Sí, desde tu panel, en cualquier momento, incluidos días sueltos o vacaciones.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">¿Puedo cancelar cuando quiera?</summary>
            <p className="faq-answer">Sí, sin permanencia. Cancelas cuando quieras desde tu panel.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">¿Qué ocurre con mis datos?</summary>
            <p className="faq-answer">Son tuyos. Solo tú (y quien tú autorices) puedes ver los datos de tu barbería.</p>
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
          Tu barbería ya tiene clientes. Ahora dale una agenda que esté a la altura.
        </h2>
        <div className="mt-8">
          <Link href="/register" className="btn-primary !bg-accent hover:!bg-white hover:!text-ink">
            Empezar gratis
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
