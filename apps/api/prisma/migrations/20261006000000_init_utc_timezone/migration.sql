-- Fase 0 — Base técnica.
-- Migración inicial: no crea tablas de negocio (llegan en fases posteriores).
--
-- Fija la zona horaria por defecto de la base de datos en UTC (SPEC.md §23).
-- Garantiza que CURRENT_TIMESTAMP/now() y cualquier conversión de fechas se
-- evalúen en UTC sin importar la configuración del servidor PostgreSQL.
-- Aplica a las conexiones nuevas posteriores a esta migración.
DO $$
BEGIN
  EXECUTE format('ALTER DATABASE %I SET timezone TO %L', current_database(), 'UTC');
END
$$;
