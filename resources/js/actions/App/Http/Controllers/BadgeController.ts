import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BadgeController::index
 * @see app/Http/Controllers/BadgeController.php:17
 * @route '/badges'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/badges',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BadgeController::index
 * @see app/Http/Controllers/BadgeController.php:17
 * @route '/badges'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BadgeController::index
 * @see app/Http/Controllers/BadgeController.php:17
 * @route '/badges'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BadgeController::index
 * @see app/Http/Controllers/BadgeController.php:17
 * @route '/badges'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BadgeController::index
 * @see app/Http/Controllers/BadgeController.php:17
 * @route '/badges'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BadgeController::index
 * @see app/Http/Controllers/BadgeController.php:17
 * @route '/badges'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BadgeController::index
 * @see app/Http/Controllers/BadgeController.php:17
 * @route '/badges'
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
/**
* @see \App\Http\Controllers\BadgeController::refresh
 * @see app/Http/Controllers/BadgeController.php:50
 * @route '/badges/refresh'
 */
export const refresh = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refresh.url(options),
    method: 'post',
})

refresh.definition = {
    methods: ["post"],
    url: '/badges/refresh',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BadgeController::refresh
 * @see app/Http/Controllers/BadgeController.php:50
 * @route '/badges/refresh'
 */
refresh.url = (options?: RouteQueryOptions) => {
    return refresh.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BadgeController::refresh
 * @see app/Http/Controllers/BadgeController.php:50
 * @route '/badges/refresh'
 */
refresh.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refresh.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BadgeController::refresh
 * @see app/Http/Controllers/BadgeController.php:50
 * @route '/badges/refresh'
 */
    const refreshForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: refresh.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BadgeController::refresh
 * @see app/Http/Controllers/BadgeController.php:50
 * @route '/badges/refresh'
 */
        refreshForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: refresh.url(options),
            method: 'post',
        })
    
    refresh.form = refreshForm
const BadgeController = { index, refresh }

export default BadgeController