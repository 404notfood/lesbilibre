import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\VerificationController::create
 * @see app/Http/Controllers/VerificationController.php:23
 * @route '/verification'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/verification',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VerificationController::create
 * @see app/Http/Controllers/VerificationController.php:23
 * @route '/verification'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VerificationController::create
 * @see app/Http/Controllers/VerificationController.php:23
 * @route '/verification'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VerificationController::create
 * @see app/Http/Controllers/VerificationController.php:23
 * @route '/verification'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VerificationController::create
 * @see app/Http/Controllers/VerificationController.php:23
 * @route '/verification'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VerificationController::create
 * @see app/Http/Controllers/VerificationController.php:23
 * @route '/verification'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VerificationController::create
 * @see app/Http/Controllers/VerificationController.php:23
 * @route '/verification'
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
* @see \App\Http\Controllers\VerificationController::store
 * @see app/Http/Controllers/VerificationController.php:45
 * @route '/verification'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/verification',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VerificationController::store
 * @see app/Http/Controllers/VerificationController.php:45
 * @route '/verification'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VerificationController::store
 * @see app/Http/Controllers/VerificationController.php:45
 * @route '/verification'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\VerificationController::store
 * @see app/Http/Controllers/VerificationController.php:45
 * @route '/verification'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VerificationController::store
 * @see app/Http/Controllers/VerificationController.php:45
 * @route '/verification'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\VerificationController::index
 * @see app/Http/Controllers/VerificationController.php:107
 * @route '/admin/verifications'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/verifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VerificationController::index
 * @see app/Http/Controllers/VerificationController.php:107
 * @route '/admin/verifications'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VerificationController::index
 * @see app/Http/Controllers/VerificationController.php:107
 * @route '/admin/verifications'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VerificationController::index
 * @see app/Http/Controllers/VerificationController.php:107
 * @route '/admin/verifications'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VerificationController::index
 * @see app/Http/Controllers/VerificationController.php:107
 * @route '/admin/verifications'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VerificationController::index
 * @see app/Http/Controllers/VerificationController.php:107
 * @route '/admin/verifications'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VerificationController::index
 * @see app/Http/Controllers/VerificationController.php:107
 * @route '/admin/verifications'
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
* @see \App\Http\Controllers\VerificationController::image
 * @see app/Http/Controllers/VerificationController.php:131
 * @route '/admin/verifications/{verification}/image'
 */
export const image = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: image.url(args, options),
    method: 'get',
})

image.definition = {
    methods: ["get","head"],
    url: '/admin/verifications/{verification}/image',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VerificationController::image
 * @see app/Http/Controllers/VerificationController.php:131
 * @route '/admin/verifications/{verification}/image'
 */
image.url = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { verification: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { verification: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    verification: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        verification: typeof args.verification === 'object'
                ? args.verification.id
                : args.verification,
                }

    return image.definition.url
            .replace('{verification}', parsedArgs.verification.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VerificationController::image
 * @see app/Http/Controllers/VerificationController.php:131
 * @route '/admin/verifications/{verification}/image'
 */
image.get = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: image.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VerificationController::image
 * @see app/Http/Controllers/VerificationController.php:131
 * @route '/admin/verifications/{verification}/image'
 */
image.head = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: image.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VerificationController::image
 * @see app/Http/Controllers/VerificationController.php:131
 * @route '/admin/verifications/{verification}/image'
 */
    const imageForm = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: image.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VerificationController::image
 * @see app/Http/Controllers/VerificationController.php:131
 * @route '/admin/verifications/{verification}/image'
 */
        imageForm.get = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: image.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VerificationController::image
 * @see app/Http/Controllers/VerificationController.php:131
 * @route '/admin/verifications/{verification}/image'
 */
        imageForm.head = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: image.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    image.form = imageForm
/**
* @see \App\Http\Controllers\VerificationController::approve
 * @see app/Http/Controllers/VerificationController.php:146
 * @route '/admin/verifications/{verification}/approve'
 */
export const approve = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/verifications/{verification}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VerificationController::approve
 * @see app/Http/Controllers/VerificationController.php:146
 * @route '/admin/verifications/{verification}/approve'
 */
approve.url = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { verification: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { verification: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    verification: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        verification: typeof args.verification === 'object'
                ? args.verification.id
                : args.verification,
                }

    return approve.definition.url
            .replace('{verification}', parsedArgs.verification.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VerificationController::approve
 * @see app/Http/Controllers/VerificationController.php:146
 * @route '/admin/verifications/{verification}/approve'
 */
approve.post = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\VerificationController::approve
 * @see app/Http/Controllers/VerificationController.php:146
 * @route '/admin/verifications/{verification}/approve'
 */
    const approveForm = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VerificationController::approve
 * @see app/Http/Controllers/VerificationController.php:146
 * @route '/admin/verifications/{verification}/approve'
 */
        approveForm.post = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\VerificationController::reject
 * @see app/Http/Controllers/VerificationController.php:174
 * @route '/admin/verifications/{verification}/reject'
 */
export const reject = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/admin/verifications/{verification}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VerificationController::reject
 * @see app/Http/Controllers/VerificationController.php:174
 * @route '/admin/verifications/{verification}/reject'
 */
reject.url = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { verification: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { verification: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    verification: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        verification: typeof args.verification === 'object'
                ? args.verification.id
                : args.verification,
                }

    return reject.definition.url
            .replace('{verification}', parsedArgs.verification.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VerificationController::reject
 * @see app/Http/Controllers/VerificationController.php:174
 * @route '/admin/verifications/{verification}/reject'
 */
reject.post = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\VerificationController::reject
 * @see app/Http/Controllers/VerificationController.php:174
 * @route '/admin/verifications/{verification}/reject'
 */
    const rejectForm = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VerificationController::reject
 * @see app/Http/Controllers/VerificationController.php:174
 * @route '/admin/verifications/{verification}/reject'
 */
        rejectForm.post = (args: { verification: number | { id: number } } | [verification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
const VerificationController = { create, store, index, image, approve, reject }

export default VerificationController