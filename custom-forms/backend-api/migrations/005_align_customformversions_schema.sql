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

-- Add BuildNumber column if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('CustomFormVersions')
    AND name = 'BuildNumber'
)
BEGIN
    PRINT 'Adding BuildNumber column to CustomFormVersions table...';
    ALTER TABLE CustomFormVersions
    ADD BuildNumber NVARCHAR(50) NULL;

    PRINT '✓ BuildNumber column added successfully';
END
ELSE
BEGIN
    PRINT 'BuildNumber column already exists';
END

-- Add PublishedBy column if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('CustomFormVersions')
    AND name = 'PublishedBy'
)
BEGIN
    PRINT 'Adding PublishedBy column to CustomFormVersions table...';
    ALTER TABLE CustomFormVersions
    ADD PublishedBy NVARCHAR(255) NULL;

    PRINT '✓ PublishedBy column added successfully';
END
ELSE
BEGIN
    PRINT 'PublishedBy column already exists';
END

-- Add Metadata column if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('CustomFormVersions')
    AND name = 'Metadata'
)
BEGIN
    PRINT 'Adding Metadata column to CustomFormVersions table...';
    ALTER TABLE CustomFormVersions
    ADD Metadata NVARCHAR(MAX) NULL;

    PRINT '✓ Metadata column added successfully';
END
ELSE
BEGIN
    PRINT 'Metadata column already exists';
END

PRINT '--- Migration 005 Completed Successfully ---';
PRINT 'New columns added:';
PRINT '  - PackageVersion';
PRINT '  - BuildDate';
PRINT '  - BuildNumber';
PRINT '  - PublishedBy';
PRINT '  - Metadata';
PRINT '';
PRINT 'You can verify with:';
PRINT '  SELECT name FROM sys.columns WHERE object_id = OBJECT_ID(''CustomFormVersions'')';
PRINT '';

GO
