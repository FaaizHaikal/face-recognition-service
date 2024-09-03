const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const Customer = require('../models/Customer')

const DB_PORT = process.env.DB_PORT || 27017
const DB_NAME = process.env.DB_NAME || 'raisa'

const SERVER_PORT = process.env.SERVER_PORT || 5000

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(`mongodb://localhost:${DB_PORT}/${DB_NAME}`)

app.get('/api/find-customer', async (req, res) => {
  try {
    const query = { nik: req.query.nik }
    const result = await Customer.find(query)
    if (result && result.length > 0) {
      res.status(200)
      res.json(result)
    } else {
      res.status(404)
      res.json({ message: 'Customer not found!' })
    }
  } catch (error) {
    res.status(500)
    res.json({ message: 'Internal server error!' })
  }
})

app.post('/api/add-customer', async (req, res) => {
  try {
    const { nik, nama, nomorAntrian } = req.body
    const newCustomer = new Customer({ nik, nama, nomorAntrian })
    newCustomer.save()
      .then(() => res.json({ status: 'success' }))
      .catch((error) => console.error("Error adding customer!", error))
  } catch (error) {
    console.error(error)
  }
})


app.listen(5000, () => {
  try {

    console.log(`Server is running on port ${SERVER_PORT}`)
  } catch (error) {
    console.error(error)
  }
})
