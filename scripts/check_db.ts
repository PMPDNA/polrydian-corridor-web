/* eslint-disable no-console */
import { Client } from 'pg'

;(async () => {
  try {
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
    await client.connect()
    const result = await client.query('select now() as ts;')
    await client.end()
    console.log('DB OK', result.rows[0].ts)
  } catch (e) {
    console.error('DB ERROR', e)
    process.exit(1)
  }
})()
