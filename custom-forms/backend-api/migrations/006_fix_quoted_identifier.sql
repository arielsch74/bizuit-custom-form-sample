-- Migration: Fix QUOTED_IDENTIFIER issue in sp_UpsertCustomForm
-- Description: Recreates the stored procedure with proper SET options
-- Date: 2025-11-21
-- Issue: UPDATE fails with QUOTED_IDENTIFIER error on indexed views/computed columns

-- Drop existing procedure if it exists
IF OBJECT_ID('dbo.sp_UpsertCustomForm', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_UpsertCustomForm;
GO

-- CRITICAL: These SET options must be ON when creating the procedure
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
GO

-- Create updated procedure with proper SET options
CREATE PROCEDURE [dbo].[sp_UpsertCustomForm]
    @FormName NVARCHAR(255),
    @ProcessName NVARCHAR(255),
    @Version NVARCHAR(50),
    @Description NVARCHAR(MAX),
    @Author NVARCHAR(255),
    @CompiledCode NVARCHAR(MAX),
    @SizeBytes INT,
    @PackageVersion NVARCHAR(50),
    @CommitHash NVARCHAR(50),
    @BuildDate DATETIME,
    @ReleaseNotes NVARCHAR(MAX) = NULL
AS
BEGIN
    -- Ensure proper SET options inside the procedure
    SET NOCOUNT ON;
    SET QUOTED_IDENTIFIER ON;
    SET ANSI_NULLS ON;
    SET ANSI_WARNINGS ON;
    SET ARITHABORT ON;
    SET CONCAT_NULL_YIELDS_NULL ON;
    SET NUMERIC_ROUNDABORT OFF;

    DECLARE @FormId INT;
    DECLARE @ExistingVersionId INT;
    DECLARE @Action NVARCHAR(20);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Check if form exists in CustomForms
        SELECT @FormId = FormId
        FROM CustomForms WITH (NOLOCK)
        WHERE FormName = @FormName;

        -- 2. If not exists, create record in CustomForms
        IF @FormId IS NULL
        BEGIN
            INSERT INTO CustomForms (
                FormName,
                ProcessName,
                DisplayName,
                Description,
                CurrentVersion,
                Status,
                Author,
                CreatedBy,
                CreatedAt,
                UpdatedAt
            )
            VALUES (
                @FormName,
                @ProcessName,
                @FormName,
                @Description,
                @Version,
                'active',
                @Author,
                @Author,
                GETUTCDATE(),
                GETUTCDATE()
            );

            SET @FormId = SCOPE_IDENTITY();
            SET @Action = 'inserted';
        END
        ELSE
        BEGIN
            -- Update form metadata
            UPDATE CustomForms
            SET ProcessName = @ProcessName,
                Description = @Description,
                CurrentVersion = @Version,
                Author = @Author,
                UpdatedBy = @Author,
                UpdatedAt = GETUTCDATE()
            WHERE FormId = @FormId;

            SET @Action = 'updated';
        END

        -- 3. Deactivate current version (if exists)
        UPDATE CustomFormVersions
        SET IsCurrent = 0
        WHERE FormId = @FormId AND IsCurrent = 1;

        -- 4. Check if this specific version already exists
        SELECT @ExistingVersionId = VersionId
        FROM CustomFormVersions WITH (NOLOCK)
        WHERE FormId = @FormId AND Version = @Version;

        -- 5. Prepare metadata JSON with deployment info
        DECLARE @MetadataJson NVARCHAR(MAX);
        SET @MetadataJson = '{' +
            '"packageVersion":"' + ISNULL(@PackageVersion, '') + '",' +
            '"commitHash":"' + ISNULL(@CommitHash, '') + '",' +
            '"buildDate":"' + ISNULL(CONVERT(NVARCHAR(50), @BuildDate, 127), '') + '"' +
        '}';

        IF @ExistingVersionId IS NOT NULL
        BEGIN
            -- Update existing version
            UPDATE CustomFormVersions
            SET CompiledCode = @CompiledCode,
                SizeBytes = @SizeBytes,
                CommitHash = @CommitHash,
                BuildNumber = @PackageVersion,
                IsCurrent = 1,
                PublishedBy = @Author,
                PublishedAt = GETUTCDATE(),
                Metadata = @MetadataJson,
                ReleaseNotes = @ReleaseNotes
            WHERE VersionId = @ExistingVersionId;
        END
        ELSE
        BEGIN
            -- Insert new version
            INSERT INTO CustomFormVersions (
                FormId,
                Version,
                CompiledCode,
                SizeBytes,
                CommitHash,
                BuildNumber,
                IsCurrent,
                PublishedBy,
                PublishedAt,
                Metadata,
                ReleaseNotes
            )
            VALUES (
                @FormId,
                @Version,
                @CompiledCode,
                @SizeBytes,
                @CommitHash,
                @PackageVersion,
                1,
                @Author,
                GETUTCDATE(),
                @MetadataJson,
                @ReleaseNotes
            );
        END

        COMMIT TRANSACTION;

        -- Return result
        SELECT @Action AS Action, @FormId AS FormId;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Re-throw error
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

-- Verify the procedure was created with correct settings
SELECT
    p.name AS ProcedureName,
    m.uses_quoted_identifier,
    m.uses_ansi_nulls
FROM sys.procedures p
INNER JOIN sys.sql_modules m ON p.object_id = m.object_id
WHERE p.name = 'sp_UpsertCustomForm';
GO

PRINT '✓ Stored procedure sp_UpsertCustomForm recreated with correct QUOTED_IDENTIFIER settings';
GO