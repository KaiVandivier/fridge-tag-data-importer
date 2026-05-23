import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    CircularLoader,
    NoticeBox,
} from '@dhis2/ui'
import { useMemo, useState } from 'react'
import styles from './ImportWidget.module.css'
import { Widget } from '@/components/Widget/Widget'
import type { FridgeTagReport } from '@/types/fridgeTag'
import {
    buildImportPlan,
    type ImportPlan,
} from '@/utils/buildEventsPayload'
import { useEnrollmentEvents } from '@/utils/useEnrollmentEvents'
import type { MappingConfig } from '@/utils/useMappingConfig'
import {
    useTrackerImport,
    type TrackerImportReport,
} from '@/utils/useTrackerImport'

interface ImportWidgetProps {
    report: FridgeTagReport
    mapping: MappingConfig
    enrollmentId: string
    trackedEntityId: string
    orgUnitId: string
}

const isErrorReport = (report: TrackerImportReport | null): boolean =>
    !!report &&
    (report.status === 'ERROR' ||
        (report.validationReport?.errorReports?.length ?? 0) > 0)

const summariseStats = (report: TrackerImportReport): string => {
    const eventStats = report.bundleReport?.typeReportMap?.EVENT?.stats
    const stats = eventStats ?? report.stats
    if (!stats) {
        return ''
    }
    return i18n.t(
        '{{created}} created · {{updated}} updated · {{ignored}} ignored',
        {
            created: stats.created ?? 0,
            updated: stats.updated ?? 0,
            ignored: stats.ignored ?? 0,
        }
    )
}

export const ImportWidget = ({
    report,
    mapping,
    enrollmentId,
    trackedEntityId,
    orgUnitId,
}: ImportWidgetProps) => {
    const [validationReport, setValidationReport] =
        useState<TrackerImportReport | null>(null)
    const [commitReport, setCommitReport] =
        useState<TrackerImportReport | null>(null)

    const {
        events: existingEvents,
        isLoading: isLoadingExisting,
        error: existingError,
    } = useEnrollmentEvents({
        enrollmentId,
        programStageId: mapping.programStageId,
        orgUnitId,
    })

    const plan: ImportPlan = useMemo(
        () =>
            buildImportPlan({
                report,
                mapping,
                enrollmentId,
                trackedEntityId,
                orgUnitId,
                existingEvents,
            }),
        [
            report,
            mapping,
            enrollmentId,
            trackedEntityId,
            orgUnitId,
            existingEvents,
        ]
    )

    const importMutation = useTrackerImport({
        enrollmentId,
        programStageId: mapping.programStageId,
    })

    const runTest = () => {
        setValidationReport(null)
        setCommitReport(null)
        importMutation.mutate(
            { events: plan.events, dryRun: true },
            {
                onSuccess: (data) => setValidationReport(data),
            }
        )
    }

    const runImport = () => {
        setCommitReport(null)
        importMutation.mutate(
            { events: plan.events, dryRun: false },
            {
                onSuccess: (data) => setCommitReport(data),
            }
        )
    }

    const hasEvents = plan.events.length > 0
    const isWorking = importMutation.isLoading
    const validationFailed = isErrorReport(validationReport)
    const validationPassed = !!validationReport && !validationFailed
    const commitFailed = isErrorReport(commitReport)
    const commitSucceeded = !!commitReport && !commitFailed

    return (
        <Widget header={i18n.t('Import to tracker')} noncollapsible>
            <div className={styles.body}>
                {isLoadingExisting && (
                    <div className={styles.statusLine}>
                        <CircularLoader small />
                        <span>{i18n.t('Loading existing events…')}</span>
                    </div>
                )}

                {existingError && (
                    <NoticeBox
                        error
                        title={i18n.t('Could not load existing events')}
                    >
                        {existingError.message ||
                            i18n.t('An unknown error occurred')}
                    </NoticeBox>
                )}

                {!isLoadingExisting && !existingError && (
                    <>
                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryCell}>
                                <span className={styles.summaryLabel}>
                                    {i18n.t('To create')}
                                </span>
                                <span className={styles.summaryValue}>
                                    {plan.creates}
                                </span>
                            </div>
                            <div className={styles.summaryCell}>
                                <span className={styles.summaryLabel}>
                                    {i18n.t('To overwrite')}
                                </span>
                                <span className={styles.summaryValue}>
                                    {plan.updates}
                                </span>
                                <span className={styles.summarySubvalue}>
                                    {i18n.t(
                                        'Existing events for matched dates'
                                    )}
                                </span>
                            </div>
                            <div className={styles.summaryCell}>
                                <span className={styles.summaryLabel}>
                                    {i18n.t('Skipped')}
                                </span>
                                <span className={styles.summaryValue}>
                                    {plan.skipped.length}
                                </span>
                                <span className={styles.summarySubvalue}>
                                    {i18n.t('Days with no date')}
                                </span>
                            </div>
                            <div className={styles.summaryCell}>
                                <span className={styles.summaryLabel}>
                                    {i18n.t('Date range')}
                                </span>
                                <span className={styles.summarySubvalue}>
                                    {plan.dateRange
                                        ? `${plan.dateRange.from} → ${plan.dateRange.to}`
                                        : '—'}
                                </span>
                            </div>
                        </div>

                        {!hasEvents && (
                            <NoticeBox
                                warning
                                title={i18n.t('Nothing to import')}
                            >
                                {i18n.t(
                                    'No daily records in this report can be turned into events.'
                                )}
                            </NoticeBox>
                        )}

                        {hasEvents && (
                            <ButtonStrip>
                                <Button
                                    primary
                                    onClick={runTest}
                                    loading={
                                        isWorking &&
                                        !commitReport &&
                                        !validationReport
                                    }
                                    disabled={isWorking || commitSucceeded}
                                >
                                    {i18n.t('Run test import')}
                                </Button>
                                <Button
                                    onClick={runImport}
                                    loading={
                                        isWorking && validationPassed
                                    }
                                    disabled={
                                        isWorking ||
                                        !validationPassed ||
                                        commitSucceeded
                                    }
                                >
                                    {i18n.t('Send for real')}
                                </Button>
                            </ButtonStrip>
                        )}

                        {importMutation.error && (
                            <NoticeBox
                                error
                                title={i18n.t('Tracker request failed')}
                            >
                                {importMutation.error.message ||
                                    i18n.t('An unknown error occurred')}
                            </NoticeBox>
                        )}

                        {validationReport && (
                            <ValidationSummary
                                report={validationReport}
                                title={
                                    validationFailed
                                        ? i18n.t('Test import found problems')
                                        : i18n.t('Test import passed')
                                }
                            />
                        )}

                        {commitReport && (
                            <ValidationSummary
                                report={commitReport}
                                title={
                                    commitFailed
                                        ? i18n.t('Import failed')
                                        : i18n.t('Import complete')
                                }
                            />
                        )}
                    </>
                )}
            </div>
        </Widget>
    )
}

const ValidationSummary = ({
    report,
    title,
}: {
    report: TrackerImportReport
    title: string
}) => {
    const errors = report.validationReport?.errorReports ?? []
    const warnings = report.validationReport?.warningReports ?? []
    const stats = summariseStats(report)

    if (errors.length > 0) {
        return (
            <div className={styles.reportSection}>
                <NoticeBox error title={title}>
                    {report.message ||
                        i18n.t('{{count}} validation errors', {
                            count: errors.length,
                        })}
                </NoticeBox>
                <ul className={styles.issueList}>
                    {errors.map((err, idx) => (
                        <li
                            key={`${err.errorCode ?? 'err'}-${err.uid ?? idx}`}
                            className={styles.issueItem}
                        >
                            {err.errorCode && (
                                <span className={styles.issueCode}>
                                    {err.errorCode}
                                </span>
                            )}
                            {err.message}
                            {err.uid ? ` (${err.uid})` : ''}
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    return (
        <div className={styles.reportSection}>
            <NoticeBox valid title={title}>
                {stats || i18n.t('No issues detected.')}
            </NoticeBox>
            {warnings.length > 0 && (
                <ul className={styles.issueList}>
                    {warnings.map((w, idx) => (
                        <li
                            key={`${w.warningCode ?? 'warn'}-${w.uid ?? idx}`}
                            className={styles.issueItem}
                        >
                            {w.warningCode && (
                                <span className={styles.issueCode}>
                                    {w.warningCode}
                                </span>
                            )}
                            {w.warningMessage ?? w.message}
                            {w.uid ? ` (${w.uid})` : ''}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
