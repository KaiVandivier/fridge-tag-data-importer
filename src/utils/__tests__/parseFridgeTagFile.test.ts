import fs from 'node:fs'
import path from 'node:path'
import { parseFridgeTagText } from '../parseFridgeTagFile'

const sample = fs.readFileSync(
    path.join(__dirname, 'fixtures', 'sample-fridge-tag.txt'),
    'utf8'
)

describe('parseFridgeTagText - top-section string fields', () => {
    const report = parseFridgeTagText(sample)

    it('keeps the device name as a string', () => {
        expect(report.device.name).toBe('Q-tag Fridge-tag 2')
    })

    it('keeps the firmware version as a string (not truncated to a number)', () => {
        // "4.0p1o" used to be coerced to 4 via parseFloat
        expect(report.device.firmwareVersion).toBe('4.0p1o')
    })

    it('keeps the PCB identifier as a string', () => {
        // "BG0245100251" used to become NaN via parseInt
        expect(report.config.pcb).toBe('BG0245100251')
    })

    it('keeps the lot identifier as a string', () => {
        // "1792_20_08" used to become 1792 via parseInt
        expect(report.config.lot).toBe('1792_20_08')
    })

    it('keeps the temperature unit as a string', () => {
        expect(report.config.tempUnit).toBe('C')
    })

    it('keeps the test timestamp as a full timestamp string', () => {
        // Multi-colon values used to get truncated by the comma-split logic
        expect(report.config.testTimestamp).toBe('2025-05-15 15:23')
    })
})

describe('parseFridgeTagText - sanity checks on the rest of the report', () => {
    const report = parseFridgeTagText(sample)

    it('parses the header version as a string', () => {
        expect(report.device.version).toBe('0.5')
    })

    it('parses the sensor count as a number', () => {
        expect(report.device.sensorCount).toBe(1)
    })

    it('parses all 60 daily history records', () => {
        expect(report.history.recordCount).toBe(60)
        expect(report.history.records).toHaveLength(60)
    })

    it('preserves the full HH:MM timestamps on daily records', () => {
        const day1 = report.history.records[0]
        expect(day1.date).toBe('2026-04-29')
        expect(day1.temperature.minTime).toBe('09:49')
        expect(day1.temperature.maxTime).toBe('15:49')
    })

    it('parses alarm thresholds', () => {
        expect(report.config.alarmThresholds).toEqual([
            {
                level: 0,
                type: 'cold',
                temperatureLimit: -0.5,
                durationMinutes: 60,
            },
            {
                level: 1,
                type: 'hot',
                temperatureLimit: 8,
                durationMinutes: 600,
            },
        ])
    })
})
