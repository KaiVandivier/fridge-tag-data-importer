import React from 'react'
import type { WidgetProps } from './widget.types'
import { WidgetCollapsible } from './WidgetCollapsible'
import { WidgetNonCollapsible } from './WidgetNonCollapsible'

export { type WidgetProps } from './widget.types'

export const Widget = ({
    noncollapsible = false,
    ...passOnProps
}: WidgetProps) => {
    if (!noncollapsible) {
        const collapsibleProps = passOnProps as React.ComponentProps<
            typeof WidgetCollapsible
        >
        return (
            <div>
                <WidgetCollapsible {...collapsibleProps} />
            </div>
        )
    }
    const nonCollapsibleProps = passOnProps as React.ComponentProps<
        typeof WidgetNonCollapsible
    >
    return (
        <div>
            <WidgetNonCollapsible {...nonCollapsibleProps} />
        </div>
    )
}
