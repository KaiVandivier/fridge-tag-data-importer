export type AlarmType = 'cold' | 'hot'

export interface AlarmThreshold {
    level: number
    type: AlarmType
    temperatureLimit: number | null
    durationMinutes: number | null
}

export interface AlarmEvent {
    level: number
    type: AlarmType
    accumulatedMinutes: number | null
    triggerTime: string | null
    eventCount: number | null
}

export interface DailyTemperature {
    min: number | null
    minTime: string | null
    max: number | null
    maxTime: string | null
    avg: number | null
}

export interface Verification {
    am: string | null
    pm: string | null
}

export interface DailyRecord {
    day: number
    date: string | null
    temperature: DailyTemperature
    alarms: AlarmEvent[]
    sensorTimeoutMinutes: number | null
    events: number | null
    verified: Verification | null
}

export interface DeviceInfo {
    name: string | null
    version: string | null
    firmwareVersion: string | null
    sensorCount: number | null
}

export interface ConfigInfo {
    serial: string | null
    pcb: string | null
    cid: string | null
    lot: string | null
    zone: string | null
    alarmThresholds: AlarmThreshold[]
}

export interface HistoryInfo {
    activationTimestamp: string | null
    reportCreationTimestamp: string | null
    recordCount: number
    records: DailyRecord[]
}

export interface CertificateInfo {
    version: string | null
    lot: string | null
    issuer: string | null
    validFrom: string | null
    owner: string | null
    publicKey: string | null
}

export interface SignatureInfo {
    certificate: string | null
    data: string | null
}

export interface FridgeTagReport {
    device: DeviceInfo
    config: ConfigInfo
    history: HistoryInfo
    certificate: CertificateInfo | null
    signatures: SignatureInfo | null
}
