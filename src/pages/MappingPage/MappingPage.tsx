import i18n from '@dhis2/d2-i18n'
import {
    NoticeBox,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import { useState } from 'react'
import styles from './MappingPage.module.css'
import { usePrograms } from '@/utils/usePrograms'

export const MappingPage = () => {
    const { programs, isLoading, error } = usePrograms()
    const [selectedProgramId, setSelectedProgramId] = useState<string>('')

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>{i18n.t('Mapping')}</h1>
                <p className={styles.subtitle}>
                    {i18n.t('Map fridge tag values to configured metadata')}
                </p>
            </header>

            {error ? (
                <NoticeBox error title={i18n.t('Error loading programs')}>
                    {error.message || i18n.t('An unknown error occurred')}
                </NoticeBox>
            ) : (
                <SingleSelectField
                    label={i18n.t('Temperature modeling program')}
                    filterable
                    loading={isLoading}
                    noMatchText={i18n.t('No matches found')}
                    selected={selectedProgramId}
                    onChange={({ selected }) => setSelectedProgramId(selected)}
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
        </div>
    )
}
