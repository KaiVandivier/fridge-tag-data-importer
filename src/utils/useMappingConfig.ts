import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const NAMESPACE = 'fridge-tag-app'
const KEY = 'mapping'

export type DataElementFieldKey =
    | 'averageStorageTemperature'
    | 'lowerAlarmLimit'
    | 'minTemp'
    | 'totalLowAlarmTime'
    | 'upperAlarmLimit'
    | 'maxTemp'
    | 'totalHighAlarmTime'
    | 'events'

export type MappingConfig = {
    programId: string
    attributeId: string
    programStageId: string
    dataElementIds: Record<DataElementFieldKey, string>
}

export const emptyMappingConfig: MappingConfig = {
    programId: '',
    attributeId: '',
    programStageId: '',
    dataElementIds: {
        averageStorageTemperature: '',
        lowerAlarmLimit: '',
        minTemp: '',
        totalLowAlarmTime: '',
        upperAlarmLimit: '',
        maxTemp: '',
        totalHighAlarmTime: '',
        events: '',
    },
}

export const mappingConfigQueryKey = ['dataStore', NAMESPACE, KEY] as const

export const isMappingConfigComplete = (config: MappingConfig): boolean =>
    !!config.programId &&
    !!config.attributeId &&
    !!config.programStageId &&
    Object.values(config.dataElementIds).every(Boolean)

const isNotFoundError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') {
        return false
    }
    const candidate = error as {
        details?: { httpStatusCode?: number }
        httpStatusCode?: number
    }
    return (
        candidate.details?.httpStatusCode === 404 ||
        candidate.httpStatusCode === 404
    )
}

export const useMappingConfig = () => {
    const dataEngine = useDataEngine()

    return useQuery<MappingConfig, Error>({
        queryKey: mappingConfigQueryKey,
        queryFn: async () => {
            try {
                const response = await dataEngine.query({
                    config: {
                        resource: `dataStore/${NAMESPACE}`,
                        id: KEY,
                    },
                })
                return response.config as MappingConfig
            } catch (error) {
                if (!isNotFoundError(error)) {
                    throw error
                }
                await dataEngine.mutate({
                    resource: `dataStore/${NAMESPACE}/${KEY}`,
                    type: 'create',
                    data: emptyMappingConfig,
                })
                return emptyMappingConfig
            }
        },
        cacheTime: Infinity,
        staleTime: Infinity,
    })
}

export const useSaveMappingConfig = () => {
    const dataEngine = useDataEngine()
    const queryClient = useQueryClient()

    const { show: showSuccessAlert } = useAlert(
        i18n.t('Mapping configuration saved'),
        { success: true }
    )
    const { show: showErrorAlert } = useAlert(
        ({ message }: { message: string }) => message,
        { critical: true }
    )

    return useMutation<unknown, Error, MappingConfig>(
        (config) =>
            dataEngine.mutate({
                resource: `dataStore/${NAMESPACE}`,
                id: KEY,
                type: 'update',
                data: config,
            }),
        {
            onSuccess: (_, config) => {
                queryClient.setQueryData(mappingConfigQueryKey, config)
                showSuccessAlert()
            },
            onError: (error) => {
                showErrorAlert({
                    message:
                        error.message ||
                        i18n.t('Failed to save mapping configuration'),
                })
            },
        }
    )
}
