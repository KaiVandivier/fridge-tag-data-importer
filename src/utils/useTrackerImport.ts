import { useDataEngine, FetchError } from '@dhis2/app-runtime'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TrackerEvent } from '@/utils/buildEventsPayload'
import { enrollmentEventsQueryKey } from '@/utils/useEnrollmentEvents'

export type TrackerErrorReport = {
    message: string
    errorCode?: string
    trackerType?: string
    uid?: string
}

export type TrackerWarningReport = {
    warningMessage?: string
    message?: string
    warningCode?: string
    trackerType?: string
    uid?: string
}

export type TrackerStats = {
    created: number
    updated: number
    deleted: number
    ignored: number
    total?: number
}

export type TrackerImportReport = {
    status: 'OK' | 'WARNING' | 'ERROR'
    message?: string | null
    stats?: TrackerStats
    validationReport?: {
        errorReports?: TrackerErrorReport[]
        warningReports?: TrackerWarningReport[]
    }
    bundleReport?: {
        typeReportMap?: Record<string, { stats?: TrackerStats }>
    }
}

type RunImportArgs = {
    events: TrackerEvent[]
    dryRun: boolean
}

type UseTrackerImportArgs = {
    enrollmentId: string | undefined
    programStageId: string
}

export const useTrackerImport = ({
    enrollmentId,
    programStageId,
}: UseTrackerImportArgs) => {
    const dataEngine = useDataEngine()
    const queryClient = useQueryClient()

    return useMutation<TrackerImportReport, Error, RunImportArgs>({
        mutationFn: async ({ events, dryRun }) => {
            try {
                const response = (await dataEngine.mutate({
                    resource: 'tracker',
                    type: 'create',
                    data: { events },
                    params: {
                        async: false,
                        importMode: dryRun ? 'VALIDATE' : 'COMMIT',
                        importStrategy: 'CREATE_AND_UPDATE',
                        atomicMode: 'ALL',
                        validationMode: 'FULL',
                        reportMode: 'ERRORS',
                    },
                })) as TrackerImportReport
                return response
            } catch (err) {
                // The tracker endpoint returns the import report in the body
                // of a 409 response. @dhis2/app-runtime surfaces that body as
                // FetchError.details — unwrap it so the UI can render the
                // report breakdown instead of a generic error message.
                if (
                    err instanceof FetchError &&
                    err.details &&
                    typeof err.details === 'object' &&
                    'validationReport' in err.details
                ) {
                    return err.details as TrackerImportReport
                }
                throw err
            }
        },
        onSuccess: (_data, variables) => {
            if (!variables.dryRun && enrollmentId) {
                queryClient.invalidateQueries({
                    queryKey: enrollmentEventsQueryKey(
                        enrollmentId,
                        programStageId
                    ),
                })
            }
        },
    })
}
