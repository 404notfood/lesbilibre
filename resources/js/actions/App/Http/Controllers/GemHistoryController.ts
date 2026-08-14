import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\GemHistoryController::index
 * @see app/Http/Controllers/GemHistoryController.php:14
 * @route '/gems/history'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/gems/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GemHistoryController::index
 * @see app/Http/Controllers/GemHistoryController.php:14
 * @route '/gems/history'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GemHistoryController::index
 * @see app/Http/Controllers/GemHistoryController.php:14
 * @route '/gems/history'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\GemHistoryController::index
 * @see app/Http/Controllers/GemHistoryController.php:14
 * @route '/gems/history'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\GemHistoryController::index
 * @see app/Http/Controllers/GemHistoryController.php:14
 * @route '/gems/history'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\GemHistoryController::index
 * @see app/Http/Controllers/GemHistoryController.php:14
 * @route '/gems/history'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\GemHistoryController::index
 * @see app/Http/Controllers/GemHistoryController.php:14
 * @route '/gems/history'
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
const GemHistoryController = { index }

export default GemHistoryController