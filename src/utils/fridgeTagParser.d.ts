import type { FridgeTagReport } from '@/types/fridgeTag'

// Opaque shape produced by the JS parser before normalization. Only `toJson`
// consumes it, so callers should not depend on its internal layout.
export interface RawFridgeTagData {
    readonly __raw: unique symbol
}

export class FridgeTagParser {
    parseText(text: string): RawFridgeTagData
}

export function toJson(data: RawFridgeTagData): FridgeTagReport

export const Key: Record<string, string>
