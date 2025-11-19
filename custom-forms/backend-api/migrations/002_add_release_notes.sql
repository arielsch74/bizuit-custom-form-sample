-- Migration: Add ReleaseNotes column to CustomFormVersions table
-- Description: Adds a column to store change descriptions for each version
-- Date: 2025-11-19

USE [BizuitDashboard];
GO

-- Add ReleaseNotes column if it doesn't exist
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[CustomFormVersions]')
    AND name = 'ReleaseNotes'
)
BEGIN
    ALTER TABLE [dbo].[CustomFormVersions]
    ADD ReleaseNotes NVARCHAR(MAX) NULL;

    PRINT 'ReleaseNotes column added successfully to CustomFormVersions table';
END
ELSE
BEGIN
    PRINT 'ReleaseNotes column already exists in CustomFormVersions table';
END
GO

-- Optionally, add default value for existing records
UPDATE [dbo].[CustomFormVersions]
SET ReleaseNotes = 'No release notes available'
WHERE ReleaseNotes IS NULL;
GO

PRINT 'Migration completed successfully';
GO
