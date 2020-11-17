const ip = require('ip')
const fs = require('fs')
const path = require('path')

const capacitorConfig = {
  // ...
  server: {},
}

const isHotspotting = (
  // Samsung A5 + Macbook
  ip.address() === '192.168.0.222:8000' &&
  process.env.NODE_ENV !== 'production'
)

if (isHotspotting) {
  // support HMR on device
  capacitorConfig.server.url = 'http://192.168.0.222:8000'
}

const configPath = path.resolve(__dirname, 'capacitor.config.json')

fs.writeFileSync(configPath, JSON.stringify(capacitorConfig))