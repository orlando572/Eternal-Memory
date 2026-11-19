# syntax=docker/dockerfile:1

# Imagen de producción multietapa de Eternal Memory (TSK-43).
# Usa la salida standalone de Next.js: la etapa final solo lleva server.js,
# los módulos trazados, .next/static y public.

FROM node:24-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1

# 1. deps: instala las dependencias exactas del archivo de bloqueo.
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# 2. builder: compila la aplicación.
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js incrusta las variables NEXT_PUBLIC_* al compilar, por eso se pasan
# como argumentos de construcción. SUPABASE_SECRET_KEY no se declara aquí:
# se entrega al contenedor solo en tiempo de ejecución.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# 3. runner: solo lo necesario para ejecutar, con un usuario sin privilegios.
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 nodejs \
  && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
