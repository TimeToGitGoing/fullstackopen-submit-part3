require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')

const password = process.argv[2]

// DO NOT SAVE YOUR PASSWORD TO GITHUB!! ok
const url = process.env.MONGODB_URI

const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(morgan('tiny'))
app.use(express.json())
app.use(express.static('dist'))

let persons = [
]

morgan.token('host', function(req, res) {
    return req.hostname
})

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
    const detailsReceived = new Date().toString()
    response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${detailsReceived}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })

    // if (Person) {
    //     response.json(person)
    // } else {
    //     response.status(404).end()
    // }
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            if (result) {
                response.status(204).end()
            } else {
                response.status(404).send({ error: 'person not found'})
            }
        })

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
   
    if (body.name === undefined) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if (body.number === undefined) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })

    console.log('person to save', person)

})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
