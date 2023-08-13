/* eslint-disable unicorn/prefer-spread */
import { ActionCreatorWithPayload, configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { routesSlice } from '../reducers/routes-slice'
import { watchFetchRoute } from '../sagas/route'
import { listenerMiddleware } from './listener-middleware'

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
  reducer: {
    routesReducer: routesSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(sagaMiddleware),
})

sagaMiddleware.run(watchFetchRoute)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionPayload<A extends ActionCreatorWithPayload<any, any>> =
  Parameters<A>[0]
