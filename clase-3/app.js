const express = require('express')//require --> commonJS
const crypto = require('node:crypto')
const cors = require('cors')

const movies = require('./movies.json')
const z = require('zod')//libreria que nos ayuda a hacer validaciones  para las request
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

//Las variables de entorno van siempre en mayusculas
const PORT = process.env.PORT ?? 1234// Es muy importante especificar que el puerto puede ser especificado mediante una variable de entorno ya que muchos hostings la utilizan para asignar el puerto que ellos quieren que utilicemos

const app = express()
app.use(express.json())//Este middleware agarra la data de la request y la parsea convirtiendola en u n objeto javascript ,y ese objeto lo asigna a el cuerpo de la solicitud(req.body)
app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://localhost:8080',
            'http://127.0.0.1:5500/clase-3/web/index.html',
            'http://localhost:1234',
            'https://movies.com',
            'https://midu.dev'
        ]

        if (ACCEPTED_ORIGINS.includes(origin)) {
            return callback(null, true)
        }

        if (!origin) {
            return callback(null, true)
        }
    }
}))
app.disable('x-powered-by')//deshabilitar header X-Powered-By: Express


app.get('/', (req, res) => {
    res.json(movies)
})



// Todos los recursos que sean MOVIES se identifica con /movies
//Esto es un end-point(ende-point es una path(url) en el que podemos recuperar un recurso(info))
app.get('/movies', (req, res) => {
    //res.header('Access-Control-Allow-Origin', '*')//Esto anade las cebecera a todos a cualquier origen que no sea el nuestro

    //const origin = req.header('origin')
    //if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    //    res.header('Access-Control-Allow-Origin', origin)
    //}


    const { genre } = req.query//req.query me permite acceder a los parametros de consulta,los cuales me permiten modificar el comportamiento de la respuesta del servidor segun los valores porporcionados
    if (genre) {
        const filteredMovies = movies.filter(
            movie => movie.genre.some(m => m.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})


//segmentos dinamicos en la url: paremtros de la request
app.get('/movies/:id', (req, res) => {// Esto me permite luego acceder a parametro(dinamico) que tiene la url
    const { id } = req.params//accedo mediante al parametro dinamico dentro de la request
    const movie = movies.find(movie => movie.id === id)
    if (movie) return res.json(movie)

    res.status(404).json({ message: 'Movie not found' })//JSON al ser un formato de texto ligero,se utiliza para intercambiar datos entre el cliento y el servidor ,en este caso cuando los datos llegan al cliente en un formato json,el cliento lo parsea si lo quiere utilizar, por ejemplo mostrar esos datos en pantalla
})


app.post('/movies', (req, res) => {

    const result = validateMovie(req.body)

    if (result.error) {
        return res.status(400)
            .json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data//Esto hace una copia superficial de el objeto data que nos devuelve safeParse(si el objeto success es true)
    }

    //Esto No seria REST, porque estamos guardando
    //el estado de la aplicacion en memoria
    movies.push(newMovie)

    res.status(201).json(newMovie)
})

//metodos normales: GET/HEAD/POST
//metodos complejos: PUT/PATCH/DELETE <--- Requieren una verificacion previa(OPTIONS)

// CORS PRE-Flight :estas son solicitudes previas,cuando el navegador hace una solicitud que requiere una verificacion previa(solicpitudes con metodos complejos), envia un solicitud OPTIONS al servidor la cual contiene info sobre la solicitud que se esta intentando realizar
//OPTIONS:es una solicitud previa que contiene info sobre la solicitud que se esta intentando realizar


app.delete('/movies/:id', (req, res) => {
    //const origin = req.header('origin')
    //if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', '*')
    //}

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not founded' })
    }

    movies.splice(movieIndex, 1)

    return res.json({ message: 'Movie deleted' })

})


app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)

    if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {//-1 es una indicacion especial que indica que el elemento no fue encontrado
        return res.status(404).json({ message: 'Movie not found' })
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})



app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
})



//El CORS es un mecanismo que te permite que un recurso sea restringido en una pagina web para evitar que un dominio pueda acceder a un recurso e intercambiar datos entre dominios
//Este problema se tiene que arreglar en la aprte del backend,anadiendo la cabecera que me permite acceder a los recursos de ese dominio,indicando tambien que dominio puede acceder y cual no