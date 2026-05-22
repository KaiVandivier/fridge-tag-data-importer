import i18n from '@dhis2/d2-i18n'
import {
    NoticeBox,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import { useEffect, useState } from 'react'
import styles from './MappingPage.module.css'
import { useProgramAttributes } from '@/utils/useProgramAttributes'
import { usePrograms } from '@/utils/usePrograms'
import { useProgramStageDataElements } from '@/utils/useProgramStageDataElements'
import { useProgramStages } from '@/utils/useProgramStages'

type DataElementFieldKey =
    | 'averageStorageTemperature'
    | 'lowerAlarmLimit'
    | 'minTemp'
    | 'totalLowAlarmTime'
    | 'upperAlarmLimit'
    | 'maxTemp'
    | 'totalHighAlarmTime'
    | 'events'

type DataElementSelections = Record<DataElementFieldKey, string>

const emptyDataElementSelections: DataElementSelections = {
    averageStorageTemperature: '',
    lowerAlarmLimit: '',
    minTemp: '',
    totalLowAlarmTime: '',
    upperAlarmLimit: '',
    maxTemp: '',
    totalHighAlarmTime: '',
    events: '',
}

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

export const MappingPage = () => {
    const {
        programs,
        isLoading: programsLoading,
        error: programsError,
    } = usePrograms()
    const [selectedProgramId, setSelectedProgramId] = useState<string>('')
    const [selectedAttributeId, setSelectedAttributeId] = useState<string>('')
    const [selectedProgramStageId, setSelectedProgramStageId] =
        useState<string>('')
    const [dataElementSelections, setDataElementSelections] =
        useState<DataElementSelections>(emptyDataElementSelections)
    const {
        attributes,
        isLoading: attributesLoading,
        error: attributesError,
    } = useProgramAttributes(selectedProgramId)
    const {
        programStages,
        isLoading: programStagesLoading,
        error: programStagesError,
    } = useProgramStages(selectedProgramId)
    const {
        dataElements,
        isLoading: dataElementsLoading,
        error: dataElementsError,
    } = useProgramStageDataElements(selectedProgramStageId)

    useEffect(() => {
        if (programStages?.length === 1) {
            setSelectedProgramStageId(programStages[0].id)
        }
    }, [programStages])

    const dataElementFields = useDataElementFields()

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>{i18n.t('Mapping')}</h1>
                <p className={styles.subtitle}>
                    {i18n.t('Map fridge tag values to configured metadata')}
                </p>
            </header>

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
                    selected={selectedProgramId}
                    onChange={({ selected }) => {
                        setSelectedProgramId(selected)
                        setSelectedAttributeId('')
                        setSelectedProgramStageId('')
                        setDataElementSelections(emptyDataElementSelections)
                    }}
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
                    disabled={!selectedProgramId}
                    loading={attributesLoading}
                    noMatchText={i18n.t('No matches found')}
                    selected={selectedAttributeId}
                    onChange={({ selected }) =>
                        setSelectedAttributeId(selected)
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
                    disabled={!selectedProgramId}
                    loading={programStagesLoading}
                    noMatchText={i18n.t('No matches found')}
                    selected={selectedProgramStageId}
                    onChange={({ selected }) => {
                        setSelectedProgramStageId(selected)
                        setDataElementSelections(emptyDataElementSelections)
                    }}
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
                    const selectedId = dataElementSelections[key]
                    const selectedByOthers = new Set(
                        dataElementFields
                            .filter((field) => field.key !== key)
                            .map((field) => dataElementSelections[field.key])
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
                            disabled={!selectedProgramStageId}
                            loading={dataElementsLoading}
                            noMatchText={i18n.t('No matches found')}
                            selected={selectedId}
                            onChange={({ selected }) =>
                                setDataElementSelections((prev) => ({
                                    ...prev,
                                    [key]: selected,
                                }))
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
        </div>
    )
}
