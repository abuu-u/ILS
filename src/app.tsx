import { decode } from '@mapbox/polyline'
import { Layout, Menu, message } from 'antd'
import Title from 'antd/es/typography/Title'
import L, { Map } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import './app.css'
import { useAppDispatch, useAppSelector } from './helpers/redux-hooks'
import { selectRoutes } from './reducers/routes-slice'
import {
  ROUTE_REQUESTED,
  ROUTE_REQUEST_FAILED,
  ROUTE_REQUEST_SUCCEEDED,
} from './sagas/route'
import { addAppListener } from './shared/listener-middleware'

const { Header, Sider, Content } = Layout

function App() {
  const mapReference = useRef<Map>(null)
  const dispatch = useAppDispatch()
  const routes = useAppSelector(selectRoutes)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    const unsubscribeErrorListener = dispatch(
      addAppListener({
        actionCreator: ROUTE_REQUEST_FAILED,
        effect: (action) => {
          messageApi.error(`${action.payload.code}: ${action.payload.message}`)
        },
      }),
    )

    let polylines: ReturnType<typeof L.polyline>[] = []

    const unsubscribeRequestListener = dispatch(
      addAppListener({
        actionCreator: ROUTE_REQUESTED,
        effect: () => {
          if (!mapReference.current) return

          for (const it of polylines) it.removeFrom(mapReference.current)

          polylines = []
        },
      }),
    )

    const unsubscribeSuccessListener = dispatch(
      addAppListener({
        actionCreator: ROUTE_REQUEST_SUCCEEDED,
        effect: (action) => {
          const decodedGeometries = action.payload.routes.map((it) =>
            decode(it.geometry),
          )

          if (!mapReference.current) return

          polylines = decodedGeometries.map((it) => L.polyline(it))

          for (const it of polylines) it.addTo(mapReference.current)

          mapReference.current.fitBounds(decodedGeometries.flat())
        },
      }),
    )

    return () => {
      unsubscribeErrorListener()
      unsubscribeRequestListener()
      unsubscribeSuccessListener()
    }
  }, [dispatch, messageApi])

  return (
    <>
      {contextHolder}
      <Layout
        hasSider
        style={{
          height: '100vh',
        }}
      >
        <Sider trigger={undefined} collapsed={false} theme="dark">
          <Title
            level={3}
            style={{
              margin: '16px',
              color: 'white',
            }}
          >
            Routes
          </Title>

          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={[]}
            items={routes.map((_, index) => ({
              key: index.toString(),
              label: 'Route ' + (index + 1),
              onClick: () =>
                dispatch(ROUTE_REQUESTED({ activeRouteIndex: index })),
            }))}
          />
        </Sider>

        <Layout>
          <Header style={{ padding: 0 }}>
            <Title
              level={3}
              style={{
                margin: '16px',
                color: 'white',
              }}
            >
              Map
            </Title>
          </Header>

          <Content style={{ display: 'grid' }}>
            <MapContainer
              ref={mapReference}
              center={[51.505, -0.09]}
              zoom={13}
              style={{ height: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[51.505, -0.09]} />
            </MapContainer>
          </Content>
        </Layout>
      </Layout>
    </>
  )
}

export default App
