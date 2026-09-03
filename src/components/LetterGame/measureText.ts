const FONT = '16px system-ui, sans-serif'
const PADDING = 6

let ctx: CanvasRenderingContext2D | null = null

export function measureWordWidth(text: string): number {
    if (!ctx) ctx = document.createElement('canvas').getContext('2d')
    ctx!.font = FONT
    return Math.ceil(ctx!.measureText(text).width) + PADDING * 2
}

export const WORD_FONT = FONT
export const WORD_PADDING = PADDING