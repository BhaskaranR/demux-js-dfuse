import dotenv from "dotenv"
import { BaseActionWatcher } from "demux"
import { DfuseActionReader } from "../src"

import * as dbConfig from './config/dbConfig.json.js'
import { handlerVersion } from "./handlerVersions/v1";
import { ObjectActionHandler } from "./ObjectActionHandler";
import massive = require("massive");


dotenv.config()

if (process.env.DFUSE_API_KEY == null) {
  console.log(
    "Missing DFUSE_API_KEY environment variable. Visit https://www.dfuse.io to create your API key."
  )
  process.exit(1)
}

const init = async () => {
  const massiveInstance = await massive(dbConfig as massive.ConnectionInfo);


  const actionHandler = new ObjectActionHandler([handlerVersion], massiveInstance, {
    validateBlocks: false,
    dbSchema: dbConfig.schema
  });

  const dfuseActionReader = new DfuseActionReader({
    startAtBlock: 1,
    onlyIrreversible: true,
    dfuseApiKey: process.env.DFUSE_API_KEY as string,
    query: "account:kmealowner11",
    network: "kylin"
  })

  const actionWatcher = new BaseActionWatcher(dfuseActionReader, actionHandler, {
    logLevel: "error"
  })

  actionWatcher.watch(false)
};

init().then(() => {
  console.log("started")
}).catch(err => console.error(err));

