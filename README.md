# Órbita 2 (`pareja-pro`)

Aplicación web de finanzas personales y compartidas en pareja. Permite gestionar de forma aislada el contexto **Personal** y el contexto de **Hogar Compartido**, incluyendo cuentas bancarias (débito, crédito, efectivo, inversión), transferencias con privacidad por propietario, presupuestos mensuales o acumulativos (*sinking funds*), proyectos de ahorro con hitos, fechas de corte, conversión USD/MXN y liquidación inteligente de gastos compartidos.

---

## Características Principales

- **Aislamiento de Contexto (`Hogar` vs `Personal`):** cambia instantáneamente entre tus finanzas individuales y las compartidas con tu pareja sin mezclar saldos ni movimientos.
- **Billetera y Cuentas:** tarjetas de débito, crédito (con fechas de corte/pago), efectivo e inversiones, con matriz de privacidad y transferencias ciegas entre miembros.
- **Presupuestos y Fondos Acumulativos:** seguimiento por periodo (calendario o fecha de corte), *breadcrumbs* de fondeo mensual y reparto proporcional o individual.
- **Proyectos y Metas:** proyectos compartidos o personales con aportaciones, hitos, pausa/reactivación y eliminación segura.
- **Liquidación del Hogar y Simulador de Deuda:** cálculo automático de prorrateo, balances netos y simplificación de deudas entre integrantes.
- **Sistema de Diseño Modern Fintech Bento Grid:** interfaz modular definida en [`DESIGN.md`](./DESIGN.md).
- **Backend Relacional en Firebase Data Connect:** esquema PostgreSQL/Cloud SQL (`dataconnect/`), autenticación con Google/Email, Cloud Functions y reglas de seguridad.

---

## Stack Tecnológico

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 4
- **Estado y Formularios:** Zustand 5, React Hook Form 7, Zod 4
- **Gráficas e Iconos:** Recharts 3, Lucide React
- **Backend & Hosting:** Firebase Auth, Firebase Data Connect (PostgreSQL / Cloud SQL), Cloud Functions, Firebase Hosting
- **Testing & Calidad:** Vitest, Testing Library, Playwright (E2E), Oxlint

---

## Requisitos Previos

- **Node.js** v18 o superior
- **Firebase CLI** (`npm install -g firebase-tools` o mediante `npx`)
- **Java** (requerido por los emuladores locales de Firebase)

---

## Instalación y Desarrollo Local

1. **Clonar el repositorio e instalar dependencias:**
   ```bash
   git clone https://github.com/DavidSS0912/pareja-pro.git
   cd pareja-pro
   npm install
   ```

2. **Iniciar los emuladores de Firebase (Auth en puerto `9099` y Data Connect en `9399`):**
   ```bash
   npm run emulators
   ```

3. **Iniciar el servidor de desarrollo (en otra terminal):**
   ```bash
   npm run dev
   ```
   En modo desarrollo (`import.meta.env.DEV`), la aplicación se conecta automáticamente a los emuladores locales (`demo-pareja-pro`) y muestra una insignia `EMULADOR`. Para apuntar a producción localmente usa `VITE_USE_PROD=true`.

---

## Scripts Disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con Vite |
| `npm run emulators` | Inicia los emuladores de Firebase (`--project demo-pareja-pro`) |
| `npm run build` | Compila TypeScript (`tsc`) y genera el bundle en `dist/` (`vite build`) |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Ejecuta `oxlint` sobre el código fuente |
| `npm test` | Ejecuta las pruebas unitarias y de integración con Vitest (`vitest run src/`) |
| `npm run test:dc` | Ejecuta pruebas de integración contra Data Connect (`scripts/test-dc.ts`) |
| `npm run test:backend` | Levanta emuladores efímeros y ejecuta `npm run test:dc` |

---

## Estructura del Proyecto

```text
pareja-pro/
├── dataconnect/            # Esquema GraphQL, conectores (queries/mutations) y config Cloud SQL
├── functions/              # Cloud Functions de Firebase
├── scripts/                # Scripts de verificación E2E, matemáticas UI y auditoría móvil
├── src/
│   ├── __tests__/          # Suites de pruebas Vitest (cálculos, privacidad, servicios, slices)
│   ├── components/         # Componentes UI reutilizables y formularios
│   ├── lib/dataconnect/    # SDK generado de Firebase Data Connect
│   ├── services/           # Lógica de negocio (cuentas, presupuestos, liquidación, usuarios)
│   ├── store/              # Store global Zustand y slices
│   ├── utils/              # Utilidades de cálculo financiero y fechas de corte
│   ├── views/              # Vistas principales (Dashboard, Billetera, Planeación, Proyectos, etc.)
│   ├── App.tsx             # Contenedor principal, navegación y gestión de contexto
│   └── firebase.ts         # Inicialización de Firebase y conexión automática a emuladores
├── tests/e2e/              # Pruebas End-to-End con Playwright
├── DESIGN.md               # Especificación del sistema de diseño Bento Grid
├── firebase.json           # Configuración de Hosting, Firestore, Data Connect y emuladores
└── package.json            # Dependencias y scripts
```

---

## Despliegue

1. Compila el proyecto:
   ```bash
   npm run build
   ```
2. Despliega en Firebase Hosting:
   ```bash
   npx firebase-tools deploy --only hosting
   ```
