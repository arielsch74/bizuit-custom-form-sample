-- =============================================
-- Migration: 005 - Align CustomFormVersions Schema
-- Description: Adds PackageVersion and BuildDate columns to CustomFormVersions
-- Date: 2024-11-20
-- =============================================

SET NOCOUNT ON;

PRINT '--- Starting Migration 005: Align CustomFormVersions Schema ---';

-- Add PackageVersion column if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('CustomFormVersions')
    AND name = 'PackageVersion'
)
BEGIN
    PRINT 'Adding PackageVersion column to CustomFormVersions table...';
    ALTER TABLE CustomFormVersions
    ADD PackageVersion NVARCHAR(50) NULL;

    PRINT '✓ PackageVersion column added successfully';
END
ELSE
BEGIN
    PRINT 'PackageVersion column already exists';
END

-- Add BuildDate column if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('CustomFormVersions')
    AND name = 'BuildDate'
)
BEGIN
    PRINT 'Adding BuildDate column to CustomFormVersions table...';
    ALTER TABLE CustomFormVersions
    ADD BuildDate DATETIME NULL;

    PRINT '✓ BuildDate column added successfully';
END
ELSE
BEGIN
    PRINT 'BuildDate column already exists';
END

PRINT '--- Migration 005 Completed Successfully ---';
PRINT 'New columns added:';
PRINT '  - PackageVersion';
PRINT '  - BuildDate';
PRINT '';
PRINT 'You can verify with:';
PRINT '  SELECT name FROM sys.columns WHERE object_id = OBJECT_ID(''CustomFormVersions'') AND name IN (''PackageVersion'', ''BuildDate'')';
PRINT '';

GO
