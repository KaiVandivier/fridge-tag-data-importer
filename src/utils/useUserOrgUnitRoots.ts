import { useApiDataQuery } from '@/utils/useApiDataQuery'

export type OrgUnit = {
    id: string
    displayName: string
    path: string
}

type MeOrgUnitsResponse = {
    organisationUnits: OrgUnit[]
}

/**
 * Fetches the current user's assigned organisation units, used as the roots for
 * an `OrganisationUnitTree`. Treated as metadata, so it is cached for the session.
 */
export const useUserOrgUnitRoots = () => {
    const { data, isLoading, error } = useApiDataQuery<MeOrgUnitsResponse>({
        queryKey: ['me', 'organisationUnits'],
        query: {
            resource: 'me',
            params: {
                fields: 'organisationUnits[id,displayName,path]',
            },
        },
        cacheTime: Infinity,
        staleTime: Infinity,
    })

    return {
        orgUnits: data?.organisationUnits,
        rootIds: data?.organisationUnits?.map((ou) => ou.id),
        isLoading,
        error,
    }
}
