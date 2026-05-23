import i18n from '@dhis2/d2-i18n'
import {
    Button,
    FileInput,
    NoticeBox,
} from '@dhis2/ui'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CertificateWidget } from './components/CertificateWidget'
import { DeviceWidget } from './components/DeviceWidget'
import { HistoryWidget } from './components/HistoryWidget'
import { MatchedTrackedEntityWidget } from './components/MatchedTrackedEntityWidget'
import styles from './HomePage.module.css'
import type { FridgeTagReport } from '@/types/fridgeTag'
import {
    parseFridgeTagText,
    readFileAsText,
} from '@/utils/parseFridgeTagFile'
import { useFindTrackedEntity } from '@/utils/useFindTrackedEntity'
import { useMappingConfig } from '@/utils/useMappingConfig'

interface FileInputPayload {
    files: FileList | null
    name: string
}

export const HomePage = () => {
    const [report, setReport] = useState<FridgeTagReport | null>(null)
    const [fileName, setFileName] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    const { data: mappingConfig, isLoading: isLoadingMapping } =
        useMappingConfig()
    const programId = mappingConfig?.programId ?? ''
    const attributeId = mappingConfig?.attributeId ?? ''
    const isMappingReady = !!programId && !!attributeId
    const serial = report?.config.serial ?? null

    const {
        trackedEntity,
        isLoading: isSearching,
        error: searchError,
    } = useFindTrackedEntity({
        programId,
        attributeId,
        value: isMappingReady ? serial : null,
    })

    const handleFile = async (file: File) => {
        setBusy(true)
        setError(null)
        try {
            const text = await readFileAsText(file)
            const parsed = parseFridgeTagText(text)
            setReport(parsed)
            setFileName(file.name)
        } catch (err) {
            setReport(null)
            setFileName(file.name)
            setError(
                err instanceof Error
                    ? err.message
                    : i18n.t('Failed to parse the report file'),
            )
        } finally {
            setBusy(false)
        }
    }

    const handleChange = ({ files }: FileInputPayload) => {
        const file = files?.[0]
        if (file) {
            void handleFile(file)
        }
    }

    const handleClear = () => {
        setReport(null)
        setFileName(null)
        setError(null)
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    {i18n.t('Fridge-tag report viewer')}
                </h1>
                <p className={styles.subtitle}>
                    {i18n.t(
                        'Upload a Berlinger Fridge-tag text report to inspect the daily temperature history, alarms, and device configuration.',
                    )}
                </p>
            </header>

            <section className={styles.uploadCard}>
                <div className={styles.uploadRow}>
                    <FileInput
                        name="fridgeTagReport"
                        accept=".txt,text/plain"
                        buttonLabel={i18n.t('Choose a Fridge-tag report')}
                        onChange={handleChange}
                        disabled={busy}
                    />
                    {fileName && (
                        <div className={styles.fileMeta}>
                            <span className={styles.fileName}>{fileName}</span>
                            <Button small secondary onClick={handleClear}>
                                {i18n.t('Clear')}
                            </Button>
                        </div>
                    )}
                </div>
                {busy && (
                    <p className={styles.statusLine}>{i18n.t('Parsing…')}</p>
                )}
            </section>

            {error && (
                <NoticeBox error title={i18n.t('Could not parse report')}>
                    {error}
                </NoticeBox>
            )}

            {report && !error && !isLoadingMapping && !isMappingReady && (
                <NoticeBox
                    warning
                    title={i18n.t('Mapping not configured')}
                >
                    {i18n.t(
                        'A program and identifier attribute have not been configured yet, so the device serial cannot be matched to a tracked entity. Configure the mapping on the Mapping page to enable tracked entity lookup.',
                    )}{' '}
                    <Link to="/mapping">{i18n.t('Go to Mapping')}</Link>
                </NoticeBox>
            )}

            {report && !error && isMappingReady && (
                <MatchedTrackedEntityWidget
                    serial={serial}
                    trackedEntity={trackedEntity}
                    isLoading={isSearching}
                    error={searchError}
                />
            )}

            {report && !error && (
                <div className={styles.sections}>
                    <DeviceWidget
                        device={report.device}
                        config={report.config}
                    />
                    <HistoryWidget history={report.history} />
                    <CertificateWidget
                        certificate={report.certificate}
                        signatures={report.signatures}
                    />
                </div>
            )}

            {!report && !error && !busy && (
                <NoticeBox title={i18n.t('No report loaded')}>
                    {i18n.t(
                        'Choose a .txt file exported from a Berlinger Fridge-tag device to begin.',
                    )}
                </NoticeBox>
            )}
        </div>
    )
}
