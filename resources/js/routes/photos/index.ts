import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\PhotoController::index
 * @see app/Http/Controllers/PhotoController.php:24
 * @route '/photos'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/photos',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PhotoController::index
 * @see app/Http/Controllers/PhotoController.php:24
 * @route '/photos'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoController::index
 * @see app/Http/Controllers/PhotoController.php:24
 * @route '/photos'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PhotoController::index
 * @see app/Http/Controllers/PhotoController.php:24
 * @route '/photos'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PhotoController::index
 * @see app/Http/Controllers/PhotoController.php:24
 * @route '/photos'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PhotoController::index
 * @see app/Http/Controllers/PhotoController.php:24
 * @route '/photos'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PhotoController::index
 * @see app/Http/Controllers/PhotoController.php:24
 * @route '/photos'
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
* @see \App\Http\Controllers\PhotoController::store
 * @see app/Http/Controllers/PhotoController.php:50
 * @route '/photos'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/photos',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PhotoController::store
 * @see app/Http/Controllers/PhotoController.php:50
 * @route '/photos'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoController::store
 * @see app/Http/Controllers/PhotoController.php:50
 * @route '/photos'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PhotoController::store
 * @see app/Http/Controllers/PhotoController.php:50
 * @route '/photos'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PhotoController::store
 * @see app/Http/Controllers/PhotoController.php:50
 * @route '/photos'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\PhotoController::primary
 * @see app/Http/Controllers/PhotoController.php:87
 * @route '/photos/{photo}/primary'
 */
export const primary = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: primary.url(args, options),
    method: 'post',
})

primary.definition = {
    methods: ["post"],
    url: '/photos/{photo}/primary',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PhotoController::primary
 * @see app/Http/Controllers/PhotoController.php:87
 * @route '/photos/{photo}/primary'
 */
primary.url = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { photo: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { photo: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    photo: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        photo: typeof args.photo === 'object'
                ? args.photo.id
                : args.photo,
                }

    return primary.definition.url
            .replace('{photo}', parsedArgs.photo.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoController::primary
 * @see app/Http/Controllers/PhotoController.php:87
 * @route '/photos/{photo}/primary'
 */
primary.post = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: primary.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PhotoController::primary
 * @see app/Http/Controllers/PhotoController.php:87
 * @route '/photos/{photo}/primary'
 */
    const primaryForm = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: primary.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PhotoController::primary
 * @see app/Http/Controllers/PhotoController.php:87
 * @route '/photos/{photo}/primary'
 */
        primaryForm.post = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: primary.url(args, options),
            method: 'post',
        })
    
    primary.form = primaryForm
/**
* @see \App\Http\Controllers\PhotoController::requestAvatar
 * @see app/Http/Controllers/PhotoController.php:128
 * @route '/photos/{photo}/request-avatar'
 */
export const requestAvatar = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestAvatar.url(args, options),
    method: 'post',
})

requestAvatar.definition = {
    methods: ["post"],
    url: '/photos/{photo}/request-avatar',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PhotoController::requestAvatar
 * @see app/Http/Controllers/PhotoController.php:128
 * @route '/photos/{photo}/request-avatar'
 */
requestAvatar.url = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { photo: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { photo: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    photo: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        photo: typeof args.photo === 'object'
                ? args.photo.id
                : args.photo,
                }

    return requestAvatar.definition.url
            .replace('{photo}', parsedArgs.photo.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoController::requestAvatar
 * @see app/Http/Controllers/PhotoController.php:128
 * @route '/photos/{photo}/request-avatar'
 */
requestAvatar.post = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestAvatar.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PhotoController::requestAvatar
 * @see app/Http/Controllers/PhotoController.php:128
 * @route '/photos/{photo}/request-avatar'
 */
    const requestAvatarForm = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: requestAvatar.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PhotoController::requestAvatar
 * @see app/Http/Controllers/PhotoController.php:128
 * @route '/photos/{photo}/request-avatar'
 */
        requestAvatarForm.post = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: requestAvatar.url(args, options),
            method: 'post',
        })
    
    requestAvatar.form = requestAvatarForm
/**
* @see \App\Http\Controllers\PhotoController::destroy
 * @see app/Http/Controllers/PhotoController.php:161
 * @route '/photos/{photo}'
 */
export const destroy = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/photos/{photo}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PhotoController::destroy
 * @see app/Http/Controllers/PhotoController.php:161
 * @route '/photos/{photo}'
 */
destroy.url = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { photo: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { photo: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    photo: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        photo: typeof args.photo === 'object'
                ? args.photo.id
                : args.photo,
                }

    return destroy.definition.url
            .replace('{photo}', parsedArgs.photo.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoController::destroy
 * @see app/Http/Controllers/PhotoController.php:161
 * @route '/photos/{photo}'
 */
destroy.delete = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\PhotoController::destroy
 * @see app/Http/Controllers/PhotoController.php:161
 * @route '/photos/{photo}'
 */
    const destroyForm = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PhotoController::destroy
 * @see app/Http/Controllers/PhotoController.php:161
 * @route '/photos/{photo}'
 */
        destroyForm.delete = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
    index: Object.assign(index, index),
store: Object.assign(store, store),
primary: Object.assign(primary, primary),
requestAvatar: Object.assign(requestAvatar, requestAvatar),
destroy: Object.assign(destroy, destroy),
}

export default photos