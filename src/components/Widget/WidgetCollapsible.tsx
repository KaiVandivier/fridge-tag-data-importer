import { colors, IconChevronUp24 } from '@dhis2/ui'
import cx from 'classnames'
import { useEffect, useRef, useState } from 'react'
import { IconButton } from './IconButton'
import styles from './Widget.module.css'
import type { WidgetProps } from './widget.types'

type Props = Extract<WidgetProps, { noncollapsible?: false }>

export const WidgetCollapsible = ({
    header,
    open,
    onOpen,
    onClose,
    color = colors.white,
    borderless = false,
    children,
}: Props) => {
    const [childrenVisible, setChildrenVisibility] = useState(open)
    const [animationsReady, setAnimationsReadyStatus] = useState(false)
    const [postEffectOpen, setPostEffectOpenStatus] = useState(open)
    const hideChildrenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    )
    const initialRenderRef = useRef(true)

    useEffect(() => {
        if (initialRenderRef.current) {
            initialRenderRef.current = false
            return
        }

        if (!animationsReady) {
            setAnimationsReadyStatus(true)
        }

        setPostEffectOpenStatus(open)

        clearTimeout(
            hideChildrenTimeoutRef.current as ReturnType<typeof setTimeout>
        )
        if (open) {
            setChildrenVisibility(true)
        } else {
            hideChildrenTimeoutRef.current = setTimeout(() => {
                setChildrenVisibility(false)
            }, 200)
        }
    }, [open, animationsReady])

    return (
        <div style={{ backgroundColor: color, borderRadius: 3 }}>
            <div
                className={cx(styles.headerContainer, {
                    [styles.headerContainerChildrenVisible]: childrenVisible,
                    [styles.borderless]: borderless,
                })}
            >
                <div className={styles.headerCollapsible}>
                    {header}
                    <IconButton
                        dataTest="widget-open-close-toggle-button"
                        className={styles.toggleButton}
                        onClick={open ? onClose : onOpen}
                    >
                        <span
                            className={cx(styles.toggleIcon, {
                                [styles.toggleIconCloseInit]:
                                    !animationsReady && !postEffectOpen,
                                [styles.toggleIconOpen]:
                                    animationsReady && postEffectOpen,
                                [styles.toggleIconClose]:
                                    animationsReady && !postEffectOpen,
                            })}
                        >
                            <IconChevronUp24 />
                        </span>
                    </IconButton>
                </div>
            </div>
            {childrenVisible ? (
                <div
                    data-test="widget-contents"
                    className={cx(styles.children, {
                        [styles.childrenOpen]: animationsReady && open,
                        [styles.childrenClose]: animationsReady && !open,
                        [styles.borderless]: borderless,
                    })}
                >
                    {children}
                </div>
            ) : null}
        </div>
    )
}
