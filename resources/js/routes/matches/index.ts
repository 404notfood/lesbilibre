import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\MatchController::index
 * @see app/Http/Controllers/MatchController.php:19
 * @route '/matches'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/matches',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MatchController::index
 * @see app/Http/Controllers/MatchController.php:19
 * @route '/matches'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MatchController::index
 * @see app/Http/Controllers/MatchController.php:19
 * @route '/matches'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MatchController::index
 * @see app/Http/Controllers/MatchController.php:19
 * @route '/matches'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MatchController::index
 * @see app/Http/Controllers/MatchController.php:19
 * @route '/matches'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MatchController::index
 * @see app/Http/Controllers/MatchController.php:19
 * @route '/matches'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MatchController::index
 * @see app/Http/Controllers/MatchController.php:19
 * @route '/matches'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
const matches = {
    index: Object.assign(index, index),
}

export default matches