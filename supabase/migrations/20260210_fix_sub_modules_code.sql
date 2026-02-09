-- Fix sub_modules code column - set default values
UPDATE sub_modules SET code = CONCAT(tenant_id::text, '-', main_module_id::text) WHERE code IS NULL;

-- For any remaining nulls, use the id
UPDATE sub_modules SET code = id::text WHERE code IS NULL;
