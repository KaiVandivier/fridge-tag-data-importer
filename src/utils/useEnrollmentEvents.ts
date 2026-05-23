import { useApiDataQuery } from '@/utils/useApiDataQuery'

export type EnrollmentEvent = {
    event: string
    occurredAt: string
    status?: string
}

type EnrollmentEventsResponse = {
    events: EnrollmentEvent[]
}

type UseEnrollmentEventsArgs = {
    enrollmentId: string | undefined
    programStageId: string
    orgUnitId: string | undefined
}

export const enrollmentEventsQueryKey = (
    enrollmentId: string,
    programStageId: string
) => ['tracker', 'events', 'enrollment', enrollmentId, programStageId] as const

export const useEnrollmentEvents = ({
    enrollmentId,
    programStageId,
    orgUnitId,
}: UseEnrollmentEventsArgs) => {
    const enabled = !!enrollmentId && !!programStageId && !!orgUnitId

    const { data, isLoading, error } =
        useApiDataQuery<EnrollmentEventsResponse>({
            queryKey: enabled
                ? enrollmentEventsQueryKey(enrollmentId, programStageId)
                : ['tracker', 'events', 'enrollment', 'disabled'],
            query: {
                resource: 'tracker/events',
                params: {
                    enrollment: enrollmentId ?? '',
                    programStage: programStageId,
                    orgUnit: orgUnitId ?? '',
                    orgUnitMode: 'SELECTED',
                    fields: 'event,occurredAt,status',
                    pageSize: 1000,
                },
            },
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
            enabled,
        })

    return {
        events: data?.events ?? [],
        isLoading: enabled && isLoading,
        error,
    }
}
