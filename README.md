# Práctica 8: Pipeline CI/CD con GitHub Actions

## COM-600 Microservicios - Gestión 2/2026

Repositorio con implementación de integración y entrega continua (CI/CD) automatizada mediante GitHub Actions para el microservicio de gestión de tareas.

---

## 📋 Descripción de Jobs del Pipeline (`ci.yml`)

El pipeline se ejecuta automáticamente ante eventos de `push` y `pull_request` sobre cualquier rama, compuesto por los siguientes jobs:

### 1. `pruebas` (Matriz de versiones)
- **Ejecución**: Paralela en runners `ubuntu-latest`.
- **Estrategia**: Matriz de versiones de Node.js (`22` y `24`) con `fail-fast: false`.
- **Pasos**:
  1. Clona el repositorio con `actions/checkout@v4`.
  2. Configura Node.js con caché de dependencias `npm` (`actions/setup-node@v4`).
  3. Instalación reproducible mediante `npm ci`.
  4. Ejecución de la suite completa de pruebas con `npm test`.
  5. Generación del reporte de cobertura de código (`npm run test:cov`).
  6. Publicación del artefacto de cobertura (`actions/upload-artifact@v4`) con retención de 7 días y cláusula `if: always()`.

### 2. `calidad` (Puerta de Calidad en paralelo)
- **Ejecución**: Corre en paralelo con el job `pruebas`.
- **Pasos**:
  1. Clona el código y prepara Node.js 20 con caché de npm.
  2. Ejecuta `npm ci`.
  3. **Análisis estático de código**: `npx eslint src test --max-warnings 0`. Falla ante cualquier error de estilo o sintaxis.
  4. **Escaneo de dependencias**: `npm audit --audit-level=critical`. Bloquea el flujo si existen vulnerabilidades críticas en dependencias.

### 3. `imagen` (Construcción y Publicación en GHCR)
- **Dependencia**: `needs: [pruebas, calidad]`. Solo inicia si las pruebas y los análisis de calidad pasaron exitosamente.
- **Permisos**: `contents: read`, `packages: write`.
- **Pasos**:
  1. Autenticación segura en GitHub Container Registry (`ghcr.io`) usando el secret temporal `${{ secrets.GITHUB_TOKEN }}`.
  2. Construcción de la imagen Docker multiplataforma a partir del [`Dockerfile`](Dockerfile).
  3. Publicación con esquema de etiquetas trazables:
     - Etiqueta con el commit SHA: `ghcr.io/<repo>:${{ github.sha }}`.
     - Etiqueta de versión semántica: `ghcr.io/<repo>:1.0.0`.
     - Etiqueta `latest` condicionada exclusivamente a ejecuciones en la rama `main`: `${{ github.ref == 'refs/heads/main' && ... }}`.

---

## 🛠️ Ejecución Local

### Pruebas
```bash
npm ci
npm test
```

### Análisis de Calidad
```bash
npx eslint src test --max-warnings 0
npm audit --audit-level=critical
```

### Construcción Docker
```bash
docker build -t com600-practica8:1.0.0 .
```

---

## 👥 Flujo de Contribución al Repositorio

Para colaborar en este proyecto respetando las reglas de protección de rama:

1. **Crear una rama de trabajo**: Nunca haga commits directos sobre la rama `main`.
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```
2. **Desarrollar y validar en local**: Asegúrese de que `npm test` y `npx eslint src test` pasen en su entorno.
3. **Subir rama y abrir Pull Request**: Suba los cambios a GitHub y abra un Pull Request hacia la rama `main`.
4. **Verificación automatizada**: Los checks obligatorios del pipeline (`pruebas (20)`, `pruebas (22)` y `calidad`) se ejecutarán en GitHub Actions.
5. **Aprobación y Merge**: Una vez que todos los checks estén en verde, se habilitará la opción para fusionar el PR hacia `main`, disparando la publicación automática de la imagen con la etiqueta `latest`.
