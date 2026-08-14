import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \Laravel\Fortify\Http\Controllers\EmailVerificationPromptController::notice
 * @see vendor/laravel/fortify/src/Http/Controllers/EmailVerificationPromptController.php:18
 * @route '/email/verify'
 */
export const notice = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notice.url(options),
    method: 'get',
})

notice.definition = {
    methods: ["get","head"],
    url: '/email/verify',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\EmailVerificationPromptController::notice
 * @see vendor/laravel/fortify/src/Http/Controllers/EmailVerificationPromptController.php:18
 * @route '/email/verify'
 */
notice.url = (options?: RouteQueryOptions) => {
    return notice.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\EmailVerificationPromptController::notice
 * @see vendor/laravel/fortify/src/Http/Controllers/EmailVerificationPromptController.php:18
 * @route '/email/verify'
 */
notice.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notice.url(options),
    method: 'get',
})
/**
* @see \Laravel\Fortify\Http\Controllers\EmailVerificationPromptController::notice
 * @see vendor/laravel/fortify/src/Http/Controllers/EmailVerificationPromptController.php:18
 * @route '/email/verify'
 */
notice.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: notice.url(options),
    method: 'head',
})

    /**
* @see \Laravel\Fortify\Http\Controllers\EmailVerificationPromptController::notice
 * @see vendor/laravel/fortify/src/Http/Controllers/EmailVerificationPromptController.php:18
 * @route '/email/verify'
 */
    const noticeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: notice.url(options),
        method: 'get',
    })

            /**
* @see \Laravel\Fortify\Http\Controllers\EmailVerificationPromptController::notice
 * @see vendor/laravel/fortify/src/Http/Controllers/EmailVerificationPromptController.php:18
 * @route '/email/verify'
 */
        noticeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notice.url(options),
            method: 'get',
        })
            /**
* @see \Laravel\Fortify\Http\Controllers\EmailVerificationPromptController::notice
 * @see vendor/laravel/fortify/src/Http/Controllers/EmailVerificationPromptController.php:18
 * @route '/email/verify'
 */
        noticeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notice.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    notice.form = noticeForm
/**
* @see \Laravel\Fortify\Http\Controllers\VerifyEmailController::verify
 * @see vendor/laravel/fortify/src/Http/Controllers/VerifyEmailController.php:18
 * @route '/email/verify/{id}/{hash}'
 */
export const verify = (args: { id: string | number, hash: string | number } | [id: string | number, hash: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verify.url(args, options),
    method: 'get',
})

verify.definition = {
    methods: ["get","head"],
    url: '/email/verify/{id}/{hash}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\VerifyEmailController::verify
 * @see vendor/laravel/fortify/src/Http/Controllers/VerifyEmailController.php:18
 * @route '/email/verify/{id}/{hash}'
 */
verify.url = (args: { id: string | number, hash: string | number } | [id: string | number, hash: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                    hash: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                                hash: args.hash,
                }

    return verify.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace('{hash}', parsedArgs.hash.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\VerifyEmailController::verify
 * @see vendor/laravel/fortify/src/Http/Controllers/VerifyEmailController.php:18
 * @route '/email/verify/{id}/{hash}'
 */
verify.get = (args: { id: string | number, hash: string | number } | [id: string | number, hash: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verify.url(args, options),
    method: 'get',
})
/**
* @see \Laravel\Fortify\Http\Controllers\VerifyEmailController::verify
 * @see vendor/laravel/fortify/src/Http/Controllers/VerifyEmailController.php:18
 * @route '/email/verify/{id}/{hash}'
 */
verify.head = (args: { id: string | number, hash: string | number } | [id: string | number, hash: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verify.url(args, options),
    method: 'head',
})

    /**
* @see \Laravel\Fortify\Http\Controllers\VerifyEmailController::verify
 * @see vendor/laravel/fortify/src/Http/Controllers/VerifyEmailController.php:18
 * @route '/email/verify/{id}/{hash}'
 */
    const verifyForm = (args: { id: string | number, hash: string | number } | [id: string | number, hash: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: verify.url(args, options),
        method: 'get',
    })

            /**
* @see \Laravel\Fortify\Http\Controllers\VerifyEmailController::verify
 * @see vendor/laravel/fortify/src/Http/Controllers/VerifyEmailController.php:18
 * @route '/email/verify/{id}/{hash}'
 */
        verifyForm.get = (args: { id: string | number, hash: string | number } | [id: string | number, hash: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verify.url(args, options),
            method: 'get',
        })
            /**
* @see \Laravel\Fortify\Http\Controllers\VerifyEmailController::verify
 * @see vendor/laravel/fortify/src/Http/Controllers/VerifyEmailController.php:18
 * @route '/email/verify/{id}/{hash}'
 */
        verifyForm.head = (args: { id: string | number, hash: string | number } | [id: string | number, hash: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verify.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    verify.form = verifyForm
/**
* @see \Laravel\Fortify\Http\Controllers\EmailVerificationNotificationController::send
 * @see vendor/laravel/fortify/src/Http/Controllers/EmailVerificationNotificationController.php:19
 * @route '/email/verification-notification'
 */
export const send = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/email/verification-notification',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Fortify\Http\Controllers\EmailVerificationNotificationController::send
 * @see vendor/laravel/fortify/src/Http/Controllers/EmailVerificationNotificationController.php:19
 * @route '/email/verification-notification'
 */
send.url = (options?: RouteQueryOptions) => {
    return send.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\EmailVerificationNotificationController::send
 * @see vendor/laravel/fortify/src/Http/Controllers/EmailVerificationNotificationController.php:19
 * @route '/email/verification-notification'
 */
send.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

    /**
* @see \Laravel\Fortify\Http\Controllers\EmailVerificationNotificationController::send
 * @see vendor/laravel/fortify/src/Http/Controllers/EmailVerificationNotificationController.php:19
 * @route '/email/verification-notification'
 */
    const sendForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: send.url(options),
        method: 'post',
    })

            /**
* @see \Laravel\Fortify\Http\Controllers\EmailVerificationNotificationController::send
 * @see vendor/laravel/fortify/src/Http/Controllers/EmailVerificationNotificationController.php:19
 * @route '/email/verification-notification'
 */
        sendForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: send.url(options),
            method: 'post',
        })
    
    send.form = sendForm
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
 * @see app/Http/Controllers/VerificationController.php:37
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
 * @see app/Http/Controllers/VerificationController.php:37
 * @route '/verification'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VerificationController::store
 * @see app/Http/Controllers/VerificationController.php:37
 * @route '/verification'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\VerificationController::store
 * @see app/Http/Controllers/VerificationController.php:37
 * @route '/verification'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VerificationController::store
 * @see app/Http/Controllers/VerificationController.php:37
 * @route '/verification'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
const verification = {
    notice: Object.assign(notice, notice),
verify: Object.assign(verify, verify),
send: Object.assign(send, send),
create: Object.assign(create, create),
store: Object.assign(store, store),
}

export default verification