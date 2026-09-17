export interface MaskStringOptions {
  visibleStart?: number
  visibleEnd?: number
  maskChar?: string
}

export function maskString(
  value: string,
  { visibleStart = 2, visibleEnd = 2, maskChar = '*' }: MaskStringOptions = {},
): string {
  if (value.length <= visibleStart + visibleEnd) {
    return maskChar.repeat(value.length)
  }

  const start = value.slice(0, visibleStart)
  const end = value.slice(value.length - visibleEnd)
  const maskedLength = value.length - visibleStart - visibleEnd

  return `${start}${maskChar.repeat(maskedLength)}${end}`
}
