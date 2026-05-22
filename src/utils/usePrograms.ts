import { useApiDataQuery } from '@/utils/useApiDataQuery'

export type Program = {
    id: string
    displayName: string
}

type ProgramsResponse = {
    programs: Program[]
}

export const usePrograms = () => {
    const { data, isLoading, error } = useApiDataQuery<ProgramsResponse>({
        queryKey: ['programs'],
        query: {
            resource: 'programs',
            params: {
                fields: 'id,displayName',
                paging: false,
                order: 'displayName:asc',
            },
        },
        cacheTime: Infinity,
        staleTime: Infinity,
    })

    return {
        programs: data?.programs,
        isLoading,
        error,
    }
}
