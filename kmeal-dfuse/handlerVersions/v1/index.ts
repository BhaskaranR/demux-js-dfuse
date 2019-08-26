import { Updater } from 'demux';

function parseTokenString(tokenString) {
  const [amountString, symbol] = tokenString.split(" ")
  const amount = parseFloat(amountString)
  return { amount, symbol }
}
// const getDbInstance = async () => {
//   return await massive(dbConfig);
// }

async function setuprest(state: any, payload: any, blockInfo: any, context: any) {
  // console.log(blockInfo);
  if (!(payload.dbOps && payload.dbOps.length >= 2)) {
    return;
  }

  const accountInfo = payload.dbOps[0].newJSON.object;
  const restaurantInfo = payload.dbOps[1].newJSON.object;

  const { owner, balance } = accountInfo;
  const amount = parseTokenString(balance).amount;
  const accountUser = await context.account.findOne({ owner });
  if (!accountUser) {
    await context.account.insert({
      owner,
      balance: amount
    })
  }
  const restaurant = await context.restaurant.findOne({ owner });
  if (restaurant) {
    await context.restaurant.update(
      { restaurant_id: restaurant.restaurant_id },
      {
        name: restaurantInfo.name,
        description: restaurantInfo.description,
        rating: restaurantInfo.rating,
        address: restaurantInfo.address,
        address2: restaurantInfo.address2,
        city: restaurantInfo.city,
        state: restaurantInfo.state,
        postalCode: restaurantInfo.postalCode,
        latitude: restaurantInfo.latitude,
        longitude: restaurantInfo.longitude,
        logo: restaurantInfo.logo,
        phone: restaurantInfo.phone,
        timeofoperation: restaurantInfo.timeofoperation,
        isactive: restaurantInfo.isactive ? restaurantInfo.isactive : true,
      })
    await context.restaurant_categories.destroy({ restaurant_id: restaurant.restaurant_id });
    await context.restaurant_categories.insert(restaurantInfo.categories.map(cat => {
      return {
        restaurant_id: restaurant.restaurant_id,
        category: cat
      }
    }));
    if (payload.dbOps.length === 3) {
      const sectionInfo = payload.dbOps[2].newJSON.object;
      await upsertSection(context, sectionInfo);
    }
  } else {
    const resp = await context.restaurant.insert({
      owner,
      name: restaurantInfo.name,
      description: restaurantInfo.description,
      rating: restaurantInfo.rating,
      address: restaurantInfo.address,
      address2: restaurantInfo.address2,
      city: restaurantInfo.city,
      state: restaurantInfo.state,
      postalcode: restaurantInfo.postalCode,
      latitude: restaurantInfo.latitude,
      longitude: restaurantInfo.longitude,
      logo: restaurantInfo.logo,
      phone: restaurantInfo.phone,
      timeofoperation: restaurantInfo.timeofoperation,
      isactive: true
    });
    await context.restaurant_categories.insert(restaurantInfo.categories.map(cat => {
      return {
        restaurant_id: resp.restaurant_id,
        category: cat
      }
    }));

    if (payload.dbOps.length === 3) {
      const sectionInfo = payload.dbOps[2].newJSON.object;
      await upsertSection(context, sectionInfo);
    }
  }

}

function cleartables(state: any, payload: any, blockInfo: any, context: any) {
  console.log("cleared");
}


async function addsections(state: any, payload: any, blockInfo: any, context: any) {
  if (!(payload.dbOps && payload.dbOps.length >= 0)) {
    return;
  }
  const sectionInfo = payload.dbOps[0].newJSON.object;
  await upsertSection(context, sectionInfo);
}

async function createitem(state: any, payload: any, blockInfo: any, context: any) {
  if (!(payload.dbOps && payload.dbOps.length >= 0)) {
    return;
  }
  const itemInfo = payload.dbOps[0].newJSON.object;
  await upsertItem(context, itemInfo);
}

async function listitem(state: any, payload: any, blockInfo: any, context: any) {
  if (!(payload.dbOps && payload.dbOps.length >= 0)) {
    return;
  }
  const listingInfo = payload.dbOps[0].newJSON.object;
  await upsertListing(context, listingInfo);
}

async function orderupdate(state: any, payload: any, blockInfo: any, context: any) {
  if (!(payload.dbOps && payload.dbOps.length >= 0)) {
    return;
  }
  const orderInfo = payload.dbOps[0].newJSON.object;
  await upsertOrder(context, blockInfo, orderInfo, payload);
}



async function deleteitem(state: any, payload: any, blockInfo: any, context: any) {
  if (!(payload.dbOps && payload.dbOps.length >= 0)) {
    return;
  }
  const itemInfo = payload.dbOps[0].newJSON.object;
  await context.item.destroy({ item_id: itemInfo.item_id });
}

async function upsertItem(context, itemInfo) {
  const item = await context.item.findOne({ item_id: itemInfo.item_id });
  const restaurant = await context.restaurant.findOne({ owner: itemInfo.owner });
  const val = {
    restaurant_id: restaurant.restaurant_id,
    item_id: itemInfo.item_id,
    item_name: itemInfo.item_name,
    description: itemInfo.description,
    photo: itemInfo.photo,
    spicy_level: itemInfo.spicy_level,
    vegetarian: itemInfo.vegetarian,
    cooking_time: itemInfo.cooking_time
  };
  if (restaurant && item) {
    await context.item.update(
      { item_id: item.item_id },
      val);
  } else if (restaurant && !item) {
    await context.item.insert(val);
  }
}


async function upsertListing(context, listingInfo) {
  const listing = await context.listing.findOne({ listing_id: listingInfo.item_id });
  const restaurant = await context.restaurant.findOne({ owner: listingInfo.owner });
  const val = {
    listing_id: listing.listing_id,
    restaurant_id: restaurant.restaurant_id,
    item_id: listingInfo.item_id,
    section_id: listingInfo.section_id,
    list_price: listingInfo.list_price,
    list_type: listingInfo.list_type,
    min_price: listingInfo.min_price,
    quantity: listingInfo.quantity,
    start_date: listingInfo.start_date,
    end_time: listingInfo.end_time,
    sliding_rate: listingInfo.sliding_rate,
    isactive: listingInfo.isactive,
    created_at: listingInfo.created_at,
    created_block: listingInfo.created_block
  };
  let resp;
  if (restaurant && listing) {
    resp = await context.listing.update(
      { listing_id: listing.listing_id },
      val);
  } else if (restaurant && !listing) {
    resp = await context.listing.insert(val);
  }

  //const listItemSides = await context.listing_item_sides.findOne({ listing_id: resp.listing_id });

  await context.listing_item_sides.destroy({ listing_id: resp.listing_id });
  await context.listing_item_sides.insert(listingInfo.sides.map(side => {
    return {
      listing_id: resp.listing_id,
      item_name: side.name,
      group: side.group,
      max_selection: side.max_selection,
      list_price: side.list_price
    }
  }));
}

async function upsertSection(context, sectionInfo) {
  const section = await context.menu_book_section.findOne({ section_id: sectionInfo.section_id });
  const restaurant = await context.restaurant.findOne({ owner: sectionInfo.owner });
  const val = {
    restaurant_id: restaurant.restaurant_id,
    section_id: sectionInfo.section_id,
    section_name: sectionInfo.section_name
  }
  if (restaurant && section) {
    await context.menu_book_section.update(
      { section_id: section.section_id },
      val);
  } else if (restaurant && !section) {
    await context.menu_book_section.insert(val);
  }
}


async function upsertOrder(context, blockInfo, orderInfo, payload) {
  const order = await context.order.findOne({ order_id: orderInfo.order_id });
  const restaurant = await context.restaurant.findOne({ owner: orderInfo.owner });
  const val = {
    order_id: orderInfo.order_id,
    restaurant_id: restaurant.restaurant_id,
    buyer: orderInfo.buyer,
    arbitrator: orderInfo.arbitrator,
    price: orderInfo.total_price,
    instruction: orderInfo.instruction,
    created_at: orderInfo.created_at,
    created_block: blockInfo.blockNumber,
    created_trx: blockInfo.timestamp,
    created_eosacc: payload.authorization[0].actor
  }
  if (!(restaurant && order)) {
    await context.order.insert(val);
    if (orderInfo.detail && orderInfo.detal.length > 0) {
      orderInfo.detail.forEach(det => {
        return {
          order_id: orderInfo.order_id,
          qty: orderInfo.qty,
          ordered_price: orderInfo.ordered_price,
        }
      })
    }
  }

}

const updaters: Updater[] = [
  {
    actionType: "kmealowner11::setuprest",
    apply: setuprest
  },
  {
    actionType: "kmealowner11::cleartables",
    apply: cleartables
  },
  {
    actionType: "kmealowner11::addsections",
    apply: addsections
  },
  {
    actionType: "kmealowner11::createitem",
    apply: createitem
  },
  {
    actionType: "kmealowner11::edititem",
    apply: createitem
  },
  {
    actionType: "kmealowner11::deleteitem",
    apply: deleteitem
  },
  {
    actionType: "kmealowner11::listitem",
    apply: listitem
  },
  {
    actionType: "kmealowner11::placeorder",
    apply: orderupdate
  }
]


function logUpdate(payload: any, blockInfo: any, context: any) {
  console.info("State updated:\n", JSON.stringify(context.stateCopy, null, 2))
}

const effects = [

  {
    actionType: "kmealowner11::setuprest",
    run: logUpdate
  },
  {
    actionType: "kmealowner11::cleartables",
    run: logUpdate
  },
  {
    actionType: "kmealowner11::addsections",
    run: logUpdate
  },
  {
    actionType: "kmealowner11::createitem",
    apply: logUpdate
  },
  {
    actionType: "kmealowner11::edititem",
    run: logUpdate
  },
  {
    actionType: "kmealowner11::deleteitem",
    run: logUpdate
  },
  {
    actionType: "kmealowner11::listitem",
    run: logUpdate
  },
  {
    actionType: "kmealowner11::placeorder",
    run: logUpdate
  }
]


export const handlerVersion = {
  versionName: "v1",
  updaters,
  effects,
}
