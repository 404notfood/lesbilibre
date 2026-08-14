import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\BlockController::index
 * @see app/Http/Controllers/BlockController.php:20
 * @route '/blocked-users'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/blocked-users',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BlockController::index
 * @see app/Http/Controllers/BlockController.php:20
 * @route '/blocked-users'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BlockController::index
 * @see app/Http/Controllers/BlockController.php:20
 * @route '/blocked-users'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BlockController::index
 * @see app/Http/Controllers/BlockController.php:20
 * @route '/blocked-users'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BlockController::index
 * @see app/Http/Controllers/BlockController.php:20
 * @route '/blocked-users'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BlockController::index
 * @see app/Http/Controllers/BlockController.php:20
 * @route '/blocked-users'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BlockController::index
 * @see app/Http/Controllers/BlockController.php:20
 * @route '/blocked-users'
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
const blocked = {
    index: Object.assign(index, index),
}

export default blocked