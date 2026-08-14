import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::index
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:24
 * @route '/admin/ephemeral'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/ephemeral',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::index
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:24
 * @route '/admin/ephemeral'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::index
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:24
 * @route '/admin/ephemeral'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::index
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:24
 * @route '/admin/ephemeral'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::index
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:24
 * @route '/admin/ephemeral'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::index
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:24
 * @route '/admin/ephemeral'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::index
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:24
 * @route '/admin/ephemeral'
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
* @see \App\Http\Controllers\Admin\EphemeralMediaController::file
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:67
 * @route '/admin/ephemeral/{medium}/file'
 */
export const file = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: file.url(args, options),
    method: 'get',
})

file.definition = {
    methods: ["get","head"],
    url: '/admin/ephemeral/{medium}/file',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::file
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:67
 * @route '/admin/ephemeral/{medium}/file'
 */
file.url = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { medium: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { medium: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    medium: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        medium: typeof args.medium === 'object'
                ? args.medium.id
                : args.medium,
                }

    return file.definition.url
            .replace('{medium}', parsedArgs.medium.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::file
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:67
 * @route '/admin/ephemeral/{medium}/file'
 */
file.get = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: file.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::file
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:67
 * @route '/admin/ephemeral/{medium}/file'
 */
file.head = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: file.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::file
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:67
 * @route '/admin/ephemeral/{medium}/file'
 */
    const fileForm = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: file.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::file
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:67
 * @route '/admin/ephemeral/{medium}/file'
 */
        fileForm.get = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: file.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::file
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:67
 * @route '/admin/ephemeral/{medium}/file'
 */
        fileForm.head = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: file.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    file.form = fileForm
/**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::dismiss
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:93
 * @route '/admin/ephemeral/{medium}/dismiss'
 */
export const dismiss = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dismiss.url(args, options),
    method: 'post',
})

dismiss.definition = {
    methods: ["post"],
    url: '/admin/ephemeral/{medium}/dismiss',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::dismiss
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:93
 * @route '/admin/ephemeral/{medium}/dismiss'
 */
dismiss.url = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { medium: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { medium: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    medium: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        medium: typeof args.medium === 'object'
                ? args.medium.id
                : args.medium,
                }

    return dismiss.definition.url
            .replace('{medium}', parsedArgs.medium.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::dismiss
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:93
 * @route '/admin/ephemeral/{medium}/dismiss'
 */
dismiss.post = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dismiss.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::dismiss
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:93
 * @route '/admin/ephemeral/{medium}/dismiss'
 */
    const dismissForm = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: dismiss.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::dismiss
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:93
 * @route '/admin/ephemeral/{medium}/dismiss'
 */
        dismissForm.post = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: dismiss.url(args, options),
            method: 'post',
        })
    
    dismiss.form = dismissForm
/**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::destroy
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:110
 * @route '/admin/ephemeral/{medium}'
 */
export const destroy = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/ephemeral/{medium}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::destroy
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:110
 * @route '/admin/ephemeral/{medium}'
 */
destroy.url = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { medium: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { medium: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    medium: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        medium: typeof args.medium === 'object'
                ? args.medium.id
                : args.medium,
                }

    return destroy.definition.url
            .replace('{medium}', parsedArgs.medium.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::destroy
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:110
 * @route '/admin/ephemeral/{medium}'
 */
destroy.delete = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::destroy
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:110
 * @route '/admin/ephemeral/{medium}'
 */
    const destroyForm = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\EphemeralMediaController::destroy
 * @see app/Http/Controllers/Admin/EphemeralMediaController.php:110
 * @route '/admin/ephemeral/{medium}'
 */
        destroyForm.delete = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const ephemeral = {
    index: Object.assign(index, index),
file: Object.assign(file, file),
dismiss: Object.assign(dismiss, dismiss),
destroy: Object.assign(destroy, destroy),
}

export default ephemeral