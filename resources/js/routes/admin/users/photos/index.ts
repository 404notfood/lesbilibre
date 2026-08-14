import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\UserController::sensitivity
 * @see app/Http/Controllers/Admin/UserController.php:150
 * @route '/admin/users/{user}/photos/{photo}/sensitivity'
 */
export const sensitivity = (args: { user: number | { id: number }, photo: number | { id: number } } | [user: number | { id: number }, photo: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sensitivity.url(args, options),
    method: 'post',
})

sensitivity.definition = {
    methods: ["post"],
    url: '/admin/users/{user}/photos/{photo}/sensitivity',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\UserController::sensitivity
 * @see app/Http/Controllers/Admin/UserController.php:150
 * @route '/admin/users/{user}/photos/{photo}/sensitivity'
 */
sensitivity.url = (args: { user: number | { id: number }, photo: number | { id: number } } | [user: number | { id: number }, photo: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                    photo: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                                photo: typeof args.photo === 'object'
                ? args.photo.id
                : args.photo,
                }

    return sensitivity.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace('{photo}', parsedArgs.photo.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\UserController::sensitivity
 * @see app/Http/Controllers/Admin/UserController.php:150
 * @route '/admin/users/{user}/photos/{photo}/sensitivity'
 */
sensitivity.post = (args: { user: number | { id: number }, photo: number | { id: number } } | [user: number | { id: number }, photo: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sensitivity.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\UserController::sensitivity
 * @see app/Http/Controllers/Admin/UserController.php:150
 * @route '/admin/users/{user}/photos/{photo}/sensitivity'
 */
    const sensitivityForm = (args: { user: number | { id: number }, photo: number | { id: number } } | [user: number | { id: number }, photo: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: sensitivity.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\UserController::sensitivity
 * @see app/Http/Controllers/Admin/UserController.php:150
 * @route '/admin/users/{user}/photos/{photo}/sensitivity'
 */
        sensitivityForm.post = (args: { user: number | { id: number }, photo: number | { id: number } } | [user: number | { id: number }, photo: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: sensitivity.url(args, options),
            method: 'post',
        })
    
    sensitivity.form = sensitivityForm
/**
* @see \App\Http\Controllers\Admin\UserController::destroy
 * @see app/Http/Controllers/Admin/UserController.php:195
 * @route '/admin/users/{user}/photos/{photo}'
 */
export const destroy = (args: { user: number | { id: number }, photo: number | { id: number } } | [user: number | { id: number }, photo: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/users/{user}/photos/{photo}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\UserController::destroy
 * @see app/Http/Controllers/Admin/UserController.php:195
 * @route '/admin/users/{user}/photos/{photo}'
 */
destroy.url = (args: { user: number | { id: number }, photo: number | { id: number } } | [user: number | { id: number }, photo: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                    photo: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                                photo: typeof args.photo === 'object'
                ? args.photo.id
                : args.photo,
                }

    return destroy.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace('{photo}', parsedArgs.photo.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\UserController::destroy
 * @see app/Http/Controllers/Admin/UserController.php:195
 * @route '/admin/users/{user}/photos/{photo}'
 */
destroy.delete = (args: { user: number | { id: number }, photo: number | { id: number } } | [user: number | { id: number }, photo: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\UserController::destroy
 * @see app/Http/Controllers/Admin/UserController.php:195
 * @route '/admin/users/{user}/photos/{photo}'
 */
    const destroyForm = (args: { user: number | { id: number }, photo: number | { id: number } } | [user: number | { id: number }, photo: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\UserController::destroy
 * @see app/Http/Controllers/Admin/UserController.php:195
 * @route '/admin/users/{user}/photos/{photo}'
 */
        destroyForm.delete = (args: { user: number | { id: number }, photo: number | { id: number } } | [user: number | { id: number }, photo: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const photos = {
    sensitivity: Object.assign(sensitivity, sensitivity),
destroy: Object.assign(destroy, destroy),
}

export default photos