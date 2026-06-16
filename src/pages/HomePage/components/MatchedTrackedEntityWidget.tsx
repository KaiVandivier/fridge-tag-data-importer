import i18n from '@dhis2/d2-i18n'
import {
    CircularLoader,
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead,
    DataTableRow,
    NoticeBox,
} from '@dhis2/ui'
import styles from './MatchedTrackedEntityWidget.module.css'
import { Widget } from '@/components/Widget/Widget'
import type { MatchedTrackedEntity } from '@/utils/useFindTrackedEntity'

interface MatchedTrackedEntityWidgetProps {
    serial: string | null
    trackedEntity: MatchedTrackedEntity | undefined
    isLoading: boolean
    error: Error | null
}

export const MatchedTrackedEntityWidget = ({
    serial,
    trackedEntity,
    isLoading,
    error,
}: MatchedTrackedEntityWidgetProps) => (
    <Widget header={i18n.t('Matched tracked entity')} noncollapsible>
        <div className={styles.body}>
            <div className={styles.lookupRow}>
                <span className={styles.label}>
                    {i18n.t('Looking up serial')}
                </span>
                <span className={styles.serial}>{serial ?? '—'}</span>
            </div>

            {isLoading && (
                <div className={styles.loading}>
                    <CircularLoader small />
                    <span>{i18n.t('Searching for tracked entity…')}</span>
                </div>
            )}

            {!isLoading && error && (
                <NoticeBox
                    error
                    title={i18n.t('Could not search for tracked entity')}
                >
                    {error.message || i18n.t('An unknown error occurred')}
                </NoticeBox>
            )}

            {!isLoading && !error && !trackedEntity && (
                <NoticeBox
                    warning
                    title={i18n.t('No tracked entity matched this serial')}
                >
                    {i18n.t(
                        'No tracked entity was found in the configured program with an identifier attribute matching the device serial number.'
                    )}
                </NoticeBox>
            )}

            {!isLoading && !error && trackedEntity && (
                <DataTable>
                    <DataTableHead>
                        <DataTableRow>
                            <DataTableColumnHeader>
                                {i18n.t('Field')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader>
                                {i18n.t('Value')}
                            </DataTableColumnHeader>
                        </DataTableRow>
                    </DataTableHead>
                    <DataTableBody>
                        <DataTableRow>
                            <DataTableCell>
                                {i18n.t('Tracked entity ID')}
                            </DataTableCell>
                            <DataTableCell>
                                {trackedEntity.trackedEntity}
                            </DataTableCell>
                        </DataTableRow>
                        <DataTableRow>
                            <DataTableCell>
                                {i18n.t('Organisation unit')}
                            </DataTableCell>
                            <DataTableCell>
                                {trackedEntity.orgUnit}
                            </DataTableCell>
                        </DataTableRow>
                        {trackedEntity.createdAt && (
                            <DataTableRow>
                                <DataTableCell>
                                    {i18n.t('Created')}
                                </DataTableCell>
                                <DataTableCell>
                                    {trackedEntity.createdAt}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                        {trackedEntity.attributes.map((attr) => (
                            <DataTableRow key={attr.attribute}>
                                <DataTableCell>
                                    {attr.displayName ?? attr.attribute}
                                </DataTableCell>
                                <DataTableCell>{attr.value}</DataTableCell>
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            )}
        </div>
    </Widget>
)
