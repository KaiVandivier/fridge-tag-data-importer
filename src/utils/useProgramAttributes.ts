import { useApiDataQuery } from '@/utils/useApiDataQuery'

export type ProgramAttribute = {
    id: string
    displayName: string
}

type ProgramAttributesResponse = {
    programTrackedEntityAttributes: Array<{
        trackedEntityAttribute: ProgramAttribute
    }>
}

export const useProgramAttributes = (programId: string) => {
    const { data, isLoading, error } =
        useApiDataQuery<ProgramAttributesResponse>({
            queryKey: ['programs', programId, 'attributes'],
            query: {
                resource: `programs/${programId}`,
                params: {
                    fields: 'programTrackedEntityAttributes[trackedEntityAttribute[id,displayName]]',
                },
            },
            cacheTime: Infinity,
            staleTime: Infinity,
            enabled: !!programId,
        })

    return {
        attributes: data?.programTrackedEntityAttributes.map(
            (ptea) => ptea.trackedEntityAttribute
        ),
        isLoading,
        error,
    }
}
