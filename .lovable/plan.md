## Objetivo

Reemplazar el login de demo (usuarios hardcodeados en `src/lib/auth.tsx`) por autenticación real con Lovable Cloud, y enviar correos de invitación a encargados de empresa y a empleados, para que establezcan su contraseña en una pantalla nueva similar al login.

## Pasos

1. **Habilitar Lovable Cloud** y configurar un dominio de correo (te pediré abrir el diálogo de setup del dominio remitente, ej. `notify.tudominio.com`).

2. **Esquema de base de datos**
   - `profiles` (id ligado a `auth.users`, nombre, rol, empresa_id, cliente_id).
   - `user_roles` + enum `app_role` (`admin`, `company`, `client`) con función `has_role` (patrón estándar para evitar recursión RLS).
   - `invitations` (id, email, role, empresa_id, payload JSON con nombre/datos del encargado o empleado, status: `pending` | `sent` | `accepted`, last_sent_at, attempts).
   - Trigger `on_auth_user_created` que: crea perfil, asigna rol, y marca la invitación correspondiente como `accepted`.
   - RLS + GRANTs explícitos en todas las tablas públicas.

3. **Backend (server functions + un server route público)**
   - `createInvitation({ email, role, payload })`: inserta/actualiza invitación y encola correo transaccional con `inviteUrl = /set-password?token=...`. Usa `supabaseAdmin` (server-only).
   - `resendInvitation({ invitationId })`: regenera token y reenvía.
   - `acceptInvitation({ token, password })`: valida token, crea usuario via `supabaseAdmin.auth.admin.createUser`, marca invitación `accepted`.
   - Job ligero (al guardar empresa) que detecta encargados/empleados con correo nuevo o cambiado sin cuenta y dispara invitación.

4. **Emails (Lovable Emails)**
   - Configurar infraestructura de correos.
   - Plantilla React Email `invitation` con marca de la app, botón "Establecer contraseña".

5. **Frontend**
   - Pantalla `/set-password?token=...` con mismo layout que `/login` (logo, card, validación, confirmar contraseña, mensaje de éxito → redirige a login).
   - Refactor de `src/lib/auth.tsx` para usar `supabase.auth` real (email/password). Mantener API (`useAuth`, `login`, `logout`) para no romper consumidores. Quitar `USERS` hardcodeados.
   - Al **registrar/editar encargado** en perfil de empresa (`src/routes/_company/perfil.tsx` y vistas admin equivalentes): si el correo es nuevo o cambió y no hay cuenta vinculada → crear invitación + enviar correo. Mostrar estado "Pendiente / Activo" basado en `invitations.status` / perfil existente. Botón "Reenviar invitación".
   - Al **registrar/editar empleado (asegurado)** dentro de una póliza: además de guardar como `Asegurado`, crear/actualizar registro cliente y disparar invitación con rol `client`. Mismo manejo de reenvío si el correo cambia.

6. **Reintento automático**
   - Al cargar empresas/empleados, una función idempotente revisa correos sin cuenta y reencola invitación si han pasado >24h desde `last_sent_at` (configurable). Garantiza "hasta que se detecte que se registró e ingresó".

7. **Migración de datos demo**
   - Borrar `USERS` hardcodeados. Seed inicial opcional: insertar un admin de demo vía script para poder seguir entrando como `admin@gmail.com`.

## Detalles técnicos

- `setPassword` en `/set-password` no usa sesión: el token de invitación es validado server-side y la creación de usuario se hace con service role (`supabaseAdmin.auth.admin.createUser` con `email_confirm: true` y `password`).
- Para que el botón del correo apunte a la URL correcta usamos la URL canónica del proyecto.
- RLS: `invitations` solo accesible vía server functions con `supabaseAdmin`; no se expone al cliente.
- Idempotencia: el envío usa `idempotencyKey = invitation:{id}:{attempt}`.
- Sin attachments, solo HTML.

## Notas

- Es un cambio grande (auth real reemplaza al fake). El login seguirá funcionando con email/password de Supabase. Los usuarios demo (`admin@gmail.com`, etc.) ya no entrarán salvo que los seedies. ¿Quieres que cree un admin seed inicial?
- Necesitarás aprobar la configuración de dominio de correo cuando aparezca el diálogo.
