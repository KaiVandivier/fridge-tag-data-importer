import { useApiDataQuery } from '@/utils/useApiDataQuery'

export type ProgramAttribute = {
    id: string
    displayName: string
}

export type ProgramStageDataElement = {
    id: string
    displayName: string
}

export type ProgramStage = {
    id: string
    displayName: string
    dataElements: ProgramStageDataElement[]
}

export type Program = {
    attributes: ProgramAttribute[]
    programStages: ProgramStage[]
}

type ProgramResponse = {
    programTrackedEntityAttributes: Array<{
        trackedEntityAttribute: ProgramAttribute
    }>
    programStages: Array<{
        id: string
        displayName: string
        programStageDataElements: Array<{
            dataElement: ProgramStageDataElement
        }>
    }>
}

export const useProgram = (programId: string) => {
    const { data, isLoading, error } = useApiDataQuery<ProgramResponse>({
        queryKey: ['programs', programId, 'mappingMetadata'],
        query: {
            resource: `programs/${programId}`,
            params: {
                fields: 'programTrackedEntityAttributes[trackedEntityAttribute[id,displayName]],programStages[id,displayName,programStageDataElements[dataElement[id,displayName]]]',
            },
        },
        cacheTime: Infinity,
        staleTime: Infinity,
        enabled: !!programId,
    })

    const program: Program | undefined = data
        ? {
              attributes: data.programTrackedEntityAttributes.map(
                  (ptea) => ptea.trackedEntityAttribute
              ),
              programStages: data.programStages.map((stage) => ({
                  id: stage.id,
                  displayName: stage.displayName,
                  dataElements: stage.programStageDataElements.map(
                      (psde) => psde.dataElement
                  ),
              })),
          }
        : undefined

    return {
        program,
        isLoading,
        error,
    }
}
