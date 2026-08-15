import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\PhotoStreamController::photo
 * @see app/Http/Controllers/PhotoStreamController.php:24
 * @route '/media/photos/{photo}'
 */
export const photo = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: photo.url(args, options),
    method: 'get',
})

photo.definition = {
    methods: ["get","head"],
    url: '/media/photos/{photo}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PhotoStreamController::photo
 * @see app/Http/Controllers/PhotoStreamController.php:24
 * @route '/media/photos/{photo}'
 */
photo.url = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { photo: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { photo: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    photo: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        photo: typeof args.photo === 'object'
                ? args.photo.id
                : args.photo,
                }

    return photo.definition.url
            .replace('{photo}', parsedArgs.photo.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoStreamController::photo
 * @see app/Http/Controllers/PhotoStreamController.php:24
 * @route '/media/photos/{photo}'
 */
photo.get = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: photo.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PhotoStreamController::photo
 * @see app/Http/Controllers/PhotoStreamController.php:24
 * @route '/media/photos/{photo}'
 */
photo.head = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: photo.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PhotoStreamController::photo
 * @see app/Http/Controllers/PhotoStreamController.php:24
 * @route '/media/photos/{photo}'
 */
    const photoForm = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: photo.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PhotoStreamController::photo
 * @see app/Http/Controllers/PhotoStreamController.php:24
 * @route '/media/photos/{photo}'
 */
        photoForm.get = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: photo.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PhotoStreamController::photo
 * @see app/Http/Controllers/PhotoStreamController.php:24
 * @route '/media/photos/{photo}'
 */
        photoForm.head = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: photo.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    photo.form = photoForm
const media = {
    photo: Object.assign(photo, photo),
}

export default media