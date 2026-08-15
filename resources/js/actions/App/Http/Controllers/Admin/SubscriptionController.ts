import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SubscriptionController::index
 * @see app/Http/Controllers/Admin/SubscriptionController.php:18
 * @route '/admin/subscriptions'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::index
 * @see app/Http/Controllers/Admin/SubscriptionController.php:18
 * @route '/admin/subscriptions'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::index
 * @see app/Http/Controllers/Admin/SubscriptionController.php:18
 * @route '/admin/subscriptions'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionController::index
 * @see app/Http/Controllers/Admin/SubscriptionController.php:18
 * @route '/admin/subscriptions'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\SubscriptionController::index
 * @see app/Http/Controllers/Admin/SubscriptionController.php:18
 * @route '/admin/subscriptions'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\SubscriptionController::index
 * @see app/Http/Controllers/Admin/SubscriptionController.php:18
 * @route '/admin/subscriptions'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\SubscriptionController::index
 * @see app/Http/Controllers/Admin/SubscriptionController.php:18
 * @route '/admin/subscriptions'
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
* @see \App\Http\Controllers\Admin\SubscriptionController::create
 * @see app/Http/Controllers/Admin/SubscriptionController.php:111
 * @route '/admin/subscriptions/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::create
 * @see app/Http/Controllers/Admin/SubscriptionController.php:111
 * @route '/admin/subscriptions/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::create
 * @see app/Http/Controllers/Admin/SubscriptionController.php:111
 * @route '/admin/subscriptions/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionController::create
 * @see app/Http/Controllers/Admin/SubscriptionController.php:111
 * @route '/admin/subscriptions/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\SubscriptionController::create
 * @see app/Http/Controllers/Admin/SubscriptionController.php:111
 * @route '/admin/subscriptions/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\SubscriptionController::create
 * @see app/Http/Controllers/Admin/SubscriptionController.php:111
 * @route '/admin/subscriptions/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\SubscriptionController::create
 * @see app/Http/Controllers/Admin/SubscriptionController.php:111
 * @route '/admin/subscriptions/create'
 */
        createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
/**
* @see \App\Http\Controllers\Admin\SubscriptionController::store
 * @see app/Http/Controllers/Admin/SubscriptionController.php:153
 * @route '/admin/subscriptions'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/subscriptions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::store
 * @see app/Http/Controllers/Admin/SubscriptionController.php:153
 * @route '/admin/subscriptions'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::store
 * @see app/Http/Controllers/Admin/SubscriptionController.php:153
 * @route '/admin/subscriptions'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\SubscriptionController::store
 * @see app/Http/Controllers/Admin/SubscriptionController.php:153
 * @route '/admin/subscriptions'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\SubscriptionController::store
 * @see app/Http/Controllers/Admin/SubscriptionController.php:153
 * @route '/admin/subscriptions'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\SubscriptionController::show
 * @see app/Http/Controllers/Admin/SubscriptionController.php:200
 * @route '/admin/subscriptions/{subscription}'
 */
export const show = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/{subscription}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::show
 * @see app/Http/Controllers/Admin/SubscriptionController.php:200
 * @route '/admin/subscriptions/{subscription}'
 */
show.url = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return show.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::show
 * @see app/Http/Controllers/Admin/SubscriptionController.php:200
 * @route '/admin/subscriptions/{subscription}'
 */
show.get = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionController::show
 * @see app/Http/Controllers/Admin/SubscriptionController.php:200
 * @route '/admin/subscriptions/{subscription}'
 */
show.head = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\SubscriptionController::show
 * @see app/Http/Controllers/Admin/SubscriptionController.php:200
 * @route '/admin/subscriptions/{subscription}'
 */
    const showForm = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\SubscriptionController::show
 * @see app/Http/Controllers/Admin/SubscriptionController.php:200
 * @route '/admin/subscriptions/{subscription}'
 */
        showForm.get = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\SubscriptionController::show
 * @see app/Http/Controllers/Admin/SubscriptionController.php:200
 * @route '/admin/subscriptions/{subscription}'
 */
        showForm.head = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\Admin\SubscriptionController::edit
 * @see app/Http/Controllers/Admin/SubscriptionController.php:232
 * @route '/admin/subscriptions/{subscription}/edit'
 */
export const edit = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/{subscription}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::edit
 * @see app/Http/Controllers/Admin/SubscriptionController.php:232
 * @route '/admin/subscriptions/{subscription}/edit'
 */
edit.url = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return edit.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::edit
 * @see app/Http/Controllers/Admin/SubscriptionController.php:232
 * @route '/admin/subscriptions/{subscription}/edit'
 */
edit.get = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionController::edit
 * @see app/Http/Controllers/Admin/SubscriptionController.php:232
 * @route '/admin/subscriptions/{subscription}/edit'
 */
edit.head = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\SubscriptionController::edit
 * @see app/Http/Controllers/Admin/SubscriptionController.php:232
 * @route '/admin/subscriptions/{subscription}/edit'
 */
    const editForm = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\SubscriptionController::edit
 * @see app/Http/Controllers/Admin/SubscriptionController.php:232
 * @route '/admin/subscriptions/{subscription}/edit'
 */
        editForm.get = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\SubscriptionController::edit
 * @see app/Http/Controllers/Admin/SubscriptionController.php:232
 * @route '/admin/subscriptions/{subscription}/edit'
 */
        editForm.head = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
/**
* @see \App\Http\Controllers\Admin\SubscriptionController::update
 * @see app/Http/Controllers/Admin/SubscriptionController.php:255
 * @route '/admin/subscriptions/{subscription}'
 */
export const update = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/subscriptions/{subscription}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::update
 * @see app/Http/Controllers/Admin/SubscriptionController.php:255
 * @route '/admin/subscriptions/{subscription}'
 */
update.url = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return update.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::update
 * @see app/Http/Controllers/Admin/SubscriptionController.php:255
 * @route '/admin/subscriptions/{subscription}'
 */
update.put = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\SubscriptionController::update
 * @see app/Http/Controllers/Admin/SubscriptionController.php:255
 * @route '/admin/subscriptions/{subscription}'
 */
    const updateForm = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\SubscriptionController::update
 * @see app/Http/Controllers/Admin/SubscriptionController.php:255
 * @route '/admin/subscriptions/{subscription}'
 */
        updateForm.put = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\SubscriptionController::extend
 * @see app/Http/Controllers/Admin/SubscriptionController.php:286
 * @route '/admin/subscriptions/{subscription}/extend'
 */
export const extend = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: extend.url(args, options),
    method: 'post',
})

extend.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/{subscription}/extend',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::extend
 * @see app/Http/Controllers/Admin/SubscriptionController.php:286
 * @route '/admin/subscriptions/{subscription}/extend'
 */
extend.url = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return extend.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::extend
 * @see app/Http/Controllers/Admin/SubscriptionController.php:286
 * @route '/admin/subscriptions/{subscription}/extend'
 */
extend.post = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: extend.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\SubscriptionController::extend
 * @see app/Http/Controllers/Admin/SubscriptionController.php:286
 * @route '/admin/subscriptions/{subscription}/extend'
 */
    const extendForm = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: extend.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\SubscriptionController::extend
 * @see app/Http/Controllers/Admin/SubscriptionController.php:286
 * @route '/admin/subscriptions/{subscription}/extend'
 */
        extendForm.post = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: extend.url(args, options),
            method: 'post',
        })
    
    extend.form = extendForm
/**
* @see \App\Http\Controllers\Admin\SubscriptionController::cancel
 * @see app/Http/Controllers/Admin/SubscriptionController.php:313
 * @route '/admin/subscriptions/{subscription}/cancel'
 */
export const cancel = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/{subscription}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::cancel
 * @see app/Http/Controllers/Admin/SubscriptionController.php:313
 * @route '/admin/subscriptions/{subscription}/cancel'
 */
cancel.url = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return cancel.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::cancel
 * @see app/Http/Controllers/Admin/SubscriptionController.php:313
 * @route '/admin/subscriptions/{subscription}/cancel'
 */
cancel.post = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\SubscriptionController::cancel
 * @see app/Http/Controllers/Admin/SubscriptionController.php:313
 * @route '/admin/subscriptions/{subscription}/cancel'
 */
    const cancelForm = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: cancel.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\SubscriptionController::cancel
 * @see app/Http/Controllers/Admin/SubscriptionController.php:313
 * @route '/admin/subscriptions/{subscription}/cancel'
 */
        cancelForm.post = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: cancel.url(args, options),
            method: 'post',
        })
    
    cancel.form = cancelForm
/**
* @see \App\Http\Controllers\Admin\SubscriptionController::reactivate
 * @see app/Http/Controllers/Admin/SubscriptionController.php:339
 * @route '/admin/subscriptions/{subscription}/reactivate'
 */
export const reactivate = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reactivate.url(args, options),
    method: 'post',
})

reactivate.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/{subscription}/reactivate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::reactivate
 * @see app/Http/Controllers/Admin/SubscriptionController.php:339
 * @route '/admin/subscriptions/{subscription}/reactivate'
 */
reactivate.url = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return reactivate.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::reactivate
 * @see app/Http/Controllers/Admin/SubscriptionController.php:339
 * @route '/admin/subscriptions/{subscription}/reactivate'
 */
reactivate.post = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reactivate.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\SubscriptionController::reactivate
 * @see app/Http/Controllers/Admin/SubscriptionController.php:339
 * @route '/admin/subscriptions/{subscription}/reactivate'
 */
    const reactivateForm = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reactivate.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\SubscriptionController::reactivate
 * @see app/Http/Controllers/Admin/SubscriptionController.php:339
 * @route '/admin/subscriptions/{subscription}/reactivate'
 */
        reactivateForm.post = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reactivate.url(args, options),
            method: 'post',
        })
    
    reactivate.form = reactivateForm
/**
* @see \App\Http\Controllers\Admin\SubscriptionController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionController.php:358
 * @route '/admin/subscriptions/{subscription}'
 */
export const destroy = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/subscriptions/{subscription}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionController.php:358
 * @route '/admin/subscriptions/{subscription}'
 */
destroy.url = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return destroy.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionController.php:358
 * @route '/admin/subscriptions/{subscription}'
 */
destroy.delete = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\SubscriptionController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionController.php:358
 * @route '/admin/subscriptions/{subscription}'
 */
    const destroyForm = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\SubscriptionController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionController.php:358
 * @route '/admin/subscriptions/{subscription}'
 */
        destroyForm.delete = (args: { subscription: number | { id: number } } | [subscription: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const SubscriptionController = { index, create, store, show, edit, update, extend, cancel, reactivate, destroy }

export default SubscriptionController