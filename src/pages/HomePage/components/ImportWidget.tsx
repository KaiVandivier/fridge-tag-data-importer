import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    NoticeBox,
    Table,
    TableBody,
    TableCell,
    TableCellHead,
    TableHead,
    TableRow,
    TableRowHead,
    Tooltip,
} from '@dhis2/ui'
import { useMemo, useState } from 'react'
import styles from './ImportWidget.module.css'
import { Widget } from '@/components/Widget/Widget'
import type { FridgeTagReport } from '@/types/fridgeTag'
import {
    buildImportPlan,
    type ImportPlan,
} from '@/utils/buildEventsPayload'
import type { EnrollmentEvent } from '@/utils/useFindTrackedEntity'
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
    existingEvents: EnrollmentEvent[]
}

const isErrorReport = (report: TrackerImportReport | null): boolean =>
    !!report &&
    (report.status === 'ERROR' ||
        (report.validationReport?.errorReports?.length ?? 0) > 0)

const getReportStats = (report: TrackerImportReport) =>
    report.bundleReport?.typeReportMap?.EVENT?.stats ?? report.stats

const StatsTable = ({ report }: { report: TrackerImportReport }) => {
    const stats = getReportStats(report)
    if (!stats) {
        return null
    }
    return (
        <div className={styles.statsTable}>
            <Table suppressZebraStriping>
                <TableHead>
                    <TableRowHead>
                        <TableCellHead dense>
                            {i18n.t('Created')}
                        </TableCellHead>
                        <TableCellHead dense>
                            {i18n.t('Updated')}
                        </TableCellHead>
                        <TableCellHead dense>
                            {i18n.t('Deleted')}
                        </TableCellHead>
                        <TableCellHead dense>
                            {i18n.t('Ignored')}
                        </TableCellHead>
                        <TableCellHead dense>
                            {i18n.t('Total')}
                        </TableCellHead>
                    </TableRowHead>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell dense>{stats.created ?? 0}</TableCell>
                        <TableCell dense>{stats.updated ?? 0}</TableCell>
                        <TableCell dense>{stats.deleted ?? 0}</TableCell>
                        <TableCell dense>{stats.ignored ?? 0}</TableCell>
                        <TableCell dense>{stats.total ?? '—'}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}

type GroupedIssue = {
    code?: string
    message: string
    uids: string[]
}

type RawIssue = {
    code?: string
    message?: string
    uid?: string
}

const groupIssues = (issues: RawIssue[]): GroupedIssue[] => {
    const grouped = new Map<string, GroupedIssue>()
    for (const issue of issues) {
        const message = issue.message ?? ''
        const key = `${issue.code ?? ''}::${message}`
        const existing = grouped.get(key)
        if (existing) {
            if (issue.uid) {
                existing.uids.push(issue.uid)
            }
        } else {
            grouped.set(key, {
                code: issue.code,
                message,
                uids: issue.uid ? [issue.uid] : [],
            })
        }
    }
    return Array.from(grouped.values())
}

const IssueTable = ({ issues }: { issues: GroupedIssue[] }) => (
    <div className={styles.issueTable}>
        <Table suppressZebraStriping>
            <TableHead>
                <TableRowHead>
                    <TableCellHead dense>{i18n.t('Code')}</TableCellHead>
                    <TableCellHead dense>{i18n.t('Message')}</TableCellHead>
                    <TableCellHead dense>{i18n.t('Count')}</TableCellHead>
                    <TableCellHead dense>
                        {i18n.t('Affected events')}
                    </TableCellHead>
                </TableRowHead>
            </TableHead>
            <TableBody>
                {issues.map((issue, idx) => (
                    <TableRow key={`${issue.code ?? 'issue'}-${idx}`}>
                        <TableCell dense>
                            <span className={styles.issueCode}>
                                {issue.code ?? '—'}
                            </span>
                        </TableCell>
                        <TableCell dense>{issue.message}</TableCell>
                        <TableCell dense>{issue.uids.length}</TableCell>
                        <TableCell dense>
                            <span className={styles.issueUids}>
                                {issue.uids.length > 0
                                    ? issue.uids.join(', ')
                                    : '—'}
                            </span>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
)

export const ImportWidget = ({
    report,
    mapping,
    enrollmentId,
    trackedEntityId,
    orgUnitId,
    existingEvents,
}: ImportWidgetProps) => {
    const [validationReport, setValidationReport] =
        useState<TrackerImportReport | null>(null)
    const [commitReport, setCommitReport] =
        useState<TrackerImportReport | null>(null)

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

    const importMutation = useTrackerImport()

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
                            {i18n.t('Existing events for matched dates')}
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
                    <NoticeBox warning title={i18n.t('Nothing to import')}>
                        {i18n.t(
                            'No daily records in this report can be turned into events.'
                        )}
                    </NoticeBox>
                )}

                {hasEvents && (() => {
                    const needsDryRun =
                        !validationPassed && !isWorking && !commitSucceeded
                    const importButton = (
                        <Button
                            primary
                            onClick={runImport}
                            loading={isWorking && validationPassed}
                            disabled={
                                isWorking ||
                                !validationPassed ||
                                commitSucceeded
                            }
                        >
                            {i18n.t('Import')}
                        </Button>
                    )
                    return (
                        <ButtonStrip>
                            <Button
                                onClick={runTest}
                                loading={
                                    isWorking &&
                                    !commitReport &&
                                    !validationReport
                                }
                                disabled={isWorking || commitSucceeded}
                            >
                                {i18n.t('Dry run')}
                            </Button>
                            {needsDryRun ? (
                                <Tooltip
                                    content={i18n.t(
                                        'Complete a dry run before importing'
                                    )}
                                >
                                    {importButton}
                                </Tooltip>
                            ) : (
                                importButton
                            )}
                        </ButtonStrip>
                    )
                })()}

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
                                ? i18n.t('Dry run found problems')
                                : i18n.t('Dry run passed')
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

    if (errors.length > 0) {
        const groupedErrors = groupIssues(
            errors.map((e) => ({
                code: e.errorCode,
                message: e.message,
                uid: e.uid,
            }))
        )
        return (
            <div className={styles.reportSection}>
                <NoticeBox error title={title}>
                    {report.message ||
                        i18n.t('{{count}} validation errors', {
                            count: errors.length,
                        })}
                </NoticeBox>
                <StatsTable report={report} />
                <IssueTable issues={groupedErrors} />
            </div>
        )
    }

    const groupedWarnings = groupIssues(
        warnings.map((w) => ({
            code: w.warningCode,
            message: w.warningMessage ?? w.message,
            uid: w.uid,
        }))
    )

    return (
        <div className={styles.reportSection}>
            <NoticeBox valid title={title}>
                {i18n.t('No issues detected.')}
            </NoticeBox>
            <StatsTable report={report} />
            {groupedWarnings.length > 0 && (
                <IssueTable issues={groupedWarnings} />
            )}
        </div>
    )
}
