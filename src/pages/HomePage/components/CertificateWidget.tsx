import i18n from '@dhis2/d2-i18n'
import {
    Button,
    IconCheckmark16,
    IconCopy16,
    IconLock16,
} from '@dhis2/ui'
import { useState } from 'react'
import styles from './CertificateWidget.module.css'
import { Widget } from '@/components/Widget/Widget'
import type { CertificateInfo, SignatureInfo } from '@/types/fridgeTag'

interface CertificateWidgetProps {
    certificate: CertificateInfo | null
    signatures: SignatureInfo | null
}

const fmt = (value: string | null | undefined): string =>
    value === null || value === undefined || value === '' ? '—' : value

interface FieldProps {
    label: string
    value: string | null
}

const Field = ({ label, value }: FieldProps) => (
    <div className={styles.row}>
        <dt>{label}</dt>
        <dd>{fmt(value)}</dd>
    </div>
)

const HexBlock = ({ label, value }: FieldProps) => {
    const [copied, setCopied] = useState(false)

    if (!value) {
        return (
            <div className={styles.hexRow}>
                <div className={styles.hexLabelRow}>
                    <span className={styles.hexLabel}>{label}</span>
                </div>
                <div className={styles.hexValue}>—</div>
            </div>
        )
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
        } catch {
            // clipboard may be unavailable (insecure context); silently ignore
        }
    }

    return (
        <div className={styles.hexRow}>
            <div className={styles.hexLabelRow}>
                <span className={styles.hexLabel}>{label}</span>
                <span className={styles.hexMeta}>
                    {i18n.t('{{count}} chars', { count: value.length })}
                </span>
                <Button
                    small
                    secondary
                    onClick={handleCopy}
                    icon={
                        copied ? <IconCheckmark16 /> : <IconCopy16 />
                    }
                >
                    {copied ? i18n.t('Copied') : i18n.t('Copy')}
                </Button>
            </div>
            <code className={styles.hexValue}>{value}</code>
        </div>
    )
}

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
                    <section className={styles.section}>
                        <header className={styles.sectionHeader}>
                            <IconLock16 />
                            <h4 className={styles.subheading}>
                                {i18n.t('Certificate')}
                            </h4>
                        </header>
                        <dl className={styles.grid}>
                            <Field
                                label={i18n.t('Issuer')}
                                value={certificate.issuer}
                            />
                            <Field
                                label={i18n.t('Owner')}
                                value={certificate.owner}
                            />
                            <Field
                                label={i18n.t('Valid from')}
                                value={certificate.validFrom}
                            />
                            <Field
                                label={i18n.t('Version')}
                                value={certificate.version}
                            />
                            <Field
                                label={i18n.t('Lot')}
                                value={certificate.lot}
                            />
                        </dl>
                        <HexBlock
                            label={i18n.t('Public key')}
                            value={certificate.publicKey}
                        />
                    </section>
                )}
                {signatures && (
                    <section className={styles.section}>
                        <header className={styles.sectionHeader}>
                            <h4 className={styles.subheading}>
                                {i18n.t('Signatures')}
                            </h4>
                        </header>
                        <HexBlock
                            label={i18n.t('Certificate signature')}
                            value={signatures.certificate}
                        />
                        <HexBlock
                            label={i18n.t('Data signature')}
                            value={signatures.data}
                        />
                    </section>
                )}
            </div>
        </Widget>
    )
}
