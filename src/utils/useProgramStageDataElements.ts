import { useApiDataQuery } from '@/utils/useApiDataQuery'

export type ProgramStageDataElement = {
    id: string
    displayName: string
}

type ProgramStageDataElementsResponse = {
    programStageDataElements: Array<{
        dataElement: ProgramStageDataElement
    }>
}

export const useProgramStageDataElements = (programStageId: string) => {
    const { data, isLoading, error } =
        useApiDataQuery<ProgramStageDataElementsResponse>({
            queryKey: ['programStages', programStageId, 'dataElements'],
            query: {
                resource: `programStages/${programStageId}`,
                params: {
                    fields: 'programStageDataElements[dataElement[id,displayName]]',
                },
            },
            cacheTime: Infinity,
            staleTime: Infinity,
            enabled: !!programStageId,
        })

    return {
        dataElements: data?.programStageDataElements.map(
            (psde) => psde.dataElement
        ),
        isLoading,
        error,
    }
}
