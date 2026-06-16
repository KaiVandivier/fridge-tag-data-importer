import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    CircularLoader,
    NoticeBox,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import cx from 'classnames'
import { useEffect, useMemo, useState } from 'react'
import styles from './MappingPage.module.css'
import {
    DataElementFieldKey,
    emptyMappingConfig,
    isMappingConfigComplete,
    MappingConfig,
    useMappingConfig,
    useSaveMappingConfig,
} from '@/utils/useMappingConfig'
import { useProgram } from '@/utils/useProgram'
import { usePrograms } from '@/utils/usePrograms'

const useDataElementFields = (): Array<{
    key: DataElementFieldKey
    label: string
}> => [
    {
        key: 'averageStorageTemperature',
        label: i18n.t('Average storage temperature data element'),
    },
    {
        key: 'lowerAlarmLimit',
        label: i18n.t('Lower alarm limit data element'),
    },
    { key: 'minTemp', label: i18n.t('Min. temp. data element') },
    {
        key: 'totalLowAlarmTime',
        label: i18n.t('Total low alarm time data element'),
    },
    {
        key: 'upperAlarmLimit',
        label: i18n.t('Upper alarm limit data element'),
    },
    { key: 'maxTemp', label: i18n.t('Max. temp. data element') },
    {
        key: 'totalHighAlarmTime',
        label: i18n.t('Total high alarm time data element'),
    },
    { key: 'events', label: i18n.t('Events data element') },
]

type ActionBarProps = {
    className?: string
    canReset: boolean
    canSave: boolean
    isSaving: boolean
    onReset: () => void
    onSave: () => void
}

const ActionBar = ({
    className,
    canReset,
    canSave,
    isSaving,
    onReset,
    onSave,
}: ActionBarProps) => (
    <div className={cx(styles.actionBar, className)}>
        <ButtonStrip end>
            <Button
                secondary
                disabled={!canReset || isSaving}
                onClick={onReset}
            >
                {i18n.t('Reset')}
            </Button>
            <Button
                primary
                disabled={!canSave}
                loading={isSaving}
                onClick={onSave}
            >
                {i18n.t('Save')}
            </Button>
        </ButtonStrip>
    </div>
)

export const MappingPage = () => {
    const {
        data: savedConfig,
        isLoading: configLoading,
        error: configError,
    } = useMappingConfig()
    const { mutate: saveConfig, isLoading: isSaving } = useSaveMappingConfig()

    const [draftConfig, setDraftConfig] =
        useState<MappingConfig>(emptyMappingConfig)

    useEffect(() => {
        if (savedConfig) {
            setDraftConfig(savedConfig)
        }
    }, [savedConfig])

    const {
        programs,
        isLoading: programsLoading,
        error: programsError,
    } = usePrograms()
    const {
        program,
        isLoading: programLoading,
        error: programError,
    } = useProgram(draftConfig.programId)

    const attributes = program?.attributes
    const programStages = program?.programStages
    const dataElements = useMemo(
        () =>
            programStages?.find((s) => s.id === draftConfig.programStageId)
                ?.dataElements,
        [programStages, draftConfig.programStageId]
    )

    useEffect(() => {
        if (programStages?.length === 1 && !draftConfig.programStageId) {
            const onlyStageId = programStages[0].id
            setDraftConfig((prev) => ({
                ...prev,
                programStageId: onlyStageId,
            }))
        }
    }, [programStages, draftConfig.programStageId])

    const dataElementFields = useDataElementFields()

    const isDirty = useMemo(
        () =>
            !!savedConfig &&
            JSON.stringify(savedConfig) !== JSON.stringify(draftConfig),
        [savedConfig, draftConfig]
    )
    const isComplete = isMappingConfigComplete(draftConfig)
    const canSave = isDirty && isComplete && !isSaving

    const handleProgramChange = (programId: string) => {
        setDraftConfig({ ...emptyMappingConfig, programId })
    }

    const handleAttributeChange = (attributeId: string) => {
        setDraftConfig((prev) => ({ ...prev, attributeId }))
    }

    const handleProgramStageChange = (programStageId: string) => {
        setDraftConfig((prev) => ({
            ...prev,
            programStageId,
            dataElementIds: emptyMappingConfig.dataElementIds,
        }))
    }

    const handleDataElementChange = (key: DataElementFieldKey, id: string) => {
        setDraftConfig((prev) => ({
            ...prev,
            dataElementIds: { ...prev.dataElementIds, [key]: id },
        }))
    }

    const handleReset = () => {
        if (savedConfig) {
            setDraftConfig(savedConfig)
        }
    }

    const handleSave = () => {
        if (canSave) {
            saveConfig(draftConfig)
        }
    }

    if (configLoading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingContainer}>
                    <CircularLoader />
                </div>
            </div>
        )
    }

    if (configError) {
        return (
            <div className={styles.page}>
                <NoticeBox
                    error
                    title={i18n.t('Error loading mapping configuration')}
                >
                    {configError.message || i18n.t('An unknown error occurred')}
                </NoticeBox>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <div className={styles.headerRow}>
                <header className={styles.header}>
                    <h1 className={styles.title}>{i18n.t('Mapping')}</h1>
                    <p className={styles.subtitle}>
                        {i18n.t('Map fridge tag values to configured metadata')}
                    </p>
                </header>

                <ActionBar
                    className={styles.headerActions}
                    canReset={isDirty}
                    canSave={canSave}
                    isSaving={isSaving}
                    onReset={handleReset}
                    onSave={handleSave}
                />
            </div>

            {programsError ? (
                <NoticeBox error title={i18n.t('Error loading programs')}>
                    {programsError.message ||
                        i18n.t('An unknown error occurred')}
                </NoticeBox>
            ) : (
                <SingleSelectField
                    label={i18n.t('Temperature modeling program')}
                    placeholder={i18n.t('Select a program')}
                    filterable
                    loading={programsLoading}
                    noMatchText={i18n.t('No matches found')}
                    selected={
                        programs?.some((p) => p.id === draftConfig.programId)
                            ? draftConfig.programId
                            : ''
                    }
                    onChange={({ selected }) => handleProgramChange(selected)}
                >
                    {programs?.map((program) => (
                        <SingleSelectOption
                            key={program.id}
                            label={program.displayName}
                            value={program.id}
                        />
                    ))}
                </SingleSelectField>
            )}

            {programError ? (
                <NoticeBox
                    error
                    title={i18n.t('Error loading program details')}
                >
                    {programError.message ||
                        i18n.t('An unknown error occurred')}
                </NoticeBox>
            ) : (
                <>
                    <SingleSelectField
                        label={i18n.t('Fridge-tag identifier attribute')}
                        placeholder={
                            draftConfig.programId
                                ? i18n.t('Select an attribute')
                                : i18n.t('Select a program first')
                        }
                        filterable
                        disabled={!draftConfig.programId}
                        loading={programLoading}
                        noMatchText={i18n.t('No matches found')}
                        selected={
                            attributes?.some(
                                (a) => a.id === draftConfig.attributeId
                            )
                                ? draftConfig.attributeId
                                : ''
                        }
                        onChange={({ selected }) =>
                            handleAttributeChange(selected)
                        }
                    >
                        {attributes?.map((attribute) => (
                            <SingleSelectOption
                                key={attribute.id}
                                label={attribute.displayName}
                                value={attribute.id}
                            />
                        ))}
                    </SingleSelectField>

                    <SingleSelectField
                        label={i18n.t('Temperature reading program stage')}
                        placeholder={
                            draftConfig.programId
                                ? i18n.t('Select a program stage')
                                : i18n.t('Select a program first')
                        }
                        filterable
                        disabled={!draftConfig.programId}
                        loading={programLoading}
                        noMatchText={i18n.t('No matches found')}
                        selected={
                            programStages?.some(
                                (s) => s.id === draftConfig.programStageId
                            )
                                ? draftConfig.programStageId
                                : ''
                        }
                        onChange={({ selected }) =>
                            handleProgramStageChange(selected)
                        }
                    >
                        {programStages?.map((programStage) => (
                            <SingleSelectOption
                                key={programStage.id}
                                label={programStage.displayName}
                                value={programStage.id}
                            />
                        ))}
                    </SingleSelectField>

                    {dataElementFields.map(({ key, label }) => {
                        const selectedId = draftConfig.dataElementIds[key]
                        const selectedByOthers = new Set(
                            dataElementFields
                                .filter((field) => field.key !== key)
                                .map(
                                    (field) =>
                                        draftConfig.dataElementIds[field.key]
                                )
                                .filter(Boolean)
                        )
                        const availableDataElements = dataElements?.filter(
                            (dataElement) =>
                                !selectedByOthers.has(dataElement.id) ||
                                dataElement.id === selectedId
                        )

                        return (
                            <SingleSelectField
                                key={key}
                                label={label}
                                placeholder={
                                    draftConfig.programStageId
                                        ? i18n.t('Select a data element')
                                        : i18n.t('Select a program stage first')
                                }
                                filterable
                                disabled={!draftConfig.programStageId}
                                loading={programLoading}
                                noMatchText={i18n.t('No matches found')}
                                selected={
                                    availableDataElements?.some(
                                        (de) => de.id === selectedId
                                    )
                                        ? selectedId
                                        : ''
                                }
                                onChange={({ selected }) =>
                                    handleDataElementChange(key, selected)
                                }
                            >
                                {availableDataElements?.map((dataElement) => (
                                    <SingleSelectOption
                                        key={dataElement.id}
                                        label={dataElement.displayName}
                                        value={dataElement.id}
                                    />
                                ))}
                            </SingleSelectField>
                        )
                    })}
                </>
            )}

            <ActionBar
                className={styles.borderTop}
                canReset={isDirty}
                canSave={canSave}
                isSaving={isSaving}
                onReset={handleReset}
                onSave={handleSave}
            />
        </div>
    )
}
