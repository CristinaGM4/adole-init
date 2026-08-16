# Bienestar Adolescente Manizales — Frontend

Frontend Angular 21 para el módulo adolescente IPBAM-20. Consume el backend existente; no contiene backend, datos ficticios, módulo infantil ni módulo de cuidadores.

## Requisitos

- Node.js 22 LTS o versión compatible con Angular 21
- Backend disponible en `https://inst-adolescente.onrender.com/api`

## Inicio

```bash
npm install
npm start
```

Abrir `http://localhost:4200`. Para compilar y probar:

```bash
npm run build
npm test -- --watch=false
```

## API

En desarrollo, Angular usa `/api` con `proxy.conf.json` para conectarse al backend de Render sin depender de CORS del navegador:

```ts
export const environment = {
  production: false,
  apiUrl: '/api'
};
```

`environment.production.ts` utiliza `https://inst-adolescente.onrender.com/api` mediante `fileReplacements` de Angular.

Para un despliegue real, el origen público donde se aloje este frontend debe incluirse en `CORS_ORIGINS` del backend.

## Seguridad

El JWT se guarda solo en `sessionStorage`, se adjunta con un interceptor y se elimina en respuestas 401. Un 403 conserva la sesión. El formulario nunca muestra al adolescente puntajes, perfil, alerta técnica ni diagnóstico.
