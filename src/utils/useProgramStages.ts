import { useApiDataQuery } from '@/utils/useApiDataQuery'

export type ProgramStage = {
    id: string
    displayName: string
}

type ProgramStagesResponse = {
    programStages: ProgramStage[]
}

export const useProgramStages = (programId: string) => {
    const { data, isLoading, error } = useApiDataQuery<ProgramStagesResponse>({
        queryKey: ['programs', programId, 'programStages'],
        query: {
            resource: `programs/${programId}`,
            params: {
                fields: 'programStages[id,displayName]',
            },
        },
        cacheTime: Infinity,
        staleTime: Infinity,
        enabled: !!programId,
    })

    return {
        programStages: data?.programStages,
        isLoading,
        error,
    }
}
