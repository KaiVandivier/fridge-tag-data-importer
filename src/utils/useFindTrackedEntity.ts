import { useApiDataQuery } from '@/utils/useApiDataQuery'

export type TrackedEntityAttributeValue = {
    attribute: string
    displayName?: string
    value: string
    valueType?: string
}

export type MatchedTrackedEntity = {
    trackedEntity: string
    trackedEntityType: string
    orgUnit: string
    createdAt?: string
    updatedAt?: string
    attributes: TrackedEntityAttributeValue[]
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
                    fields: 'trackedEntity,trackedEntityType,orgUnit,createdAt,updatedAt,attributes[attribute,displayName,value,valueType]',
                    pageSize: 1,
                },
            },
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
            enabled,
        })

    return {
        trackedEntity: data?.trackedEntities?.[0],
        isLoading: enabled && (isLoading || isFetching),
        error,
        enabled,
    }
}
