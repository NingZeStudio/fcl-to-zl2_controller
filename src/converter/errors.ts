export enum ConversionErrorCode {
  INVALID_JSON = 'INVALID_JSON',
  MISSING_FIELD = 'MISSING_FIELD',
  INVALID_KEYCODE = 'INVALID_KEYCODE',
  COLOR_CONVERSION_FAILED = 'COLOR_CONVERSION_FAILED',
  COORD_OUT_OF_RANGE = 'COORD_OUT_OF_RANGE',
  SIZE_TOO_SMALL = 'SIZE_TOO_SMALL',
  UNSUPPORTED_FEATURE = 'UNSUPPORTED_FEATURE',
  UNKNOWN_FORMAT = 'UNKNOWN_FORMAT',
}

export class ConversionError extends Error {
  constructor(
    message: string,
    public readonly code: ConversionErrorCode,
    public readonly context?: unknown
  ) {
    super(message)
    this.name = 'ConversionError'
  }

  static missingField(fieldName: string, parentPath?: string): ConversionError {
    const path = parentPath ? `${parentPath}.${fieldName}` : fieldName
    return new ConversionError(
      `Missing required field: ${path}`,
      ConversionErrorCode.MISSING_FIELD,
      { fieldName, parentPath }
    )
  }

  static invalidKeycode(keycode: number, context?: string): ConversionError {
    return new ConversionError(
      `Unknown FCL keycode: ${keycode}${context ? ` (${context})` : ''}`,
      ConversionErrorCode.INVALID_KEYCODE,
      { keycode, context }
    )
  }

  static colorConversionFailed(color: number, reason: string): ConversionError {
    return new ConversionError(
      `Failed to convert color value ${color}: ${reason}`,
      ConversionErrorCode.COLOR_CONVERSION_FAILED,
      { color, reason }
    )
  }

  static coordOutOfRange(coord: { x: number; y: number }, axis: string, value: number): ConversionError {
    return new ConversionError(
      `Coordinate ${axis}=${value} out of range [0, 10000]`,
      ConversionErrorCode.COORD_OUT_OF_RANGE,
      { coord, axis, value }
    )
  }

  static unknownFormat(detectedFields: string[]): ConversionError {
    return new ConversionError(
      `Unknown format detected. Found fields: ${detectedFields.join(', ')}. Supported formats: FCL (viewGroups), ZL2 (layers)`,
      ConversionErrorCode.UNKNOWN_FORMAT,
      { detectedFields }
    )
  }
}
