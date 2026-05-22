import i18n from '@dhis2/d2-i18n'
import styles from './MappingPage.module.css'

export const MappingPage = () => (
    <div className={styles.page}>
        <header className={styles.header}>
            <h1 className={styles.title}>{i18n.t('Mapping')}</h1>
            <p className={styles.subtitle}>
                {i18n.t('Map fridge tag values to configured metadata')}
            </p>
        </header>
    </div>
)
