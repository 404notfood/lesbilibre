import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::store
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:70
 * @route '/admin/billing/plans'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/billing/plans',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::store
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:70
 * @route '/admin/billing/plans'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::store
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:70
 * @route '/admin/billing/plans'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::store
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:70
 * @route '/admin/billing/plans'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::store
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:70
 * @route '/admin/billing/plans'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::update
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:80
 * @route '/admin/billing/plans/{plan}'
 */
export const update = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/billing/plans/{plan}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::update
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:80
 * @route '/admin/billing/plans/{plan}'
 */
update.url = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { plan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { plan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    plan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        plan: typeof args.plan === 'object'
                ? args.plan.id
                : args.plan,
                }

    return update.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::update
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:80
 * @route '/admin/billing/plans/{plan}'
 */
update.put = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::update
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:80
 * @route '/admin/billing/plans/{plan}'
 */
    const updateForm = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::update
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:80
 * @route '/admin/billing/plans/{plan}'
 */
        updateForm.put = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroy
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:90
 * @route '/admin/billing/plans/{plan}'
 */
export const destroy = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/billing/plans/{plan}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroy
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:90
 * @route '/admin/billing/plans/{plan}'
 */
destroy.url = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { plan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { plan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    plan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        plan: typeof args.plan === 'object'
                ? args.plan.id
                : args.plan,
                }

    return destroy.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroy
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:90
 * @route '/admin/billing/plans/{plan}'
 */
destroy.delete = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroy
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:90
 * @route '/admin/billing/plans/{plan}'
 */
    const destroyForm = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroy
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:90
 * @route '/admin/billing/plans/{plan}'
 */
        destroyForm.delete = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const plans = {
    store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default plans