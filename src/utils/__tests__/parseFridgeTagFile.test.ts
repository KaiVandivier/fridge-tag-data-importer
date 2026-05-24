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

describe('parseFridgeTagText - certificate and signatures', () => {
    const report = parseFridgeTagText(sample)

    it('parses the certificate block', () => {
        expect(report.certificate).toEqual({
            version: '1.0',
            lot: '1792_20_08',
            issuer: 'Berlinger & Co. AG',
            validFrom: '2020-08-21 07:39',
            owner: 'Berlinger & Co. AG',
            publicKey:
                'd73cd26b379bd0a250d98498e15c739ab53594e9768b247a0713637cba30e474b4fcc1aae45f30ec7cc878c102cf9648d775670d2f93b48726a0f21d3ca71074',
        })
    })

    it('keeps the full Sig Cert and Sig hex strings (no truncation)', () => {
        expect(report.signatures).toEqual({
            certificate:
                '6eef7b154b51a1f4a4186e76b495d43dc25cedbaab8b18486895df5d773530795679b8aa3678e511e45e28cb894bcc051dd90d13f19f699c4f42b46c4ed5d621',
            data: '0b0e409b4fb7a9f0d11779a35ab0953e81d16dace7d9a462fd7fc6abe40069490fe10ca5acd700e8b5428589f7b2a4fee8b0d9a69742c0ec826a319516248ca4',
        })
    })

    it('does not coerce issuer/owner strings containing "." to NaN', () => {
        expect(typeof report.certificate?.issuer).toBe('string')
        expect(typeof report.certificate?.owner).toBe('string')
    })
})
