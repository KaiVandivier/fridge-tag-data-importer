import i18n from '@dhis2/d2-i18n'
import {
    DataTable,
    DataTableHead,
    DataTableBody,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    Tag,
} from '@dhis2/ui'
import styles from './HistoryWidget.module.css'
import { Widget } from '@/components/Widget/Widget'
import type { DailyRecord, HistoryInfo } from '@/types/fridgeTag'

interface HistoryWidgetProps {
    history: HistoryInfo
}

const fmtTemp = (value: number | null): string =>
    value === null || value === undefined ? '—' : `${value.toFixed(1)} °C`

const fmtTime = (value: string | null): string =>
    !value || value === '00:00' ? '—' : value

const hasAnyAlarm = (record: DailyRecord) =>
    record.alarms.some(
        (a) =>
            (a.eventCount !== null && a.eventCount > 0) ||
            (a.accumulatedMinutes !== null && a.accumulatedMinutes > 0),
    )

export const HistoryWidget = ({ history }: HistoryWidgetProps) => (
    <Widget header={i18n.t('Daily history')} noncollapsible>
        <div className={styles.meta}>
            <div>
                <span className={styles.label}>{i18n.t('Activated')}</span>
                <span>{history.activationTimestamp ?? '—'}</span>
            </div>
            <div>
                <span className={styles.label}>{i18n.t('Report created')}</span>
                <span>{history.reportCreationTimestamp ?? '—'}</span>
            </div>
            <div>
                <span className={styles.label}>{i18n.t('Days recorded')}</span>
                <span>{history.recordCount}</span>
            </div>
        </div>
        <DataTable>
            <DataTableHead>
                <DataTableRow>
                    <DataTableColumnHeader fixed>
                        {i18n.t('Day')}
                    </DataTableColumnHeader>
                    <DataTableColumnHeader fixed>
                        {i18n.t('Date')}
                    </DataTableColumnHeader>
                    <DataTableColumnHeader fixed>
                        {i18n.t('Min')}
                    </DataTableColumnHeader>
                    <DataTableColumnHeader fixed>
                        {i18n.t('Max')}
                    </DataTableColumnHeader>
                    <DataTableColumnHeader fixed>
                        {i18n.t('Avg')}
                    </DataTableColumnHeader>
                    <DataTableColumnHeader fixed>
                        {i18n.t('Min @')}
                    </DataTableColumnHeader>
                    <DataTableColumnHeader fixed>
                        {i18n.t('Max @')}
                    </DataTableColumnHeader>
                    <DataTableColumnHeader fixed>
                        {i18n.t('Alarms')}
                    </DataTableColumnHeader>
                    <DataTableColumnHeader fixed>
                        {i18n.t('Verified')}
                    </DataTableColumnHeader>
                </DataTableRow>
            </DataTableHead>
            <DataTableBody>
                {history.records.length === 0 ? (
                    <DataTableRow>
                        <DataTableCell colSpan="9" align="center">
                            {i18n.t('No daily records in this report')}
                        </DataTableCell>
                    </DataTableRow>
                ) : (
                    history.records.map((record) => (
                        <DataTableRow key={record.day}>
                            <DataTableCell>{record.day}</DataTableCell>
                            <DataTableCell>{record.date ?? '—'}</DataTableCell>
                            <DataTableCell>
                                {fmtTemp(record.temperature.min)}
                            </DataTableCell>
                            <DataTableCell>
                                {fmtTemp(record.temperature.max)}
                            </DataTableCell>
                            <DataTableCell>
                                {fmtTemp(record.temperature.avg)}
                            </DataTableCell>
                            <DataTableCell>
                                {fmtTime(record.temperature.minTime)}
                            </DataTableCell>
                            <DataTableCell>
                                {fmtTime(record.temperature.maxTime)}
                            </DataTableCell>
                            <DataTableCell>
                                {hasAnyAlarm(record) ? (
                                    <div className={styles.alarmCell}>
                                        {record.alarms
                                            .filter(
                                                (a) =>
                                                    (a.eventCount ?? 0) > 0 ||
                                                    (a.accumulatedMinutes ??
                                                        0) > 0,
                                            )
                                            .map((a) => (
                                                <Tag
                                                    key={a.level}
                                                    negative={a.type === 'hot'}
                                                    positive={
                                                        a.type === 'cold'
                                                    }
                                                >
                                                    {a.type === 'hot'
                                                        ? i18n.t(
                                                              'Hot L{{level}} · {{count}}× · {{mins}}m',
                                                              {
                                                                  level: a.level,
                                                                  count:
                                                                      a.eventCount ??
                                                                      0,
                                                                  mins:
                                                                      a.accumulatedMinutes ??
                                                                      0,
                                                              },
                                                          )
                                                        : i18n.t(
                                                              'Cold L{{level}} · {{count}}× · {{mins}}m',
                                                              {
                                                                  level: a.level,
                                                                  count:
                                                                      a.eventCount ??
                                                                      0,
                                                                  mins:
                                                                      a.accumulatedMinutes ??
                                                                      0,
                                                              },
                                                          )}
                                                </Tag>
                                            ))}
                                    </div>
                                ) : (
                                    <Tag positive>{i18n.t('OK')}</Tag>
                                )}
                            </DataTableCell>
                            <DataTableCell>
                                {record.verified ? (
                                    <span className={styles.verified}>
                                        <span>
                                            AM: {record.verified.am ?? '—'}
                                        </span>
                                        <span>
                                            PM: {record.verified.pm ?? '—'}
                                        </span>
                                    </span>
                                ) : (
                                    '—'
                                )}
                            </DataTableCell>
                        </DataTableRow>
                    ))
                )}
            </DataTableBody>
        </DataTable>
    </Widget>
)
