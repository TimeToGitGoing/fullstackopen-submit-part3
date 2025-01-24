const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const namePerson = process.argv[3]
const numberPerson = process.argv[4]
console.log(password)
const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: namePerson,
  number: numberPerson,
})

if (person.name === undefined ) {
  console.log('phonebook:')
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
} else {
  person.save().then(result => {
    console.log(`added ${namePerson} number ${numberPerson} to phonebook`)
    console.log(result)
    mongoose.connection.close()
  })
}
