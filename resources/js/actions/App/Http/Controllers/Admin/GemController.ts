import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\GemController::index
 * @see app/Http/Controllers/Admin/GemController.php:19
 * @route '/admin/gems'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/gems',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\GemController::index
 * @see app/Http/Controllers/Admin/GemController.php:19
 * @route '/admin/gems'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GemController::index
 * @see app/Http/Controllers/Admin/GemController.php:19
 * @route '/admin/gems'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\GemController::index
 * @see app/Http/Controllers/Admin/GemController.php:19
 * @route '/admin/gems'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\GemController::index
 * @see app/Http/Controllers/Admin/GemController.php:19
 * @route '/admin/gems'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\GemController::index
 * @see app/Http/Controllers/Admin/GemController.php:19
 * @route '/admin/gems'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\GemController::index
 * @see app/Http/Controllers/Admin/GemController.php:19
 * @route '/admin/gems'
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
* @see \App\Http\Controllers\Admin\GemController::show
 * @see app/Http/Controllers/Admin/GemController.php:94
 * @route '/admin/gems/{user}'
 */
export const show = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/gems/{user}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\GemController::show
 * @see app/Http/Controllers/Admin/GemController.php:94
 * @route '/admin/gems/{user}'
 */
show.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return show.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GemController::show
 * @see app/Http/Controllers/Admin/GemController.php:94
 * @route '/admin/gems/{user}'
 */
show.get = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\GemController::show
 * @see app/Http/Controllers/Admin/GemController.php:94
 * @route '/admin/gems/{user}'
 */
show.head = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\GemController::show
 * @see app/Http/Controllers/Admin/GemController.php:94
 * @route '/admin/gems/{user}'
 */
    const showForm = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\GemController::show
 * @see app/Http/Controllers/Admin/GemController.php:94
 * @route '/admin/gems/{user}'
 */
        showForm.get = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\GemController::show
 * @see app/Http/Controllers/Admin/GemController.php:94
 * @route '/admin/gems/{user}'
 */
        showForm.head = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\GemController::add
 * @see app/Http/Controllers/Admin/GemController.php:124
 * @route '/admin/gems/{user}/add'
 */
export const add = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: add.url(args, options),
    method: 'post',
})

add.definition = {
    methods: ["post"],
    url: '/admin/gems/{user}/add',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\GemController::add
 * @see app/Http/Controllers/Admin/GemController.php:124
 * @route '/admin/gems/{user}/add'
 */
add.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return add.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GemController::add
 * @see app/Http/Controllers/Admin/GemController.php:124
 * @route '/admin/gems/{user}/add'
 */
add.post = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: add.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\GemController::add
 * @see app/Http/Controllers/Admin/GemController.php:124
 * @route '/admin/gems/{user}/add'
 */
    const addForm = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: add.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\GemController::add
 * @see app/Http/Controllers/Admin/GemController.php:124
 * @route '/admin/gems/{user}/add'
 */
        addForm.post = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: add.url(args, options),
            method: 'post',
        })
    
    add.form = addForm
/**
* @see \App\Http\Controllers\Admin\GemController::remove
 * @see app/Http/Controllers/Admin/GemController.php:153
 * @route '/admin/gems/{user}/remove'
 */
export const remove = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: remove.url(args, options),
    method: 'post',
})

remove.definition = {
    methods: ["post"],
    url: '/admin/gems/{user}/remove',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\GemController::remove
 * @see app/Http/Controllers/Admin/GemController.php:153
 * @route '/admin/gems/{user}/remove'
 */
remove.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return remove.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GemController::remove
 * @see app/Http/Controllers/Admin/GemController.php:153
 * @route '/admin/gems/{user}/remove'
 */
remove.post = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: remove.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\GemController::remove
 * @see app/Http/Controllers/Admin/GemController.php:153
 * @route '/admin/gems/{user}/remove'
 */
    const removeForm = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: remove.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\GemController::remove
 * @see app/Http/Controllers/Admin/GemController.php:153
 * @route '/admin/gems/{user}/remove'
 */
        removeForm.post = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: remove.url(args, options),
            method: 'post',
        })
    
    remove.form = removeForm
const GemController = { index, show, add, remove }

export default GemController