import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
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
/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::storePlan
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:73
 * @route '/admin/billing/plans'
 */
export const storePlan = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storePlan.url(options),
    method: 'post',
})

storePlan.definition = {
    methods: ["post"],
    url: '/admin/billing/plans',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::storePlan
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:73
 * @route '/admin/billing/plans'
 */
storePlan.url = (options?: RouteQueryOptions) => {
    return storePlan.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::storePlan
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:73
 * @route '/admin/billing/plans'
 */
storePlan.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storePlan.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::storePlan
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:73
 * @route '/admin/billing/plans'
 */
    const storePlanForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storePlan.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::storePlan
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:73
 * @route '/admin/billing/plans'
 */
        storePlanForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storePlan.url(options),
            method: 'post',
        })
    
    storePlan.form = storePlanForm
/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::updatePlan
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:83
 * @route '/admin/billing/plans/{plan}'
 */
export const updatePlan = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePlan.url(args, options),
    method: 'put',
})

updatePlan.definition = {
    methods: ["put"],
    url: '/admin/billing/plans/{plan}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::updatePlan
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:83
 * @route '/admin/billing/plans/{plan}'
 */
updatePlan.url = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updatePlan.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::updatePlan
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:83
 * @route '/admin/billing/plans/{plan}'
 */
updatePlan.put = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePlan.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::updatePlan
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:83
 * @route '/admin/billing/plans/{plan}'
 */
    const updatePlanForm = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updatePlan.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::updatePlan
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:83
 * @route '/admin/billing/plans/{plan}'
 */
        updatePlanForm.put = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updatePlan.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updatePlan.form = updatePlanForm
/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroyPlan
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:93
 * @route '/admin/billing/plans/{plan}'
 */
export const destroyPlan = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyPlan.url(args, options),
    method: 'delete',
})

destroyPlan.definition = {
    methods: ["delete"],
    url: '/admin/billing/plans/{plan}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroyPlan
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:93
 * @route '/admin/billing/plans/{plan}'
 */
destroyPlan.url = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroyPlan.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroyPlan
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:93
 * @route '/admin/billing/plans/{plan}'
 */
destroyPlan.delete = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyPlan.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroyPlan
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:93
 * @route '/admin/billing/plans/{plan}'
 */
    const destroyPlanForm = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyPlan.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroyPlan
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:93
 * @route '/admin/billing/plans/{plan}'
 */
        destroyPlanForm.delete = (args: { plan: number | { id: number } } | [plan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyPlan.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyPlan.form = destroyPlanForm
/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::storePackage
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:114
 * @route '/admin/billing/packages'
 */
export const storePackage = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storePackage.url(options),
    method: 'post',
})

storePackage.definition = {
    methods: ["post"],
    url: '/admin/billing/packages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::storePackage
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:114
 * @route '/admin/billing/packages'
 */
storePackage.url = (options?: RouteQueryOptions) => {
    return storePackage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::storePackage
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:114
 * @route '/admin/billing/packages'
 */
storePackage.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storePackage.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::storePackage
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:114
 * @route '/admin/billing/packages'
 */
    const storePackageForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storePackage.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::storePackage
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:114
 * @route '/admin/billing/packages'
 */
        storePackageForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storePackage.url(options),
            method: 'post',
        })
    
    storePackage.form = storePackageForm
/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::updatePackage
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:124
 * @route '/admin/billing/packages/{package}'
 */
export const updatePackage = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePackage.url(args, options),
    method: 'put',
})

updatePackage.definition = {
    methods: ["put"],
    url: '/admin/billing/packages/{package}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::updatePackage
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:124
 * @route '/admin/billing/packages/{package}'
 */
updatePackage.url = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updatePackage.definition.url
            .replace('{package}', parsedArgs.package.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::updatePackage
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:124
 * @route '/admin/billing/packages/{package}'
 */
updatePackage.put = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePackage.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::updatePackage
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:124
 * @route '/admin/billing/packages/{package}'
 */
    const updatePackageForm = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updatePackage.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::updatePackage
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:124
 * @route '/admin/billing/packages/{package}'
 */
        updatePackageForm.put = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updatePackage.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updatePackage.form = updatePackageForm
/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroyPackage
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:134
 * @route '/admin/billing/packages/{package}'
 */
export const destroyPackage = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyPackage.url(args, options),
    method: 'delete',
})

destroyPackage.definition = {
    methods: ["delete"],
    url: '/admin/billing/packages/{package}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroyPackage
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:134
 * @route '/admin/billing/packages/{package}'
 */
destroyPackage.url = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroyPackage.definition.url
            .replace('{package}', parsedArgs.package.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroyPackage
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:134
 * @route '/admin/billing/packages/{package}'
 */
destroyPackage.delete = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyPackage.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroyPackage
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:134
 * @route '/admin/billing/packages/{package}'
 */
    const destroyPackageForm = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyPackage.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BillingCatalogController::destroyPackage
 * @see app/Http/Controllers/Admin/BillingCatalogController.php:134
 * @route '/admin/billing/packages/{package}'
 */
        destroyPackageForm.delete = (args: { package: number | { id: number } } | [packageParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyPackage.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyPackage.form = destroyPackageForm
const BillingCatalogController = { index, storePlan, updatePlan, destroyPlan, storePackage, updatePackage, destroyPackage }

export default BillingCatalogController