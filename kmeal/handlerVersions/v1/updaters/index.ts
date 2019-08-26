import { Updater, BlockInfo } from 'demux'

const setuprest: Updater = {
  apply: async (state: any, payload: any, blockInfo: BlockInfo, context: any) => {
    console.log(payload.data);
    // console.log(blockInfo);
    // console.log(payload.data);
    // const { user, movename, fullname, email } = payload.data
    // const { moveid } = payload.data

    // console.log("> REGISTER MOVE")
    // console.log("id:", moveid)
    // console.log("owner:", user)
    // console.log("move name:", movename)
    // console.log("full name:", fullname)
    // console.log("email:", email)
    // console.log()

    // await state.move.save({
    //   moveid,
    //   owner: user,
    //   movename,
    // })
    // await state.account.save({
    //   accname: user,
    //   fullname,
    //   email,
    // })
  },
  actionType: 'kmealowner11::setuprest',
}

// const list: Updater = {
//   apply: async (state: any, payload: any, blockInfo: BlockInfo, context: any) => {
//     const { buyprice } = payload.data
//     const { moveid } = payload.data

//     const move = await state.move.findOne({ moveid })

//     console.log("> LIST DANCE MOVE FOR SALE")
//     console.log("id:", moveid)
//     console.log("move name:", move.movename)
//     console.log("price:", buyprice)
//     console.log("current owner:", move.owner)
//     console.log()

//     await state.move.save({
//       id: move.id,
//       buyprice,
//       islisted: true,
//     })
//   },
//   actionType: 'kmealowner11::setuprest',
// }

// const buy: Updater = {
//   apply: async (state: any, payload: any, blockInfo: BlockInfo, context: any) => {
//     const { user } = payload.data

//     const { moveid } = payload.data

//     const move = await state.move.findOne({ moveid })
//     const sellerDbUser = await state.account.findOne({ accname: move.owner })
//     const buyerDbUser = await state.account.findOne({ accname: user })
//     const buyprice = move.buyprice

//     const buyerBalance = parseInt(buyerDbUser.mvp) - parseInt(buyprice)
//     const sellerBalance = parseInt(sellerDbUser.mvp) + parseInt(buyprice)

//     console.log("> DANCE MOVE SOLD")
//     console.log("id:", moveid)
//     console.log("move name:", move.movename)
//     console.log("purchase price:", `${buyprice} MVP`)
//     console.log("old owner:", sellerDbUser.fullname)
//     console.log("new owner:", buyerDbUser.fullname)

//     await state.account.save({
//       id: buyerDbUser.id,
//       mvp: buyerBalance,
//     })
//     await state.account.save({
//       id: sellerDbUser.id,
//       mvp: sellerBalance,
//     })

//     await state.move.save({
//       id: move.id,
//       buyprice: 0,
//       islisted: false,
//     })
//   },
//   actionType: 'mvpregister::buy',
// }

export const updaters = [
  setuprest,
  // list,
  // buy,
]
