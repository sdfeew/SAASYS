-- ============================================================================
-- Add Calculated Field Support to sub_module_fields
-- ============================================================================

-- Add columns to support calculated fields
ALTER TABLE public.sub_module_fields
ADD COLUMN IF NOT EXISTS is_calculated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS formula TEXT,
ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]'::jsonb;

-- Create comment for clarity
COMMENT ON COLUMN public.sub_module_fields.is_calculated IS 'Whether this field is automatically calculated from a formula';
COMMENT ON COLUMN public.sub_module_fields.formula IS 'Formula string defining how to calculate the field (e.g., "{{price}} * {{quantity}}")';
COMMENT ON COLUMN public.sub_module_fields.dependencies IS 'Array of field names this calculated field depends on, for tracking dependencies';

-- Create index for calculated fields lookup (performance optimization)
CREATE INDEX IF NOT EXISTS idx_sub_module_fields_is_calculated 
ON public.sub_module_fields(module_id, is_calculated) 
WHERE is_calculated = true;

-- ============================================================================
-- Verify the changes
-- ============================================================================
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'sub_module_fields' 
AND column_name IN ('is_calculated', 'formula', 'dependencies')
ORDER BY column_name;
