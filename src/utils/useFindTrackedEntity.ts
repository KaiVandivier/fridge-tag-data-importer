import { useApiDataQuery } from '@/utils/useApiDataQuery'

export type TrackedEntityAttributeValue = {
    attribute: string
    displayName?: string
    value: string
    valueType?: string
}

export type MatchedEnrollment = {
    enrollment: string
    program: string
    status?: string
    enrolledAt?: string
    orgUnit?: string
}

export type MatchedTrackedEntity = {
    trackedEntity: string
    trackedEntityType: string
    orgUnit: string
    createdAt?: string
    updatedAt?: string
    attributes: TrackedEntityAttributeValue[]
    enrollments?: MatchedEnrollment[]
}

type TrackedEntitySearchResponse = {
    trackedEntities: MatchedTrackedEntity[]
}

type UseFindTrackedEntityArgs = {
    programId: string
    attributeId: string
    value: string | null | undefined
}

export const useFindTrackedEntity = ({
    programId,
    attributeId,
    value,
}: UseFindTrackedEntityArgs) => {
    const trimmedValue = value?.trim() ?? ''
    const enabled = !!programId && !!attributeId && !!trimmedValue

    const { data, isLoading, isFetching, error } =
        useApiDataQuery<TrackedEntitySearchResponse>({
            queryKey: [
                'tracker',
                'trackedEntities',
                programId,
                attributeId,
                trimmedValue,
            ],
            query: {
                resource: 'tracker/trackedEntities',
                params: {
                    program: programId,
                    filter: `${attributeId}:eq:${trimmedValue}`,
                    orgUnitMode: 'ACCESSIBLE',
                    fields: 'trackedEntity,trackedEntityType,orgUnit,createdAt,updatedAt,attributes[attribute,displayName,value,valueType],enrollments[enrollment,program,status,enrolledAt,orgUnit]',
                    pageSize: 1,
                },
            },
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
            enabled,
        })

    const trackedEntity = data?.trackedEntities?.[0]
    const enrollment = trackedEntity?.enrollments?.find(
        (e) => e.program === programId
    )

    return {
        trackedEntity,
        enrollment,
        isLoading: enabled && (isLoading || isFetching),
        error,
        enabled,
    }
}
