import cx from 'classnames'
import type { ReactNode } from 'react'
import styles from './IconButton.module.css'

type Props = {
    children: ReactNode
    className?: string
    dataTest?: string
    disabled?: boolean
    onClick: (
        event:
            | React.KeyboardEvent<HTMLButtonElement>
            | React.MouseEvent<HTMLButtonElement>
            | React.TouchEvent<HTMLButtonElement>
    ) => void
}

export const IconButton = ({
    children,
    className,
    dataTest,
    onClick,
    disabled,
    ...passOnProps
}: Props) => (
    <button
        {...passOnProps}
        onClick={onClick}
        disabled={disabled}
        data-test={dataTest}
        className={cx(styles.button, {
            disabled,
            ...(className ? { [className]: true } : {}),
        })}
        type="button"
        tabIndex={0}
    >
        {children}
    </button>
)
