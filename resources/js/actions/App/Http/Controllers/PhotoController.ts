import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PhotoController::index
 * @see app/Http/Controllers/PhotoController.php:25
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
 * @see app/Http/Controllers/PhotoController.php:25
 * @route '/photos'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoController::index
 * @see app/Http/Controllers/PhotoController.php:25
 * @route '/photos'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PhotoController::index
 * @see app/Http/Controllers/PhotoController.php:25
 * @route '/photos'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PhotoController::index
 * @see app/Http/Controllers/PhotoController.php:25
 * @route '/photos'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PhotoController::index
 * @see app/Http/Controllers/PhotoController.php:25
 * @route '/photos'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PhotoController::index
 * @see app/Http/Controllers/PhotoController.php:25
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
 * @see app/Http/Controllers/PhotoController.php:55
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
 * @see app/Http/Controllers/PhotoController.php:55
 * @route '/photos'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoController::store
 * @see app/Http/Controllers/PhotoController.php:55
 * @route '/photos'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PhotoController::store
 * @see app/Http/Controllers/PhotoController.php:55
 * @route '/photos'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PhotoController::store
 * @see app/Http/Controllers/PhotoController.php:55
 * @route '/photos'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\PhotoController::setPrimary
 * @see app/Http/Controllers/PhotoController.php:118
 * @route '/photos/{photo}/primary'
 */
export const setPrimary = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setPrimary.url(args, options),
    method: 'post',
})

setPrimary.definition = {
    methods: ["post"],
    url: '/photos/{photo}/primary',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PhotoController::setPrimary
 * @see app/Http/Controllers/PhotoController.php:118
 * @route '/photos/{photo}/primary'
 */
setPrimary.url = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return setPrimary.definition.url
            .replace('{photo}', parsedArgs.photo.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoController::setPrimary
 * @see app/Http/Controllers/PhotoController.php:118
 * @route '/photos/{photo}/primary'
 */
setPrimary.post = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setPrimary.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PhotoController::setPrimary
 * @see app/Http/Controllers/PhotoController.php:118
 * @route '/photos/{photo}/primary'
 */
    const setPrimaryForm = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: setPrimary.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PhotoController::setPrimary
 * @see app/Http/Controllers/PhotoController.php:118
 * @route '/photos/{photo}/primary'
 */
        setPrimaryForm.post = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: setPrimary.url(args, options),
            method: 'post',
        })
    
    setPrimary.form = setPrimaryForm
/**
* @see \App\Http\Controllers\PhotoController::requestAvatar
 * @see app/Http/Controllers/PhotoController.php:159
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
 * @see app/Http/Controllers/PhotoController.php:159
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
 * @see app/Http/Controllers/PhotoController.php:159
 * @route '/photos/{photo}/request-avatar'
 */
requestAvatar.post = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestAvatar.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PhotoController::requestAvatar
 * @see app/Http/Controllers/PhotoController.php:159
 * @route '/photos/{photo}/request-avatar'
 */
    const requestAvatarForm = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: requestAvatar.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PhotoController::requestAvatar
 * @see app/Http/Controllers/PhotoController.php:159
 * @route '/photos/{photo}/request-avatar'
 */
        requestAvatarForm.post = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: requestAvatar.url(args, options),
            method: 'post',
        })
    
    requestAvatar.form = requestAvatarForm
/**
* @see \App\Http\Controllers\PhotoController::destroy
 * @see app/Http/Controllers/PhotoController.php:192
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
 * @see app/Http/Controllers/PhotoController.php:192
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
 * @see app/Http/Controllers/PhotoController.php:192
 * @route '/photos/{photo}'
 */
destroy.delete = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\PhotoController::destroy
 * @see app/Http/Controllers/PhotoController.php:192
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
 * @see app/Http/Controllers/PhotoController.php:192
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
/**
* @see \App\Http\Controllers\PhotoController::pending
 * @see app/Http/Controllers/PhotoController.php:222
 * @route '/admin/photos/pending'
 */
export const pending = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(options),
    method: 'get',
})

pending.definition = {
    methods: ["get","head"],
    url: '/admin/photos/pending',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PhotoController::pending
 * @see app/Http/Controllers/PhotoController.php:222
 * @route '/admin/photos/pending'
 */
pending.url = (options?: RouteQueryOptions) => {
    return pending.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoController::pending
 * @see app/Http/Controllers/PhotoController.php:222
 * @route '/admin/photos/pending'
 */
pending.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PhotoController::pending
 * @see app/Http/Controllers/PhotoController.php:222
 * @route '/admin/photos/pending'
 */
pending.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pending.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PhotoController::pending
 * @see app/Http/Controllers/PhotoController.php:222
 * @route '/admin/photos/pending'
 */
    const pendingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pending.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PhotoController::pending
 * @see app/Http/Controllers/PhotoController.php:222
 * @route '/admin/photos/pending'
 */
        pendingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pending.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PhotoController::pending
 * @see app/Http/Controllers/PhotoController.php:222
 * @route '/admin/photos/pending'
 */
        pendingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pending.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    pending.form = pendingForm
/**
* @see \App\Http\Controllers\PhotoController::approve
 * @see app/Http/Controllers/PhotoController.php:249
 * @route '/admin/photos/{photo}/approve'
 */
export const approve = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/photos/{photo}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PhotoController::approve
 * @see app/Http/Controllers/PhotoController.php:249
 * @route '/admin/photos/{photo}/approve'
 */
approve.url = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return approve.definition.url
            .replace('{photo}', parsedArgs.photo.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoController::approve
 * @see app/Http/Controllers/PhotoController.php:249
 * @route '/admin/photos/{photo}/approve'
 */
approve.post = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PhotoController::approve
 * @see app/Http/Controllers/PhotoController.php:249
 * @route '/admin/photos/{photo}/approve'
 */
    const approveForm = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PhotoController::approve
 * @see app/Http/Controllers/PhotoController.php:249
 * @route '/admin/photos/{photo}/approve'
 */
        approveForm.post = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\PhotoController::reject
 * @see app/Http/Controllers/PhotoController.php:278
 * @route '/admin/photos/{photo}/reject'
 */
export const reject = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/admin/photos/{photo}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PhotoController::reject
 * @see app/Http/Controllers/PhotoController.php:278
 * @route '/admin/photos/{photo}/reject'
 */
reject.url = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return reject.definition.url
            .replace('{photo}', parsedArgs.photo.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoController::reject
 * @see app/Http/Controllers/PhotoController.php:278
 * @route '/admin/photos/{photo}/reject'
 */
reject.post = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PhotoController::reject
 * @see app/Http/Controllers/PhotoController.php:278
 * @route '/admin/photos/{photo}/reject'
 */
    const rejectForm = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PhotoController::reject
 * @see app/Http/Controllers/PhotoController.php:278
 * @route '/admin/photos/{photo}/reject'
 */
        rejectForm.post = (args: { photo: number | { id: number } } | [photo: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
const PhotoController = { index, store, setPrimary, requestAvatar, destroy, pending, approve, reject }

export default PhotoController