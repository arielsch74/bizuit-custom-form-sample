-- =============================================
-- Stored Procedure: sp_UpsertCustomForm
-- Description: Inserta o actualiza un Custom Form desde deployment package
-- Schema: Ajustado al schema real de CustomForms y CustomFormVersions
-- =============================================

CREATE OR ALTER PROCEDURE sp_UpsertCustomForm
    @FormName NVARCHAR(100),
    @ProcessName NVARCHAR(100),
    @Version NVARCHAR(50),
    @Description NVARCHAR(MAX),
    @Author NVARCHAR(100),
    @CompiledCode NVARCHAR(MAX),
    @SizeBytes INT,
    @PackageVersion NVARCHAR(20),
    @CommitHash NVARCHAR(100),
    @BuildDate DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FormId INT;
    DECLARE @ExistingVersionId INT;
    DECLARE @Action NVARCHAR(20);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Verificar si existe el form en CustomForms
        SELECT @FormId = FormId
        FROM CustomForms
        WHERE FormName = @FormName;

        -- 2. Si no existe, crear registro en CustomForms
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
                @FormName, -- DisplayName = FormName por defecto
                @Description,
                @Version,
                'active',
                @Author,
                @Author, -- CreatedBy = Author
                GETUTCDATE(),
                GETUTCDATE()
            );

            SET @FormId = SCOPE_IDENTITY();
            SET @Action = 'inserted';
        END
        ELSE
        BEGIN
            -- Actualizar metadata del form
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

        -- 3. Desactivar versión actual (si existe)
        UPDATE CustomFormVersions
        SET IsCurrent = 0
        WHERE FormId = @FormId AND IsCurrent = 1;

        -- 4. Verificar si ya existe esta versión específica
        SELECT @ExistingVersionId = VersionId
        FROM CustomFormVersions
        WHERE FormId = @FormId AND Version = @Version;

        -- 5. Preparar metadata JSON con info del deployment
        DECLARE @MetadataJson NVARCHAR(MAX);
        SET @MetadataJson = '{' +
            '"packageVersion":"' + ISNULL(@PackageVersion, '') + '",' +
            '"commitHash":"' + ISNULL(@CommitHash, '') + '",' +
            '"buildDate":"' + CONVERT(NVARCHAR(50), @BuildDate, 127) + '"' +
        '}';

        IF @ExistingVersionId IS NOT NULL
        BEGIN
            -- Actualizar versión existente
            UPDATE CustomFormVersions
            SET CompiledCode = @CompiledCode,
                SizeBytes = @SizeBytes,
                CommitHash = @CommitHash,
                BuildNumber = @PackageVersion,
                IsCurrent = 1,
                PublishedBy = @Author,
                PublishedAt = GETUTCDATE(),
                Metadata = @MetadataJson
            WHERE VersionId = @ExistingVersionId;
        END
        ELSE
        BEGIN
            -- Insertar nueva versión
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
                Metadata
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
                @MetadataJson
            );
        END

        COMMIT TRANSACTION;

        -- Retornar resultado
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
