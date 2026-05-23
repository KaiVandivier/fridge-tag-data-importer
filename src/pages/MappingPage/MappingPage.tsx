import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    CircularLoader,
    NoticeBox,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
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
import { useProgramAttributes } from '@/utils/useProgramAttributes'
import { usePrograms } from '@/utils/usePrograms'
import { useProgramStageDataElements } from '@/utils/useProgramStageDataElements'
import { useProgramStages } from '@/utils/useProgramStages'

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
    canReset: boolean
    canSave: boolean
    isSaving: boolean
    onReset: () => void
    onSave: () => void
}

const ActionBar = ({
    canReset,
    canSave,
    isSaving,
    onReset,
    onSave,
}: ActionBarProps) => (
    <div className={styles.actionBar}>
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
        attributes,
        isLoading: attributesLoading,
        error: attributesError,
    } = useProgramAttributes(draftConfig.programId)
    const {
        programStages,
        isLoading: programStagesLoading,
        error: programStagesError,
    } = useProgramStages(draftConfig.programId)
    const {
        dataElements,
        isLoading: dataElementsLoading,
        error: dataElementsError,
    } = useProgramStageDataElements(draftConfig.programStageId)

    useEffect(() => {
        if (
            programStages?.length === 1 &&
            !draftConfig.programStageId
        ) {
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

    const handleDataElementChange = (
        key: DataElementFieldKey,
        id: string
    ) => {
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
            <header className={styles.header}>
                <h1 className={styles.title}>{i18n.t('Mapping')}</h1>
                <p className={styles.subtitle}>
                    {i18n.t('Map fridge tag values to configured metadata')}
                </p>
            </header>

            <ActionBar
                canReset={isDirty}
                canSave={canSave}
                isSaving={isSaving}
                onReset={handleReset}
                onSave={handleSave}
            />

            {programsError ? (
                <NoticeBox error title={i18n.t('Error loading programs')}>
                    {programsError.message ||
                        i18n.t('An unknown error occurred')}
                </NoticeBox>
            ) : (
                <SingleSelectField
                    label={i18n.t('Temperature modeling program')}
                    filterable
                    loading={programsLoading}
                    noMatchText={i18n.t('No matches found')}
                    selected={draftConfig.programId}
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

            {attributesError ? (
                <NoticeBox
                    error
                    title={i18n.t('Error loading program attributes')}
                >
                    {attributesError.message ||
                        i18n.t('An unknown error occurred')}
                </NoticeBox>
            ) : (
                <SingleSelectField
                    label={i18n.t('Fridge-tag identifier')}
                    filterable
                    disabled={!draftConfig.programId}
                    loading={attributesLoading}
                    noMatchText={i18n.t('No matches found')}
                    selected={draftConfig.attributeId}
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
            )}

            {programStagesError ? (
                <NoticeBox
                    error
                    title={i18n.t('Error loading program stages')}
                >
                    {programStagesError.message ||
                        i18n.t('An unknown error occurred')}
                </NoticeBox>
            ) : (
                <SingleSelectField
                    label={i18n.t('Temperature reading program stage')}
                    filterable
                    disabled={!draftConfig.programId}
                    loading={programStagesLoading}
                    noMatchText={i18n.t('No matches found')}
                    selected={draftConfig.programStageId}
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
            )}

            {dataElementsError ? (
                <NoticeBox error title={i18n.t('Error loading data elements')}>
                    {dataElementsError.message ||
                        i18n.t('An unknown error occurred')}
                </NoticeBox>
            ) : (
                dataElementFields.map(({ key, label }) => {
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
                            filterable
                            disabled={!draftConfig.programStageId}
                            loading={dataElementsLoading}
                            noMatchText={i18n.t('No matches found')}
                            selected={selectedId}
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
                })
            )}

            <ActionBar
                canReset={isDirty}
                canSave={canSave}
                isSaving={isSaving}
                onReset={handleReset}
                onSave={handleSave}
            />
        </div>
    )
}
