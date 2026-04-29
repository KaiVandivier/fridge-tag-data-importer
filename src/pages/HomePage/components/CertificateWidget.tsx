import i18n from '@dhis2/d2-i18n'
import { useState } from 'react'
import styles from './CertificateWidget.module.css'
import { Widget } from '@/components/Widget/Widget'
import type { CertificateInfo, SignatureInfo } from '@/types/fridgeTag'

interface CertificateWidgetProps {
    certificate: CertificateInfo | null
    signatures: SignatureInfo | null
}

const fmt = (value: string | null): string =>
    value === null || value === undefined || value === '' ? '—' : value

export const CertificateWidget = ({
    certificate,
    signatures,
}: CertificateWidgetProps) => {
    const [open, setOpen] = useState(false)

    if (!certificate && !signatures) {
        return null
    }

    return (
        <Widget
            header={i18n.t('Certificate & signatures')}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
        >
            <div className={styles.body}>
                {certificate && (
                    <dl className={styles.grid}>
                        <div className={styles.row}>
                            <dt>{i18n.t('Issuer')}</dt>
                            <dd>{fmt(certificate.issuer)}</dd>
                        </div>
                        <div className={styles.row}>
                            <dt>{i18n.t('Owner')}</dt>
                            <dd>{fmt(certificate.owner)}</dd>
                        </div>
                        <div className={styles.row}>
                            <dt>{i18n.t('Valid from')}</dt>
                            <dd>{fmt(certificate.validFrom)}</dd>
                        </div>
                        <div className={styles.row}>
                            <dt>{i18n.t('Version')}</dt>
                            <dd>{fmt(certificate.version)}</dd>
                        </div>
                        <div className={styles.row}>
                            <dt>{i18n.t('Lot')}</dt>
                            <dd>{fmt(certificate.lot)}</dd>
                        </div>
                        <div className={styles.row}>
                            <dt>{i18n.t('Public key')}</dt>
                            <dd className={styles.mono}>
                                {fmt(certificate.publicKey)}
                            </dd>
                        </div>
                    </dl>
                )}
                {signatures && (
                    <div className={styles.signatures}>
                        <h4 className={styles.subheading}>
                            {i18n.t('Signatures')}
                        </h4>
                        <dl className={styles.grid}>
                            <div className={styles.row}>
                                <dt>{i18n.t('Certificate')}</dt>
                                <dd className={styles.mono}>
                                    {fmt(signatures.certificate)}
                                </dd>
                            </div>
                            <div className={styles.row}>
                                <dt>{i18n.t('Data')}</dt>
                                <dd className={styles.mono}>
                                    {fmt(signatures.data)}
                                </dd>
                            </div>
                        </dl>
                    </div>
                )}
            </div>
        </Widget>
    )
}
