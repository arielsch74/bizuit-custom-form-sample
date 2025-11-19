-- Migration: Update sp_UpsertCustomForm to include ReleaseNotes parameter
-- Description: Adds ReleaseNotes parameter to the stored procedure
-- Date: 2025-11-19

-- Note: Database is selected via sqlcmd -d parameter, not USE statement


-- Drop existing procedure if it exists
IF OBJECT_ID('dbo.sp_UpsertCustomForm', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_UpsertCustomForm;
GO

-- Create updated procedure with ReleaseNotes parameter
CREATE PROCEDURE dbo.sp_UpsertCustomForm
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
    SET NOCOUNT ON;

    DECLARE @FormId INT;
    DECLARE @Action NVARCHAR(20);

    -- Check if form exists
    SELECT @FormId = FormId
    FROM CustomForms
    WHERE FormName = @FormName;

    IF @FormId IS NULL
    BEGIN
        -- INSERT new form
        INSERT INTO CustomForms (FormName, ProcessName, Status, CurrentVersion, Description, Author, CreatedAt, UpdatedAt)
        VALUES (@FormName, @ProcessName, 'active', @Version, @Description, @Author, GETDATE(), GETDATE());

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
        ReleaseNotes
    )
    VALUES (
        @FormId,
        @Version,
        @CompiledCode,
        @SizeBytes,
        GETDATE(),
        1,
        @ReleaseNotes
    );

    -- Return action performed
    SELECT @Action AS Action;
END
GO

PRINT 'Stored procedure sp_UpsertCustomForm updated successfully with ReleaseNotes parameter';
GO
