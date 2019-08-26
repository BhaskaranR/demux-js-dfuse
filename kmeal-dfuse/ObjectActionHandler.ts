import { AbstractActionHandler, HandlerVersion, NextBlock, IndexState } from "demux";
import { Database } from 'massive';
import { MassiveActionHandlerOptions } from './interfaces';
/* ObjectActionHandler
 * This is an example of an AbstractActionHandler implementation.
 *
 * The role of the Action Handler is to receive block data passed from the Action Reader, and populate some external
 * state deterministically derived from that data, as well as trigger side-effects.
 *
 * The AbstractActionHandler has the following abstract methods:
 *
 * handleWithState(handle)
 *   Call the passed-in `handle` function with the object you would like to pass in as `state` to Updaters and Effects.
 *   In this example, we're just using a simple structured Javascript object, but in a real implementation this will
 *   most likely an interface to a database. See the API documentation for more details.
 *
 * updateIndexState(state, block)
 *   Besides some caching optimizations, the state of the progress of indexing is stored outside of Demux itself, and
 *   this method is implemented to store that data. The data needed to be stored is blockNumber, blockHash, isReplay,
 *   and handlerVersionName. the `state` object passed into the `handle` function of the above `handleWithState` is
 *   provided here as a convenience.
 *
 * loadIndexState()
 *   This returns an `IndexState` object containing all the information saved in the above method.
 *
 * rollbackTo(blockNumber)
 *   If indexing potentially reversible blocks, a mechanism for reverting back to a specific block is necessary.
 *   In this example, we keep a history of the entire state at every block, and load it when called.
 */


// Initial state
let state = {
  volumeBySymbol: {},
  totalTransfers: 0,
  indexState: {
    blockNumber: 0,
    blockHash: "",
    isReplay: false,
    handlerVersionName: "v1"
  }
}

const stateHistory = {}
const stateHistoryMaxLength = 300

export class ObjectActionHandler extends AbstractActionHandler {

  protected dbSchema: string
  constructor(
    protected handlerVersions: HandlerVersion[],
    protected massiveInstance: Database,
    options: MassiveActionHandlerOptions,
  ) {
    super(handlerVersions, options);
    this.dbSchema = options.dbSchema ? options.dbSchema : 'public'
  }

  protected async handleWithState(handle: (state: any, context?: any) => void): Promise<void> {
    await handle(state, this.schemaInstance);
    const { blockNumber } = state.indexState
    stateHistory[blockNumber] = JSON.parse(JSON.stringify(state))
    if (blockNumber > stateHistoryMaxLength && stateHistory[blockNumber - stateHistoryMaxLength]) {
      delete stateHistory[blockNumber - stateHistoryMaxLength]
    }
  }


  private handleBlockWithTransactionId(handle: (state: any, context?: any) => void): Promise<void> {
    return this.massiveInstance.withTransaction(async (tx: any) => {
      let db
      if (this.dbSchema === 'public') {
        db = tx
      } else {
        db = tx[this.dbSchema]
      }
      // this.warnOverwrite(db, 'migrate')
      // db.migrate = async (sequenceName: string) => await this.migrate(sequenceName, tx.instance)
      // this.warnOverwrite(db, 'txid')
      db.txid = (await tx.instance.one('select txid_current()')).txid_current;
      try {
        await handle(db);
      } catch (err) {
        this.log.debug('Error thrown in updater, triggering rollback')
        throw err
      }
    }, {
        mode: new this.massiveInstance.pgp.txMode.TransactionMode({
          tiLevel: this.massiveInstance.pgp.txMode.isolationLevel.serializable,
        }),
      })
  }

  protected get schemaInstance(): any {
    if (this.dbSchema === 'public') {
      return this.massiveInstance
    } else {
      return this.massiveInstance[this.dbSchema]
    }
  }

  public async loadIndexState() {
    return state.indexState as any
  }

  public async updateIndexState(stateObj, block, isReplay, handlerVersionName) {
    const { blockNumber, blockHash } = block.block.blockInfo
    stateObj.indexState.blockNumber = blockNumber
    stateObj.indexState.blockHash = blockHash
    stateObj.indexState.isReplay = isReplay
    stateObj.indexState.handlerVersionName = handlerVersionName
  }

  // protected async updateIndexState(
  //   // tslint:disable-next-line: no-shadowed-variable
  //   state: any,
  //   nextBlock: NextBlock,
  //   isReplay: boolean,
  //   handlerVersionName: string,
  // ): Promise<void> {
  //   const { block: { blockInfo } } = nextBlock
  //   const fromDb = (await state._index_state.findOne({ id: 1 })) || {}
  //   const toSave = {
  //     ...fromDb,
  //     block_number: blockInfo.blockNumber,
  //     block_hash: blockInfo.blockHash,
  //     last_irreversible_block_number: nextBlock.lastIrreversibleBlockNumber,
  //     is_replay: isReplay,
  //     handler_version_name: handlerVersionName,
  //   }
  //   await state._index_state.save(toSave)

  //   await state._block_number_txid.insert({
  //     block_number: blockInfo.blockNumber,
  //     txid: state.txid,
  //   })
  // }

  // protected async loadIndexState(): Promise<IndexState> {
  //   const defaultIndexState = {
  //     block_number: 0,
  //     last_irreversible_block_number: 0,
  //     block_hash: '',
  //     handler_version_name: 'v1',
  //     is_replay: false,
  //   }
  //   const indexState = await this.schemaInstance._index_state.findOne({ id: 1 }) || defaultIndexState
  //   return {
  //     blockNumber: indexState.block_number,
  //     lastIrreversibleBlockNumber: indexState.last_irreversible_block_number,
  //     blockHash: indexState.block_hash,
  //     handlerVersionName: indexState.handler_version_name,
  //     isReplay: indexState.is_replay,
  //   }
  // }

  public async rollbackTo(blockNumber) {
    const latestBlockNumber = state.indexState.blockNumber

    if (blockNumber >= latestBlockNumber) {
      return
    }

    const toDelete = [...Array(latestBlockNumber - blockNumber).keys()].map(
      (n) => n + blockNumber + 1
    )
    for (const n of toDelete) {
      delete stateHistory[n]
    }
    state = stateHistory[blockNumber]
  }

  public async setup() { }
}

