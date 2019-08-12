/**
 * Exports the MigraitonSequence, instantiating Migrations of all SQL files in this directory into an array.
 *
 * This file is automatically updated via `demux generate migration [sequenceName] [migrationName]`.
 */

import { Migration, MigrationSequence } from 'demux-postgres'
import * as dbConfig from '../../config/dbConfig.json'

export const init: MigrationSequence = {
  sequenceName: 'init',
  migrations: [
    new Migration(
      '00020_categories',
      dbConfig.schema,
      `${__dirname}/00020_categories.sql`,
    ),
    new Migration(
      '00030_accounts',
      dbConfig.schema,
      `${__dirname}/00030_accounts.sql`,
    )
  ]
}
