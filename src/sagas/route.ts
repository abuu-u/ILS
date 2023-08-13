import { PayloadAction, createAction } from '@reduxjs/toolkit'
import { call, put, select, takeLatest } from 'redux-saga/effects'
import { ErrorResponse, OsrmError, SuccessResponse } from '../helpers/osrm'
import { Route, selectRouteByIndex } from '../reducers/routes-slice'
import { ActionPayload } from '../shared/store'

export const ROUTE_REQUESTED = createAction<{ activeRouteIndex: number }>(
  'ROUTE_REQUESTED',
)
export const ROUTE_REQUEST_FAILED = createAction<ErrorResponse>(
  'ROUTE_REQUEST_FAILED',
)
export const ROUTE_REQUEST_SUCCEEDED = createAction<SuccessResponse>(
  'ROUTE_REQUEST_SUCCEEDED',
)

const getRoute = async (route: Route) => {
  const response = await fetch(
    `http://router.project-osrm.org/route/v1/driving/${route
      .map(([lat, lng]) => `${lng},${lat}`)
      .join(';')}?overview=full`,
  )

  const data = await response.json()

  if (!response.ok) {
    throw new OsrmError(data as ErrorResponse)
  }

  return data as SuccessResponse
}

function* fetchRoute(
  action: PayloadAction<ActionPayload<typeof ROUTE_REQUESTED>>,
) {
  try {
    const route: Route = yield select(
      selectRouteByIndex(action.payload.activeRouteIndex),
    )
    const data: SuccessResponse = yield call(getRoute, route)

    yield put(ROUTE_REQUEST_SUCCEEDED(data))
  } catch (error) {
    yield OsrmError.match(error)
      ? put(ROUTE_REQUEST_FAILED(error.data))
      : put(
          ROUTE_REQUEST_FAILED({
            code: 'Unexpected error',
            message: String(error),
          }),
        )
  }
}

export function* watchFetchRoute() {
  yield takeLatest(ROUTE_REQUESTED, fetchRoute)
}
