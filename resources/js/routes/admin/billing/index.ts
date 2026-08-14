import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import plans from './plans'
import packages from './packages'
/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::index
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:20
 * @route '/admin/billing'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/billing',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::index
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:20
 * @route '/admin/billing'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::index
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:20
 * @route '/admin/billing'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::index
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:20
 * @route '/admin/billing'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::index
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:20
 * @route '/admin/billing'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::index
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:20
 * @route '/admin/billing'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::index
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:20
 * @route '/admin/billing'
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
const billing = {
    index: Object.assign(index, index),
plans: Object.assign(plans, plans),
packages: Object.assign(packages, packages),
}

export default billing