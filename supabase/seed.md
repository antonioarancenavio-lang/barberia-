# Datos de demostración — Fase 1

En esta fase el seed se limita a la creación de usuarios y barberías (el resto de
entidades — barberos, servicios, horarios, citas — se sembrarán junto con las
Fases 3 y 4, cuando ya existan las pantallas para verificarlos).

Como `auth.users` no se puede rellenar directamente por SQL sin la Admin API,
usa el script `scripts/seed.ts` (Node + `SUPABASE_SERVICE_ROLE_KEY`):

```bash
npm install -D tsx
npx tsx scripts/seed.ts
```

Esto creará 3 barberías de prueba, cada una con su propio owner:

| Barbería          | Slug              | Email                     | Password    |
|-------------------|-------------------|---------------------------|-------------|
| Barbería García    | barberia-garcia   | garcia@demo.test          | Demo1234!   |
| Barbería Central   | barberia-central  | central@demo.test         | Demo1234!   |
| Fade Society       | fade-society      | fadesociety@demo.test     | Demo1234!   |

Verifica el aislamiento de datos entrando con cada usuario y comprobando que
solo ve su propia barbería en `/dashboard`.
