import i18n from '@dhis2/d2-i18n'
import {
    NoticeBox,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import { useState } from 'react'
import styles from './MappingPage.module.css'
import { useProgramAttributes } from '@/utils/useProgramAttributes'
import { usePrograms } from '@/utils/usePrograms'

export const MappingPage = () => {
    const {
        programs,
        isLoading: programsLoading,
        error: programsError,
    } = usePrograms()
    const [selectedProgramId, setSelectedProgramId] = useState<string>('')
    const [selectedAttributeId, setSelectedAttributeId] = useState<string>('')
    const {
        attributes,
        isLoading: attributesLoading,
        error: attributesError,
    } = useProgramAttributes(selectedProgramId)

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
        </div>
    )
}
