import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ModerationController::index
 * @see app/Http/Controllers/Admin/ModerationController.php:18
 * @route '/admin/moderation'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/moderation',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ModerationController::index
 * @see app/Http/Controllers/Admin/ModerationController.php:18
 * @route '/admin/moderation'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ModerationController::index
 * @see app/Http/Controllers/Admin/ModerationController.php:18
 * @route '/admin/moderation'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ModerationController::index
 * @see app/Http/Controllers/Admin/ModerationController.php:18
 * @route '/admin/moderation'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ModerationController::index
 * @see app/Http/Controllers/Admin/ModerationController.php:18
 * @route '/admin/moderation'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ModerationController::index
 * @see app/Http/Controllers/Admin/ModerationController.php:18
 * @route '/admin/moderation'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ModerationController::index
 * @see app/Http/Controllers/Admin/ModerationController.php:18
 * @route '/admin/moderation'
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
const moderation = {
    index: Object.assign(index, index),
}

export default moderation