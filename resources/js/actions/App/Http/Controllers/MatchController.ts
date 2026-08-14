import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
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
/**
* @see \App\Http\Controllers\MatchController::recommendations
 * @see app/Http/Controllers/MatchController.php:33
 * @route '/discover'
 */
export const recommendations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recommendations.url(options),
    method: 'get',
})

recommendations.definition = {
    methods: ["get","head"],
    url: '/discover',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MatchController::recommendations
 * @see app/Http/Controllers/MatchController.php:33
 * @route '/discover'
 */
recommendations.url = (options?: RouteQueryOptions) => {
    return recommendations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MatchController::recommendations
 * @see app/Http/Controllers/MatchController.php:33
 * @route '/discover'
 */
recommendations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recommendations.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MatchController::recommendations
 * @see app/Http/Controllers/MatchController.php:33
 * @route '/discover'
 */
recommendations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: recommendations.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MatchController::recommendations
 * @see app/Http/Controllers/MatchController.php:33
 * @route '/discover'
 */
    const recommendationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: recommendations.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MatchController::recommendations
 * @see app/Http/Controllers/MatchController.php:33
 * @route '/discover'
 */
        recommendationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: recommendations.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MatchController::recommendations
 * @see app/Http/Controllers/MatchController.php:33
 * @route '/discover'
 */
        recommendationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: recommendations.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    recommendations.form = recommendationsForm
const MatchController = { index, recommendations }

export default MatchController