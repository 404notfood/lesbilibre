import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\StaticPageAdminController::index
 * @see app/Http/Controllers/Admin/StaticPageAdminController.php:11
 * @route '/admin/static-pages'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/static-pages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\StaticPageAdminController::index
 * @see app/Http/Controllers/Admin/StaticPageAdminController.php:11
 * @route '/admin/static-pages'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\StaticPageAdminController::index
 * @see app/Http/Controllers/Admin/StaticPageAdminController.php:11
 * @route '/admin/static-pages'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\StaticPageAdminController::index
 * @see app/Http/Controllers/Admin/StaticPageAdminController.php:11
 * @route '/admin/static-pages'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\StaticPageAdminController::index
 * @see app/Http/Controllers/Admin/StaticPageAdminController.php:11
 * @route '/admin/static-pages'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\StaticPageAdminController::index
 * @see app/Http/Controllers/Admin/StaticPageAdminController.php:11
 * @route '/admin/static-pages'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\StaticPageAdminController::index
 * @see app/Http/Controllers/Admin/StaticPageAdminController.php:11
 * @route '/admin/static-pages'
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
const staticPages = {
    index: Object.assign(index, index),
}

export default staticPages