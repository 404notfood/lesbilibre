import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\LikeController::store
 * @see app/Http/Controllers/LikeController.php:20
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
 * @see app/Http/Controllers/LikeController.php:20
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
 * @see app/Http/Controllers/LikeController.php:20
 * @route '/likes/{userId}'
 */
store.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LikeController::store
 * @see app/Http/Controllers/LikeController.php:20
 * @route '/likes/{userId}'
 */
    const storeForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LikeController::store
 * @see app/Http/Controllers/LikeController.php:20
 * @route '/likes/{userId}'
 */
        storeForm.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\LikeController::destroy
 * @see app/Http/Controllers/LikeController.php:85
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
 * @see app/Http/Controllers/LikeController.php:85
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
 * @see app/Http/Controllers/LikeController.php:85
 * @route '/likes/{userId}'
 */
destroy.delete = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\LikeController::destroy
 * @see app/Http/Controllers/LikeController.php:85
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
 * @see app/Http/Controllers/LikeController.php:85
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
/**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:105
 * @route '/likes/received'
 */
export const received = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: received.url(options),
    method: 'get',
})

received.definition = {
    methods: ["get","head"],
    url: '/likes/received',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:105
 * @route '/likes/received'
 */
received.url = (options?: RouteQueryOptions) => {
    return received.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:105
 * @route '/likes/received'
 */
received.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: received.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:105
 * @route '/likes/received'
 */
received.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: received.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:105
 * @route '/likes/received'
 */
    const receivedForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: received.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:105
 * @route '/likes/received'
 */
        receivedForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: received.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LikeController::received
 * @see app/Http/Controllers/LikeController.php:105
 * @route '/likes/received'
 */
        receivedForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: received.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    received.form = receivedForm
const LikeController = { store, destroy, received }

export default LikeController