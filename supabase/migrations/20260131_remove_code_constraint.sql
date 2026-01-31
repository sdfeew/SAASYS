-- ============================================================================
-- Remove check constraint on main_modules.code to allow custom codes
-- This allows users to create new main modules with custom codes
-- ============================================================================

ALTER TABLE public.main_modules 
DROP CONSTRAINT main_modules_code_check;

-- Verify the constraint is removed
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE table_name = 'main_modules' AND constraint_type = 'CHECK';
