# Documentación Técnica: SEMILLA Landing Page

Este documento cubre los detalles técnicos de la aplicación web y su entorno de desarrollo, separando la estructura de orquestación (React/Vite) del contexto institucional y funcional.

## Stack Tecnológico

El proyecto está construido sobre las siguientes tecnologías principales:
- **Framework:** React 19 + Vite (con TanStack Start)
- **Lenguaje:** TypeScript
- **Estilos:** TailwindCSS (v4) + clases utilitarias
- **Componentes:** Radix UI + shadcn/ui (accesibilidad y primitivas de UI)
- **Visualización:** Recharts + Embla Carousel
- **Gestor de Paquetes:** npm (o bun)

## Configuración del Entorno Local

La aplicación depende de variables de entorno para renderizar dinámicamente la conexión al Dashboard interactivo.

1. Crea un archivo `.env.local` en la raíz de `semilla_landing`.
2. Define la variable `VITE_DASHBOARD_URL` con la URL temporal o de producción de tu dashboard:
   ```env
   VITE_DASHBOARD_URL=https://tu-url-ngrok.ngrok-free.dev/
   ```
*Nota: Si esta variable no está definida, los botones hacia el Dashboard se ocultarán de forma segura en la interfaz.*

### Cómo correr el proyecto (Desarrollo)

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor arrancará típicamente en `http://localhost:8080/`.

## Notas para Colaboradores (Git y Lovable)

- Si utilizas el IDE integrado **Lovable**, debes configurar los **Secrets** dentro de la plataforma (ej. `VITE_DASHBOARD_URL`) ya que Lovable no lee los `.env.local` subidos.
- **Advertencia de control de versiones:** Evita usar comandos destructivos como `git push --force`, `git rebase` interactivos o `git commit --amend` al sincronizar el código generado por Lovable con la rama principal, para no desincronizar los commits automáticos de la plataforma. (Para más detalles revisa el archivo `AGENTS.md` original).
