import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    CircularLoader,
    InputField,
    NoticeBox,
    OrganisationUnitTree,
} from '@dhis2/ui'
import { useState } from 'react'
import styles from './RegisterAppliancePage.module.css'
import { OrgUnit, useUserOrgUnitRoots } from '@/utils/useUserOrgUnitRoots'

type SelectedOrgUnit = Pick<OrgUnit, 'id' | 'displayName' | 'path'>

export const RegisterAppliancePage = () => {
    const { rootIds, isLoading, error } = useUserOrgUnitRoots()

    const [orgUnit, setOrgUnit] = useState<SelectedOrgUnit | null>(null)
    const [name, setName] = useState('')
    const [serial, setSerial] = useState('')

    const { show: showCapturedAlert } = useAlert(
        i18n.t('Appliance details captured (not yet saved)'),
        { info: true }
    )

    const canSubmit = !!orgUnit && name.trim() !== '' && serial.trim() !== ''

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        if (!canSubmit) {
            return
        }
        // TODO: persist the new appliance (e.g. create a tracked entity whose
        // serial-number attribute is set from the logger serial number).
        showCapturedAlert()
    }

    return (
        <div className={styles.page}>
            <div className={styles.headerRow}>
                <header className={styles.header}>
                    <h1 className={styles.title}>
                        {i18n.t('Register new appliance')}
                    </h1>
                    <p className={styles.subtitle}>
                        {i18n.t(
                            'Add a new cold-chain appliance and the logger that monitors it.'
                        )}
                    </p>
                </header>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <span className={styles.fieldLabel}>
                        {i18n.t('Organisation unit')}
                    </span>

                    {isLoading ? (
                        <div className={styles.loadingContainer}>
                            <CircularLoader small />
                        </div>
                    ) : error ? (
                        <NoticeBox
                            error
                            title={i18n.t('Error loading organisation units')}
                        >
                            {error.message ||
                                i18n.t('An unknown error occurred')}
                        </NoticeBox>
                    ) : rootIds && rootIds.length > 0 ? (
                        <>
                            <div className={styles.orgUnitTree}>
                                <OrganisationUnitTree
                                    roots={rootIds}
                                    singleSelection
                                    selected={orgUnit ? [orgUnit.path] : []}
                                    onChange={({ id, displayName, path }) =>
                                        setOrgUnit({ id, displayName, path })
                                    }
                                />
                            </div>
                            <span className={styles.selectedOrgUnit}>
                                {orgUnit
                                    ? i18n.t('Selected: {{name}}', {
                                          name: orgUnit.displayName,
                                      })
                                    : i18n.t('No organisation unit selected')}
                            </span>
                        </>
                    ) : (
                        <NoticeBox
                            warning
                            title={i18n.t('No organisation units available')}
                        >
                            {i18n.t(
                                'Your user account has no organisation units assigned.'
                            )}
                        </NoticeBox>
                    )}
                </div>

                <InputField
                    className={styles.field}
                    label={i18n.t('Name')}
                    value={name}
                    placeholder={i18n.t('e.g. Vaccine fridge — Room 3')}
                    onChange={({ value }) => setName(value ?? '')}
                />

                <InputField
                    className={styles.field}
                    label={i18n.t('Logger serial number')}
                    value={serial}
                    placeholder={i18n.t('Serial number printed on the device')}
                    onChange={({ value }) => setSerial(value ?? '')}
                />

                <div className={styles.actionBar}>
                    <ButtonStrip end>
                        <Button primary type="submit" disabled={!canSubmit}>
                            {i18n.t('Register')}
                        </Button>
                    </ButtonStrip>
                </div>
            </form>
        </div>
    )
}
