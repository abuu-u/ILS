import { createSlice } from '@reduxjs/toolkit'
import { ErrorResponse } from '../helpers/osrm'
import {
  ROUTE_REQUESTED,
  ROUTE_REQUEST_FAILED,
  ROUTE_REQUEST_SUCCEEDED,
} from '../sagas/route'
import type { RootState } from '../shared/store'

export type Route = [number, number][]

interface RoutesState {
  routes: Route[]
  activeRouteIndex: number
  isLoading: boolean
  error?: ErrorResponse
}

const initialState: RoutesState = {
  routes: [
    [
      [59.846_603_99, 30.294_963_92],
      [59.829_341_96, 30.424_237_01],
      [59.835_677_01, 30.380_642_06],
    ],

    [
      [59.829_341_96, 30.424_237_01],
      [59.827_612_95, 30.417_056_07],
      [59.846_603_99, 30.294_963_92],
    ],

    [
      [59.835_677_01, 30.380_642_06],
      [59.846_603_99, 30.294_963_92],
      [59.827_612_95, 30.417_056_07],
    ],
  ],
  activeRouteIndex: -1,
  isLoading: false,
}

export const routesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(ROUTE_REQUESTED, (state, action) => {
        state.isLoading = true
        state.error = undefined
        state.activeRouteIndex = action.payload.activeRouteIndex
      })

      .addCase(ROUTE_REQUEST_SUCCEEDED, (state) => {
        state.isLoading = false
      })

      .addCase(ROUTE_REQUEST_FAILED, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const selectRoutes = (state: RootState) => state.routesReducer.routes
export const selectRouteByIndex = (index: number) => (state: RootState) =>
  state.routesReducer.routes[index]
export const selectActiveRouteIndex = (state: RootState) =>
  state.routesReducer.activeRouteIndex
export const selectIsLoading = (state: RootState) =>
  state.routesReducer.isLoading
export const selectError = (state: RootState) => state.routesReducer.error
