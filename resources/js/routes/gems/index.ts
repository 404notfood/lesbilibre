import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\GemHistoryController::history
 * @see app/Http/Controllers/GemHistoryController.php:14
 * @route '/gems/history'
 */
export const history = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/gems/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GemHistoryController::history
 * @see app/Http/Controllers/GemHistoryController.php:14
 * @route '/gems/history'
 */
history.url = (options?: RouteQueryOptions) => {
    return history.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GemHistoryController::history
 * @see app/Http/Controllers/GemHistoryController.php:14
 * @route '/gems/history'
 */
history.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\GemHistoryController::history
 * @see app/Http/Controllers/GemHistoryController.php:14
 * @route '/gems/history'
 */
history.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\GemHistoryController::history
 * @see app/Http/Controllers/GemHistoryController.php:14
 * @route '/gems/history'
 */
    const historyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: history.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\GemHistoryController::history
 * @see app/Http/Controllers/GemHistoryController.php:14
 * @route '/gems/history'
 */
        historyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: history.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\GemHistoryController::history
 * @see app/Http/Controllers/GemHistoryController.php:14
 * @route '/gems/history'
 */
        historyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: history.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    history.form = historyForm
const gems = {
    history: Object.assign(history, history),
}

export default gems