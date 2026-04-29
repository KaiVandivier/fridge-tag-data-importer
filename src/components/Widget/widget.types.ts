import type { ReactNode } from 'react'

type WidgetCollapsibleProps = {
    noncollapsible?: false
    header?: ReactNode
    children: ReactNode
    open: boolean
    onOpen: () => void
    onClose: () => void
    color?: string
    borderless?: boolean
}

type WidgetNonCollapsibleProps = {
    noncollapsible: true
    header?: ReactNode
    children: ReactNode
    color?: string
    borderless?: boolean
}

export type WidgetProps = WidgetCollapsibleProps | WidgetNonCollapsibleProps
