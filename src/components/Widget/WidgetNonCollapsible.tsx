import { colors } from '@dhis2/ui'
import cx from 'classnames'
import styles from './Widget.module.css'
import type { WidgetProps } from './widget.types'

type Props = Extract<WidgetProps, { noncollapsible: true }>

export const WidgetNonCollapsible = ({
    header,
    children,
    color = colors.white,
    borderless = false,
}: Props) => (
    <div
        className={cx(styles.container, { [styles.borderless]: borderless })}
        style={{ backgroundColor: color }}
    >
        <div className={styles.headerNonCollapsible} data-test="widget-header">
            {header}
        </div>
        <div data-test="widget-contents">{children}</div>
    </div>
)
