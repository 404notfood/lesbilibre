import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\SessionController::index
 * @see app/Http/Controllers/Settings/SessionController.php:14
 * @route '/settings/sessions'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/sessions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\SessionController::index
 * @see app/Http/Controllers/Settings/SessionController.php:14
 * @route '/settings/sessions'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\SessionController::index
 * @see app/Http/Controllers/Settings/SessionController.php:14
 * @route '/settings/sessions'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Settings\SessionController::index
 * @see app/Http/Controllers/Settings/SessionController.php:14
 * @route '/settings/sessions'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Settings\SessionController::index
 * @see app/Http/Controllers/Settings/SessionController.php:14
 * @route '/settings/sessions'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Settings\SessionController::index
 * @see app/Http/Controllers/Settings/SessionController.php:14
 * @route '/settings/sessions'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Settings\SessionController::index
 * @see app/Http/Controllers/Settings/SessionController.php:14
 * @route '/settings/sessions'
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
* @see \App\Http\Controllers\Settings\SessionController::destroyOthers
 * @see app/Http/Controllers/Settings/SessionController.php:23
 * @route '/settings/sessions'
 */
export const destroyOthers = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyOthers.url(options),
    method: 'delete',
})

destroyOthers.definition = {
    methods: ["delete"],
    url: '/settings/sessions',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\SessionController::destroyOthers
 * @see app/Http/Controllers/Settings/SessionController.php:23
 * @route '/settings/sessions'
 */
destroyOthers.url = (options?: RouteQueryOptions) => {
    return destroyOthers.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\SessionController::destroyOthers
 * @see app/Http/Controllers/Settings/SessionController.php:23
 * @route '/settings/sessions'
 */
destroyOthers.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyOthers.url(options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Settings\SessionController::destroyOthers
 * @see app/Http/Controllers/Settings/SessionController.php:23
 * @route '/settings/sessions'
 */
    const destroyOthersForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyOthers.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Settings\SessionController::destroyOthers
 * @see app/Http/Controllers/Settings/SessionController.php:23
 * @route '/settings/sessions'
 */
        destroyOthersForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyOthers.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyOthers.form = destroyOthersForm
const sessions = {
    index: Object.assign(index, index),
destroyOthers: Object.assign(destroyOthers, destroyOthers),
}

export default sessions