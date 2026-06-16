import type {
    AlarmEvent,
    AlarmThreshold,
    DailyRecord,
    FridgeTagReport,
} from '@/types/fridgeTag'
import type { EnrollmentEvent } from '@/utils/useFindTrackedEntity'
import type { MappingConfig } from '@/utils/useMappingConfig'

export type TrackerDataValue = {
    dataElement: string
    value: string
}

export type TrackerEvent = {
    event?: string
    program: string
    programStage: string
    enrollment: string
    trackedEntity: string
    orgUnit: string
    occurredAt: string
    status: 'COMPLETED'
    dataValues: TrackerDataValue[]
}

export type SkippedDay = {
    day: number
    reason: 'missing-date'
}

export type ImportPlan = {
    events: TrackerEvent[]
    creates: number
    updates: number
    skipped: SkippedDay[]
    dateRange: { from: string; to: string } | null
}

type BuildArgs = {
    report: FridgeTagReport
    mapping: MappingConfig
    enrollmentId: string
    trackedEntityId: string
    orgUnitId: string
    existingEvents: EnrollmentEvent[]
}

const toDateKey = (occurredAt: string): string => occurredAt.slice(0, 10)

const sumAlarmMinutes = (
    alarms: AlarmEvent[],
    type: AlarmEvent['type']
): number =>
    alarms
        .filter((a) => a.type === type)
        .reduce((sum, a) => sum + (a.accumulatedMinutes ?? 0), 0)

const lowestColdLimit = (thresholds: AlarmThreshold[]): number | null => {
    const limits = thresholds
        .filter((t) => t.type === 'cold' && t.temperatureLimit !== null)
        .map((t) => t.temperatureLimit as number)
    return limits.length ? Math.min(...limits) : null
}

const highestHotLimit = (thresholds: AlarmThreshold[]): number | null => {
    const limits = thresholds
        .filter((t) => t.type === 'hot' && t.temperatureLimit !== null)
        .map((t) => t.temperatureLimit as number)
    return limits.length ? Math.max(...limits) : null
}

const pushDataValue = (
    dataValues: TrackerDataValue[],
    dataElement: string,
    value: number | null
) => {
    if (!dataElement || value === null || value === undefined) {
        return
    }
    dataValues.push({ dataElement, value: String(value) })
}

const buildDataValues = (
    record: DailyRecord,
    thresholds: AlarmThreshold[],
    dataElementIds: MappingConfig['dataElementIds']
): TrackerDataValue[] => {
    const dataValues: TrackerDataValue[] = []

    pushDataValue(
        dataValues,
        dataElementIds.averageStorageTemperature,
        record.temperature.avg
    )
    pushDataValue(dataValues, dataElementIds.minTemp, record.temperature.min)
    pushDataValue(dataValues, dataElementIds.maxTemp, record.temperature.max)
    pushDataValue(
        dataValues,
        dataElementIds.totalLowAlarmTime,
        sumAlarmMinutes(record.alarms, 'cold')
    )
    pushDataValue(
        dataValues,
        dataElementIds.totalHighAlarmTime,
        sumAlarmMinutes(record.alarms, 'hot')
    )
    pushDataValue(dataValues, dataElementIds.events, record.events)
    pushDataValue(
        dataValues,
        dataElementIds.lowerAlarmLimit,
        lowestColdLimit(thresholds)
    )
    pushDataValue(
        dataValues,
        dataElementIds.upperAlarmLimit,
        highestHotLimit(thresholds)
    )

    return dataValues
}

export const buildImportPlan = ({
    report,
    mapping,
    enrollmentId,
    trackedEntityId,
    orgUnitId,
    existingEvents,
}: BuildArgs): ImportPlan => {
    const existingByDate = new Map<string, string>()
    for (const ev of existingEvents) {
        if (!ev.occurredAt) {
            continue
        }
        existingByDate.set(toDateKey(ev.occurredAt), ev.event)
    }

    const events: TrackerEvent[] = []
    const skipped: SkippedDay[] = []
    let creates = 0
    let updates = 0
    let earliest: string | null = null
    let latest: string | null = null

    for (const record of report.history.records) {
        if (!record.date) {
            skipped.push({ day: record.day, reason: 'missing-date' })
            continue
        }

        const dateKey = toDateKey(record.date)
        const existingUid = existingByDate.get(dateKey)

        const trackerEvent: TrackerEvent = {
            program: mapping.programId,
            programStage: mapping.programStageId,
            enrollment: enrollmentId,
            trackedEntity: trackedEntityId,
            orgUnit: orgUnitId,
            occurredAt: record.date,
            status: 'COMPLETED',
            dataValues: buildDataValues(
                record,
                report.config.alarmThresholds,
                mapping.dataElementIds
            ),
        }

        if (existingUid) {
            trackerEvent.event = existingUid
            updates += 1
        } else {
            creates += 1
        }

        events.push(trackerEvent)

        if (!earliest || record.date < earliest) {
            earliest = record.date
        }
        if (!latest || record.date > latest) {
            latest = record.date
        }
    }

    return {
        events,
        creates,
        updates,
        skipped,
        dateRange: earliest && latest ? { from: earliest, to: latest } : null,
    }
}
