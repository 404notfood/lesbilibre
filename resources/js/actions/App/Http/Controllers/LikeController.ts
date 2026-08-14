import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:121
 * @route '/likes'
 */
const received48c63a6c1cf2ccf66254d35c4c555b2d = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: received48c63a6c1cf2ccf66254d35c4c555b2d.url(options),
    method: 'get',
})

received48c63a6c1cf2ccf66254d35c4c555b2d.definition = {
    methods: ["get","head"],
    url: '/likes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:121
 * @route '/likes'
 */
received48c63a6c1cf2ccf66254d35c4c555b2d.url = (options?: RouteQueryOptions) => {
    return received48c63a6c1cf2ccf66254d35c4c555b2d.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:121
 * @route '/likes'
 */
received48c63a6c1cf2ccf66254d35c4c555b2d.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: received48c63a6c1cf2ccf66254d35c4c555b2d.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:121
 * @route '/likes'
 */
received48c63a6c1cf2ccf66254d35c4c555b2d.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: received48c63a6c1cf2ccf66254d35c4c555b2d.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:121
 * @route '/likes'
 */
    const received48c63a6c1cf2ccf66254d35c4c555b2dForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: received48c63a6c1cf2ccf66254d35c4c555b2d.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:121
 * @route '/likes'
 */
        received48c63a6c1cf2ccf66254d35c4c555b2dForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: received48c63a6c1cf2ccf66254d35c4c555b2d.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:121
 * @route '/likes'
 */
        received48c63a6c1cf2ccf66254d35c4c555b2dForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: received48c63a6c1cf2ccf66254d35c4c555b2d.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    received48c63a6c1cf2ccf66254d35c4c555b2d.form = received48c63a6c1cf2ccf66254d35c4c555b2dForm
    /**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:121
 * @route '/likes/received'
 */
const received00b082b1ac797ec196f59dcca38aacac = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: received00b082b1ac797ec196f59dcca38aacac.url(options),
    method: 'get',
})

received00b082b1ac797ec196f59dcca38aacac.definition = {
    methods: ["get","head"],
    url: '/likes/received',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:121
 * @route '/likes/received'
 */
received00b082b1ac797ec196f59dcca38aacac.url = (options?: RouteQueryOptions) => {
    return received00b082b1ac797ec196f59dcca38aacac.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:121
 * @route '/likes/received'
 */
received00b082b1ac797ec196f59dcca38aacac.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: received00b082b1ac797ec196f59dcca38aacac.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:121
 * @route '/likes/received'
 */
received00b082b1ac797ec196f59dcca38aacac.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: received00b082b1ac797ec196f59dcca38aacac.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:121
 * @route '/likes/received'
 */
    const received00b082b1ac797ec196f59dcca38aacacForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: received00b082b1ac797ec196f59dcca38aacac.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:121
 * @route '/likes/received'
 */
        received00b082b1ac797ec196f59dcca38aacacForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: received00b082b1ac797ec196f59dcca38aacac.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:121
 * @route '/likes/received'
 */
        received00b082b1ac797ec196f59dcca38aacacForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: received00b082b1ac797ec196f59dcca38aacac.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    received00b082b1ac797ec196f59dcca38aacac.form = received00b082b1ac797ec196f59dcca38aacacForm

export const received = {
    '/likes': received48c63a6c1cf2ccf66254d35c4c555b2d,
    '/likes/received': received00b082b1ac797ec196f59dcca38aacac,
}

/**
* @see \App\Http\Controllers\LikeController::store
 * @see app/Http/Controllers/LikeController.php:21
 * @route '/likes/{userId}'
 */
export const store = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/likes/{userId}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LikeController::store
 * @see app/Http/Controllers/LikeController.php:21
 * @route '/likes/{userId}'
 */
store.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LikeController::store
 * @see app/Http/Controllers/LikeController.php:21
 * @route '/likes/{userId}'
 */
store.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LikeController::store
 * @see app/Http/Controllers/LikeController.php:21
 * @route '/likes/{userId}'
 */
    const storeForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LikeController::store
 * @see app/Http/Controllers/LikeController.php:21
 * @route '/likes/{userId}'
 */
        storeForm.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\LikeController::destroy
 * @see app/Http/Controllers/LikeController.php:101
 * @route '/likes/{userId}'
 */
export const destroy = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/likes/{userId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\LikeController::destroy
 * @see app/Http/Controllers/LikeController.php:101
 * @route '/likes/{userId}'
 */
destroy.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LikeController::destroy
 * @see app/Http/Controllers/LikeController.php:101
 * @route '/likes/{userId}'
 */
destroy.delete = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\LikeController::destroy
 * @see app/Http/Controllers/LikeController.php:101
 * @route '/likes/{userId}'
 */
    const destroyForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LikeController::destroy
 * @see app/Http/Controllers/LikeController.php:101
 * @route '/likes/{userId}'
 */
        destroyForm.delete = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const LikeController = { received, store, destroy }

export default LikeController