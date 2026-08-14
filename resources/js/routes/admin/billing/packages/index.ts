import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::store
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:114
 * @route '/admin/billing/packages'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/billing/packages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::store
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:114
 * @route '/admin/billing/packages'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::store
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:114
 * @route '/admin/billing/packages'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::store
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:114
 * @route '/admin/billing/packages'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::store
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:114
 * @route '/admin/billing/packages'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::update
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:124
 * @route '/admin/billing/packages/{package}'
 */
export const update = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/billing/packages/{package}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::update
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:124
 * @route '/admin/billing/packages/{package}'
 */
update.url = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { package: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { package: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    package: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        package: typeof args.package === 'object'
                ? args.package.id
                : args.package,
                }

    return update.definition.url
            .replace('{package}', parsedArgs.package.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::update
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:124
 * @route '/admin/billing/packages/{package}'
 */
update.put = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::update
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:124
 * @route '/admin/billing/packages/{package}'
 */
    const updateForm = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:124
 * @route '/admin/billing/packages/{package}'
 */
        updateForm.put = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:134
 * @route '/admin/billing/packages/{package}'
 */
export const destroy = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/billing/packages/{package}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroy
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:134
 * @route '/admin/billing/packages/{package}'
 */
destroy.url = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { package: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { package: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    package: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        package: typeof args.package === 'object'
                ? args.package.id
                : args.package,
                }

    return destroy.definition.url
            .replace('{package}', parsedArgs.package.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroy
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:134
 * @route '/admin/billing/packages/{package}'
 */
destroy.delete = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroy
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:134
 * @route '/admin/billing/packages/{package}'
 */
    const destroyForm = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:134
 * @route '/admin/billing/packages/{package}'
 */
        destroyForm.delete = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const packages = {
    store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default packages