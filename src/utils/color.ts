/**
 * FCL 颜色转换工具
 * FCL 使用 32 位有符号整数 (ARGB)
 */

/**
 * 将 FCL 整数颜色转换为 Hex (如 #AARRGGBB)
 */
export function fclToHex(fclColor: number): string {
  // 使用无符号右移处理负数，并转为 16 进制字符串
  const hex = (fclColor >>> 0).toString(16).padStart(8, '0')
  return `#${hex}`
}

/**
 * 将 Hex 颜色 (#AARRGGBB 或 #RRGGBB) 转换为 FCL 整数
 */
export function hexToFcl(hex: string): number {
  let cleanHex = hex.replace('#', '')
  
  // 如果是 #RRGGBB 格式，补齐 alpha 通道为 FF
  if (cleanHex.length === 6) {
    cleanHex = 'ff' + cleanHex
  }
  
  // 使用 BigInt 处理 32 位溢出问题，然后转回有符号整数
  const val = BigInt('0x' + cleanHex)
  return Number(BigInt.asIntN(32, val))
}

/**
 * 将 FCL 整数颜色转换为 RGBA 字符串用于 CSS
 */
export function fclToRgba(fclColor: number): string {
  const a = (fclColor >>> 24) & 0xFF
  const r = (fclColor >>> 16) & 0xFF
  const g = (fclColor >>> 8) & 0xFF
  const b = fclColor & 0xFF
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`
}
