const express = require('express')
const app = express()
require('dotenv').config()
const Person = require('./models/person')

app.use(express.static('dist'))

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name)
  {return response.status(400).send({ error: 'Invalid phone number' })}

  next(error)
}

const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(morgan('tiny'))
app.use(express.json())

// create a custom token to log the request body
morgan.token('body', (req) => JSON.stringify(req.body))

// use morgan middleware with custom token
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

morgan.token('param', function(req, res, param) {
  return req.params[param]
})

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.get('/info', (request, response) => {
  Person.countDocuments({})
    .then(count => {
      const detailsReceived = new Date().toString()
      response.send(`<p>Phonebook has info for ${count} people</p><p>${detailsReceived}</p>`)
    })
    .catch(error => {
      console.error('Error fetching person count', error.message)
      response.status(500).send({ error: 'Failed to fetch person count' })
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (body.number === undefined) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next (error))
})

// this has to be the last loaded middleware, also all the routes should be registered before this
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
