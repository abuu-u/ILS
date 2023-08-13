import { FetchError } from './response-error'

export const responseCode = {
  /** Request could be processed as expected. */
  Ok: 'Ok',
  /** URL string is invalid. */
  InvalidUrl: 'InvalidUrl',
  /** Service name is invalid. */
  InvalidService: 'InvalidService',
  /** Version is not found. */
  InvalidVersion: 'InvalidVersion',
  /** Options are invalid. */
  InvalidOptions: 'InvalidOptions',
  /** The query string is syntactically malformed. */
  InvalidQuery: 'InvalidQuery',
  /** The successfully parsed query parameters are invalid. */
  InvalidValue: 'InvalidValue',
  /** One of the supplied input coordinates could not snap to street segment. */
  NoSegment: 'NoSegment',
  /** The request size violates one of the service specific request size restrictions. */
  TooBig: 'TooBig',
}

export type ResponseCode = keyof typeof responseCode

export type ErrorResponse = {
  code: Omit<ResponseCode, 'Ok'>
  message: string
}

export interface SuccessResponse {
  code: Extract<ResponseCode, 'Ok'>
  routes: {
    distance: number
    duration: number
    geometry: string
    legs: {
      distance: number
      duration: number
      steps: []
      summary: string
      weight: number
    }[]
    weight: number
    weight_name: string
  }[]
  waypoints: {
    distance: number
    hint: string
    location: [number, number]
    name: string
  }[]
}

export class OsrmError extends FetchError<ErrorResponse> {
  constructor(data: ErrorResponse) {
    super(data)
  }

  static match(error: unknown): error is OsrmError {
    return error instanceof OsrmError
  }
}
