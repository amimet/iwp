import React from 'react'
import ListedMenu from 'components/ListedMenu'
// import findUp from 'find-up'
import fs from 'fs'
import path from 'path'
import process from 'process'

// const debuggersFilePath = findUp.sync(['.debuggers', '.debuggers.js', '.debuggers.json'])
// const nodecoreConfigPath = findUp.sync(['.nodecore', '.nodecore.js', '.nodecore.json'])

let debuggers = {}
let debuggersList = {}

if (typeof(debuggersFilePath) !== "undefined") {
  try {
    const parsed = JSON.parse(fs.readFileSync(debuggersFilePath))
    const nodecoreConfig = JSON.parse(fs.readFileSync(nodecoreConfigPath))

    if (parsed && nodecoreConfig.src) {
      try {
        debuggersList = parsed
        parsed.forEach(e => {
          if (!e.component) {
            return false
          }
          debuggers[e.key] = require(path.resolve(`${process.cwd()}/${nodecoreConfig.src}/debuggers/${e.component}/index.js`))
        })
      } catch (error) {
        console.log(`Error importing ${e.key}`)
      }
    }else{
      console.log("invalid envs...")
    }
  } catch (error) {
    console.log(error)
  }
}

export default () => {
  return <ListedMenu wrapperStyle={{ padding: "4px" }} mode="horizontal" renderOptionTitle={false} icon="Activity" title="Debug" childrens={debuggers} menuArray={debuggersList} />
}