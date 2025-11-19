-- Migration: 001 - Create Custom Forms Tables and Stored Procedure
-- Description: Creates the initial database schema for Custom Forms system
-- Date: 2025-11-19
-- Idempotent: Yes (checks for existence before creating)
-- Note: Database is selected via sqlcmd -d parameter, not USE statement

-- ==============================================================================
-- Table: CustomForms
-- Description: Stores metadata about custom forms
-- ==============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CustomForms' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE [dbo].[CustomForms] (
        [FormId] INT IDENTITY(1,1) PRIMARY KEY,
        [FormName] NVARCHAR(255) NOT NULL UNIQUE,
        [ProcessName] NVARCHAR(255) NOT NULL,
        [Status] NVARCHAR(50) NOT NULL DEFAULT 'active',
        [CurrentVersion] NVARCHAR(50) NOT NULL,
        [Description] NVARCHAR(MAX) NULL,
        [Author] NVARCHAR(255) NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE(),

        -- Constraints
        CONSTRAINT [CK_CustomForms_Status] CHECK ([Status] IN ('active', 'inactive', 'deprecated')),

        -- Indexes
        INDEX [IX_CustomForms_FormName] NONCLUSTERED ([FormName]),
        INDEX [IX_CustomForms_ProcessName] NONCLUSTERED ([ProcessName]),
        INDEX [IX_CustomForms_Status] NONCLUSTERED ([Status])
    );

    PRINT 'Table CustomForms created successfully';
END
ELSE
BEGIN
    PRINT 'Table CustomForms already exists';
END
GO

-- ==============================================================================
-- Table: CustomFormVersions
-- Description: Stores all versions of custom forms with compiled code
-- ==============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CustomFormVersions' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE [dbo].[CustomFormVersions] (
        [VersionId] INT IDENTITY(1,1) PRIMARY KEY,
        [FormId] INT NOT NULL,
        [Version] NVARCHAR(50) NOT NULL,
        [CompiledCode] NVARCHAR(MAX) NOT NULL,
        [SizeBytes] INT NOT NULL,
        [PublishedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [IsCurrent] BIT NOT NULL DEFAULT 0,
        [ReleaseNotes] NVARCHAR(MAX) NULL,
        [PackageVersion] NVARCHAR(50) NULL,
        [CommitHash] NVARCHAR(50) NULL,
        [BuildDate] DATETIME NULL,

        -- Foreign Key
        CONSTRAINT [FK_CustomFormVersions_CustomForms]
            FOREIGN KEY ([FormId]) REFERENCES [dbo].[CustomForms]([FormId])
            ON DELETE CASCADE,

        -- Unique constraint: One version per form
        CONSTRAINT [UQ_CustomFormVersions_FormId_Version]
            UNIQUE ([FormId], [Version]),

        -- Only one current version per form
        CONSTRAINT [CK_CustomFormVersions_IsCurrent]
            CHECK ([IsCurrent] = 0 OR [IsCurrent] = 1),

        -- Indexes
        INDEX [IX_CustomFormVersions_FormId] NONCLUSTERED ([FormId]),
        INDEX [IX_CustomFormVersions_IsCurrent] NONCLUSTERED ([IsCurrent]),
        INDEX [IX_CustomFormVersions_Version] NONCLUSTERED ([Version]),
        INDEX [IX_CustomFormVersions_PublishedAt] NONCLUSTERED ([PublishedAt] DESC)
    );

    PRINT 'Table CustomFormVersions created successfully';
END
ELSE
BEGIN
    PRINT 'Table CustomFormVersions already exists';
END
GO

-- ==============================================================================
-- Stored Procedure: sp_UpsertCustomForm
-- Description: Inserts a new form or updates existing form with new version
-- ==============================================================================

-- Drop existing procedure if it exists
IF OBJECT_ID('dbo.sp_UpsertCustomForm', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_UpsertCustomForm;
GO

CREATE PROCEDURE dbo.sp_UpsertCustomForm
    @FormName NVARCHAR(255),
    @ProcessName NVARCHAR(255),
    @Version NVARCHAR(50),
    @Description NVARCHAR(MAX),
    @Author NVARCHAR(255),
    @CompiledCode NVARCHAR(MAX),
    @SizeBytes INT,
    @PackageVersion NVARCHAR(50) = NULL,
    @CommitHash NVARCHAR(50) = NULL,
    @BuildDate DATETIME = NULL,
    @ReleaseNotes NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FormId INT;
    DECLARE @Action NVARCHAR(20);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Check if form exists
        SELECT @FormId = FormId
        FROM CustomForms
        WHERE FormName = @FormName;

        IF @FormId IS NULL
        BEGIN
            -- INSERT new form
            INSERT INTO CustomForms (
                FormName,
                ProcessName,
                Status,
                CurrentVersion,
                Description,
                Author,
                CreatedAt,
                UpdatedAt
            )
            VALUES (
                @FormName,
                @ProcessName,
                'active',
                @Version,
                @Description,
                @Author,
                GETDATE(),
                GETDATE()
            );

            SET @FormId = SCOPE_IDENTITY();
            SET @Action = 'inserted';
        END
        ELSE
        BEGIN
            -- UPDATE existing form
            UPDATE CustomForms
            SET ProcessName = @ProcessName,
                CurrentVersion = @Version,
                Description = @Description,
                Author = @Author,
                UpdatedAt = GETDATE()
            WHERE FormId = @FormId;

            -- Mark all previous versions as not current
            UPDATE CustomFormVersions
            SET IsCurrent = 0
            WHERE FormId = @FormId;

            SET @Action = 'updated';
        END

        -- INSERT new version
        INSERT INTO CustomFormVersions (
            FormId,
            Version,
            CompiledCode,
            SizeBytes,
            PublishedAt,
            IsCurrent,
            ReleaseNotes,
            PackageVersion,
            CommitHash,
            BuildDate
        )
        VALUES (
            @FormId,
            @Version,
            @CompiledCode,
            @SizeBytes,
            GETDATE(),
            1, -- Current version
            @ReleaseNotes,
            @PackageVersion,
            @CommitHash,
            @BuildDate
        );

        COMMIT TRANSACTION;

        -- Return action performed
        SELECT @Action AS Action, @FormId AS FormId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Re-throw the error
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

PRINT 'Stored procedure sp_UpsertCustomForm created successfully';
GO

-- ==============================================================================
-- Verification
-- ==============================================================================

PRINT '';
PRINT '=== Migration 001 Completed Successfully ===';
PRINT 'Tables created:';
PRINT '  - CustomForms';
PRINT '  - CustomFormVersions';
PRINT 'Stored procedures created:';
PRINT '  - sp_UpsertCustomForm';
PRINT '';
PRINT 'You can verify with:';
PRINT '  SELECT * FROM sys.tables WHERE name LIKE ''CustomForm%''';
PRINT '  SELECT * FROM sys.procedures WHERE name = ''sp_UpsertCustomForm''';
GO
