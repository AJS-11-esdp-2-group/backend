const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: "postgres://default:wQEPGf1Y6qhv@ep-little-hall-85431902-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require",
})

export default pool;