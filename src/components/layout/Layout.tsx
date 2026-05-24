import { Outlet, useMatches } from 'react-router-dom'
import { Sidebar } from '../sidebar/Sidebar'
import styles from './Layout.module.css'
import { useMappingConfig } from '@/utils/useMappingConfig'

export type RouteHandle = {
    fullWidth?: boolean
    /* whether to automatically collapse the sidebar when route is active */
    collapseSidebar?: boolean
}

export const Layout = () => {
    const collapseSidebar = useMatches().some(
        (match) => (match.handle as RouteHandle)?.collapseSidebar,
    )

    // Start fetching the mapping config at app load; pages reuse the cached result.
    useMappingConfig()

    return (
        <div className={styles.wrapper}>
            <Sidebar className={styles.sidebar} hideSidebar={collapseSidebar} />
            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    )
}
