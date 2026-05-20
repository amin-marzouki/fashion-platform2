import WebSocket from 'ws'
import { env } from '../config/env'

let psSocket: WebSocket | null = null
let reconnectTimer: NodeJS.Timeout | null = null

function connect() {
  try {
    psSocket = new WebSocket(env.PS_BRIDGE_URL)

    psSocket.on('open', () => {
      console.log('✅ Connected to Pixel Streaming bridge')
      if (reconnectTimer) clearTimeout(reconnectTimer)
    })

    psSocket.on('close', () => {
      console.warn('⚠️  PS bridge disconnected. Reconnecting in 3s...')
      reconnectTimer = setTimeout(connect, 3000)
    })

    psSocket.on('error', (err) => {
      console.error('PS bridge error:', err.message)
      // Will trigger 'close' → reconnect
    })
  } catch (err) {
    console.warn('Could not connect to PS bridge, retrying in 5s...')
    setTimeout(connect, 5000)
  }
}

// Attempt initial connection (non-fatal if UE is not running)
connect()

export async function sendToUE(payload: {
  action: string
  metahuman_id: string
  skm_asset_key: string
}) {
  return new Promise<void>((resolve, reject) => {
    if (!psSocket || psSocket.readyState !== WebSocket.OPEN) {
      console.warn('PS bridge not connected — command dropped:', payload)
      return resolve() // non-fatal
    }
    psSocket.send(JSON.stringify(payload), (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}
