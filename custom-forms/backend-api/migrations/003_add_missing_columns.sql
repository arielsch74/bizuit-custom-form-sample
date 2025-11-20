-- =============================================
-- Migration: 003 - Add Missing Columns
-- Description: Adds DisplayName, CreatedBy, and UpdatedBy columns to CustomForms table
-- Date: 2024-11-20
-- =============================================

SET NOCOUNT ON;

PRINT '--- Starting Migration 003: Add Missing Columns ---';

-- Add DisplayName column if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('CustomForms')
    AND name = 'DisplayName'
)
BEGIN
    PRINT 'Adding DisplayName column to CustomForms table...';
    ALTER TABLE CustomForms
    ADD DisplayName NVARCHAR(255) NULL;

    -- Populate with FormName as default
    UPDATE CustomForms
    SET DisplayName = FormName
    WHERE DisplayName IS NULL;

    PRINT '✓ DisplayName column added successfully';
END
ELSE
BEGIN
    PRINT 'DisplayName column already exists';
END

-- Add CreatedBy column if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('CustomForms')
    AND name = 'CreatedBy'
)
BEGIN
    PRINT 'Adding CreatedBy column to CustomForms table...';
    ALTER TABLE CustomForms
    ADD CreatedBy NVARCHAR(255) NULL;

    -- Populate with Author as default
    UPDATE CustomForms
    SET CreatedBy = Author
    WHERE CreatedBy IS NULL;

    PRINT '✓ CreatedBy column added successfully';
END
ELSE
BEGIN
    PRINT 'CreatedBy column already exists';
END

-- Add UpdatedBy column if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('CustomForms')
    AND name = 'UpdatedBy'
)
BEGIN
    PRINT 'Adding UpdatedBy column to CustomForms table...';
    ALTER TABLE CustomForms
    ADD UpdatedBy NVARCHAR(255) NULL;

    -- Populate with Author as default
    UPDATE CustomForms
    SET UpdatedBy = Author
    WHERE UpdatedBy IS NULL;

    PRINT '✓ UpdatedBy column added successfully';
END
ELSE
BEGIN
    PRINT 'UpdatedBy column already exists';
END

PRINT '--- Migration 003 Completed Successfully ---';
PRINT 'New columns added:';
PRINT '  - DisplayName';
PRINT '  - CreatedBy';
PRINT '  - UpdatedBy';
PRINT '';
PRINT 'You can verify with:';
PRINT '  SELECT name FROM sys.columns WHERE object_id = OBJECT_ID(''CustomForms'') AND name IN (''DisplayName'', ''CreatedBy'', ''UpdatedBy'')';
PRINT '';

GO
