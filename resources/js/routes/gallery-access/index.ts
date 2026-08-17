import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\GalleryAccessController::index
 * @see app/Http/Controllers/GalleryAccessController.php:20
 * @route '/gallery-access'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/gallery-access',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GalleryAccessController::index
 * @see app/Http/Controllers/GalleryAccessController.php:20
 * @route '/gallery-access'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GalleryAccessController::index
 * @see app/Http/Controllers/GalleryAccessController.php:20
 * @route '/gallery-access'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\GalleryAccessController::index
 * @see app/Http/Controllers/GalleryAccessController.php:20
 * @route '/gallery-access'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\GalleryAccessController::index
 * @see app/Http/Controllers/GalleryAccessController.php:20
 * @route '/gallery-access'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\GalleryAccessController::index
 * @see app/Http/Controllers/GalleryAccessController.php:20
 * @route '/gallery-access'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\GalleryAccessController::index
 * @see app/Http/Controllers/GalleryAccessController.php:20
 * @route '/gallery-access'
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
* @see \App\Http\Controllers\GalleryAccessController::manage
 * @see app/Http/Controllers/GalleryAccessController.php:139
 * @route '/gallery-access/manage'
 */
export const manage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manage.url(options),
    method: 'get',
})

manage.definition = {
    methods: ["get","head"],
    url: '/gallery-access/manage',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GalleryAccessController::manage
 * @see app/Http/Controllers/GalleryAccessController.php:139
 * @route '/gallery-access/manage'
 */
manage.url = (options?: RouteQueryOptions) => {
    return manage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GalleryAccessController::manage
 * @see app/Http/Controllers/GalleryAccessController.php:139
 * @route '/gallery-access/manage'
 */
manage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manage.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\GalleryAccessController::manage
 * @see app/Http/Controllers/GalleryAccessController.php:139
 * @route '/gallery-access/manage'
 */
manage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: manage.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\GalleryAccessController::manage
 * @see app/Http/Controllers/GalleryAccessController.php:139
 * @route '/gallery-access/manage'
 */
    const manageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: manage.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\GalleryAccessController::manage
 * @see app/Http/Controllers/GalleryAccessController.php:139
 * @route '/gallery-access/manage'
 */
        manageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: manage.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\GalleryAccessController::manage
 * @see app/Http/Controllers/GalleryAccessController.php:139
 * @route '/gallery-access/manage'
 */
        manageForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: manage.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    manage.form = manageForm
/**
* @see \App\Http\Controllers\GalleryAccessController::request
 * @see app/Http/Controllers/GalleryAccessController.php:48
 * @route '/gallery-access/request/{userId}'
 */
export const request = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: request.url(args, options),
    method: 'post',
})

request.definition = {
    methods: ["post"],
    url: '/gallery-access/request/{userId}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\GalleryAccessController::request
 * @see app/Http/Controllers/GalleryAccessController.php:48
 * @route '/gallery-access/request/{userId}'
 */
request.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { userId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    userId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        userId: args.userId,
                }

    return request.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GalleryAccessController::request
 * @see app/Http/Controllers/GalleryAccessController.php:48
 * @route '/gallery-access/request/{userId}'
 */
request.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: request.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\GalleryAccessController::request
 * @see app/Http/Controllers/GalleryAccessController.php:48
 * @route '/gallery-access/request/{userId}'
 */
    const requestForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: request.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\GalleryAccessController::request
 * @see app/Http/Controllers/GalleryAccessController.php:48
 * @route '/gallery-access/request/{userId}'
 */
        requestForm.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: request.url(args, options),
            method: 'post',
        })
    
    request.form = requestForm
/**
* @see \App\Http\Controllers\GalleryAccessController::accept
 * @see app/Http/Controllers/GalleryAccessController.php:97
 * @route '/gallery-access/{requestId}/accept'
 */
export const accept = (args: { requestId: string | number } | [requestId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

accept.definition = {
    methods: ["post"],
    url: '/gallery-access/{requestId}/accept',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\GalleryAccessController::accept
 * @see app/Http/Controllers/GalleryAccessController.php:97
 * @route '/gallery-access/{requestId}/accept'
 */
accept.url = (args: { requestId: string | number } | [requestId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { requestId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    requestId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        requestId: args.requestId,
                }

    return accept.definition.url
            .replace('{requestId}', parsedArgs.requestId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GalleryAccessController::accept
 * @see app/Http/Controllers/GalleryAccessController.php:97
 * @route '/gallery-access/{requestId}/accept'
 */
accept.post = (args: { requestId: string | number } | [requestId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\GalleryAccessController::accept
 * @see app/Http/Controllers/GalleryAccessController.php:97
 * @route '/gallery-access/{requestId}/accept'
 */
    const acceptForm = (args: { requestId: string | number } | [requestId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: accept.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\GalleryAccessController::accept
 * @see app/Http/Controllers/GalleryAccessController.php:97
 * @route '/gallery-access/{requestId}/accept'
 */
        acceptForm.post = (args: { requestId: string | number } | [requestId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: accept.url(args, options),
            method: 'post',
        })
    
    accept.form = acceptForm
/**
* @see \App\Http\Controllers\GalleryAccessController::reject
 * @see app/Http/Controllers/GalleryAccessController.php:118
 * @route '/gallery-access/{requestId}/reject'
 */
export const reject = (args: { requestId: string | number } | [requestId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/gallery-access/{requestId}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\GalleryAccessController::reject
 * @see app/Http/Controllers/GalleryAccessController.php:118
 * @route '/gallery-access/{requestId}/reject'
 */
reject.url = (args: { requestId: string | number } | [requestId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { requestId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    requestId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        requestId: args.requestId,
                }

    return reject.definition.url
            .replace('{requestId}', parsedArgs.requestId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GalleryAccessController::reject
 * @see app/Http/Controllers/GalleryAccessController.php:118
 * @route '/gallery-access/{requestId}/reject'
 */
reject.post = (args: { requestId: string | number } | [requestId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\GalleryAccessController::reject
 * @see app/Http/Controllers/GalleryAccessController.php:118
 * @route '/gallery-access/{requestId}/reject'
 */
    const rejectForm = (args: { requestId: string | number } | [requestId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\GalleryAccessController::reject
 * @see app/Http/Controllers/GalleryAccessController.php:118
 * @route '/gallery-access/{requestId}/reject'
 */
        rejectForm.post = (args: { requestId: string | number } | [requestId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
/**
* @see \App\Http\Controllers\GalleryAccessController::grant
 * @see app/Http/Controllers/GalleryAccessController.php:168
 * @route '/gallery-access/grant/{userId}'
 */
export const grant = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: grant.url(args, options),
    method: 'post',
})

grant.definition = {
    methods: ["post"],
    url: '/gallery-access/grant/{userId}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\GalleryAccessController::grant
 * @see app/Http/Controllers/GalleryAccessController.php:168
 * @route '/gallery-access/grant/{userId}'
 */
grant.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { userId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    userId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        userId: args.userId,
                }

    return grant.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GalleryAccessController::grant
 * @see app/Http/Controllers/GalleryAccessController.php:168
 * @route '/gallery-access/grant/{userId}'
 */
grant.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: grant.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\GalleryAccessController::grant
 * @see app/Http/Controllers/GalleryAccessController.php:168
 * @route '/gallery-access/grant/{userId}'
 */
    const grantForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: grant.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\GalleryAccessController::grant
 * @see app/Http/Controllers/GalleryAccessController.php:168
 * @route '/gallery-access/grant/{userId}'
 */
        grantForm.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: grant.url(args, options),
            method: 'post',
        })
    
    grant.form = grantForm
/**
* @see \App\Http\Controllers\GalleryAccessController::revoke
 * @see app/Http/Controllers/GalleryAccessController.php:203
 * @route '/gallery-access/{requestId}'
 */
export const revoke = (args: { requestId: string | number } | [requestId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revoke.url(args, options),
    method: 'delete',
})

revoke.definition = {
    methods: ["delete"],
    url: '/gallery-access/{requestId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\GalleryAccessController::revoke
 * @see app/Http/Controllers/GalleryAccessController.php:203
 * @route '/gallery-access/{requestId}'
 */
revoke.url = (args: { requestId: string | number } | [requestId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { requestId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    requestId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        requestId: args.requestId,
                }

    return revoke.definition.url
            .replace('{requestId}', parsedArgs.requestId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GalleryAccessController::revoke
 * @see app/Http/Controllers/GalleryAccessController.php:203
 * @route '/gallery-access/{requestId}'
 */
revoke.delete = (args: { requestId: string | number } | [requestId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revoke.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\GalleryAccessController::revoke
 * @see app/Http/Controllers/GalleryAccessController.php:203
 * @route '/gallery-access/{requestId}'
 */
    const revokeForm = (args: { requestId: string | number } | [requestId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: revoke.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\GalleryAccessController::revoke
 * @see app/Http/Controllers/GalleryAccessController.php:203
 * @route '/gallery-access/{requestId}'
 */
        revokeForm.delete = (args: { requestId: string | number } | [requestId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: revoke.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    revoke.form = revokeForm
const galleryAccess = {
    index: Object.assign(index, index),
manage: Object.assign(manage, manage),
request: Object.assign(request, request),
accept: Object.assign(accept, accept),
reject: Object.assign(reject, reject),
grant: Object.assign(grant, grant),
revoke: Object.assign(revoke, revoke),
}

export default galleryAccess