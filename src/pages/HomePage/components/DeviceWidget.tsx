import i18n from '@dhis2/d2-i18n'
import { Tag } from '@dhis2/ui'
import styles from './DeviceWidget.module.css'
import { Widget } from '@/components/Widget/Widget'
import type { ConfigInfo, DeviceInfo } from '@/types/fridgeTag'

interface DeviceWidgetProps {
    device: DeviceInfo
    config: ConfigInfo
}

const fmt = (value: string | number | null): string =>
    value === null || value === undefined || value === '' ? '—' : String(value)

export const DeviceWidget = ({ device, config }: DeviceWidgetProps) => (
    <Widget header={i18n.t('Device & configuration')} noncollapsible>
        <div className={styles.body}>
            <dl className={styles.grid}>
                <div className={styles.row}>
                    <dt>{i18n.t('Device')}</dt>
                    <dd>{fmt(device.name)}</dd>
                </div>
                <div className={styles.row}>
                    <dt>{i18n.t('Version')}</dt>
                    <dd>{fmt(device.version)}</dd>
                </div>
                <div className={styles.row}>
                    <dt>{i18n.t('Firmware')}</dt>
                    <dd>{fmt(device.firmwareVersion)}</dd>
                </div>
                <div className={styles.row}>
                    <dt>{i18n.t('Sensors')}</dt>
                    <dd>{fmt(device.sensorCount)}</dd>
                </div>
                <div className={styles.row}>
                    <dt>{i18n.t('Serial')}</dt>
                    <dd>{fmt(config.serial)}</dd>
                </div>
                <div className={styles.row}>
                    <dt>{i18n.t('PCB')}</dt>
                    <dd>{fmt(config.pcb)}</dd>
                </div>
                <div className={styles.row}>
                    <dt>{i18n.t('CID')}</dt>
                    <dd>{fmt(config.cid)}</dd>
                </div>
                <div className={styles.row}>
                    <dt>{i18n.t('Lot')}</dt>
                    <dd>{fmt(config.lot)}</dd>
                </div>
                <div className={styles.row}>
                    <dt>{i18n.t('Zone')}</dt>
                    <dd>{fmt(config.zone)}</dd>
                </div>
            </dl>
            {config.alarmThresholds.length > 0 && (
                <div className={styles.thresholds}>
                    <h4 className={styles.subheading}>
                        {i18n.t('Alarm thresholds')}
                    </h4>
                    <ul className={styles.thresholdList}>
                        {config.alarmThresholds.map((t) => (
                            <li key={t.level} className={styles.thresholdItem}>
                                <Tag
                                    negative={t.type === 'hot'}
                                    positive={t.type === 'cold'}
                                >
                                    {t.type === 'hot'
                                        ? i18n.t('Hot · level {{level}}', {
                                              level: t.level,
                                          })
                                        : i18n.t('Cold · level {{level}}', {
                                              level: t.level,
                                          })}
                                </Tag>
                                <span>
                                    {t.temperatureLimit !== null
                                        ? `${t.temperatureLimit} °C`
                                        : '—'}
                                    {t.durationMinutes !== null
                                        ? ` · ≥ ${t.durationMinutes} min`
                                        : ''}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </Widget>
)
