const z = require('zod')

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'Movie title must be a string',
        required_error: 'Movie title is required.'
    }),
    year: z.number().int().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(5),
    poster: z.string().url({
        message: 'Poster must be a valid URL'
    }),
    genre: z.array(
        z.enum(['Action', 'Crime', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
        {
            required_error: 'Movie genre is required.',
            invalid_type_error: 'Movie genre must be an array of enum Genre'
        }
    )
})

function validateMovie(input) {
    //return movieSchema.parse(input)//.parse Valida los datos contra un squema definido,si el objeto cumple con todas las reglas del esquema devuelve un objeto validado sino el metodo '.parse' lanza una excepsion que contiene los detalles de que regla del esquema incumplio,es muy util para validar formularios,entradas a API y puntos de entradas de datos
    return movieSchema.safeParse(input)//safeParse devuelve un objeto con la siguiente estructura : success(un  booleano que indica si la validacion fue exitosa,data(son los datos validados, solo si succes es true), y error que es un objeto de error que contiene los detalles de la validacion fallida(solo si succes es false))
}

function validatePartialMovie (input) {
    return movieSchema.partial().safeParse(input)
}

module.exports = { validateMovie, validatePartialMovie }