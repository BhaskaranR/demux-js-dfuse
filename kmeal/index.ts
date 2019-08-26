import { BaseActionWatcher } from 'demux'
import massive from 'massive'
import { migrationSequences } from './migrationSequences'
import * as dbConfig from './config/dbConfig.json'
// import * as demuxConfig from './config/demuxConfig.json'
import { handlerVersions } from './handlerVersions'

import { DfuseActionReader } from "../src"
import dotenv from 'dotenv';
import { MassiveActionHandler } from 'demux-postgres';
dotenv.config()

if (process.env.DFUSE_API_KEY == null) {
  console.log(
    "Missing DFUSE_API_KEY environment variable. Visit https://www.dfuse.io to create your API key."
  )
  process.exit(1)
}

const init = async () => {

  const massiveInstance = await massive(dbConfig);

  const actionHandler = new MassiveActionHandler(
    handlerVersions,
    massiveInstance,
    migrationSequences,
    {
      validateBlocks: false,
      dbSchema: dbConfig.schema
    }
  );

  const dfuseActionReader = new DfuseActionReader({
    startAtBlock: 62163989,
    onlyIrreversible: true,
    dfuseApiKey: process.env.DFUSE_API_KEY as string,
    query: "account:kmealowner11",
    network: "kylin"
  })

  const actionWatcher = new BaseActionWatcher(dfuseActionReader, actionHandler, {
    logLevel: "trace"
  })

  actionWatcher.watch(true)
  // console.info(`Demux listening on port ${demuxConfig.endpointPort}...`)
}

init().then(() => {
  console.log("started")
}).catch(err => console.error(err));
