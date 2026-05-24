import { FridgeTagParser, toJson } from './fridgeTagParser.js'
import type { FridgeTagReport } from '@/types/fridgeTag'

export const parseFridgeTagText = (text: string): FridgeTagReport => {
    const parser = new FridgeTagParser()
    const raw = parser.parseText(text)
    return toJson(raw)
}

export const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result ?? ''))
        reader.onerror = () =>
            reject(reader.error ?? new Error('Failed to read file'))
        reader.readAsText(file)
    })
