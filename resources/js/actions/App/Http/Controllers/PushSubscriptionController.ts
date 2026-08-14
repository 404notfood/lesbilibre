import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PushSubscriptionController::store
 * @see app/Http/Controllers/PushSubscriptionController.php:11
 * @route '/push/subscribe'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/push/subscribe',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PushSubscriptionController::store
 * @see app/Http/Controllers/PushSubscriptionController.php:11
 * @route '/push/subscribe'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PushSubscriptionController::store
 * @see app/Http/Controllers/PushSubscriptionController.php:11
 * @route '/push/subscribe'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PushSubscriptionController::store
 * @see app/Http/Controllers/PushSubscriptionController.php:11
 * @route '/push/subscribe'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PushSubscriptionController::store
 * @see app/Http/Controllers/PushSubscriptionController.php:11
 * @route '/push/subscribe'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\PushSubscriptionController::destroy
 * @see app/Http/Controllers/PushSubscriptionController.php:35
 * @route '/push/unsubscribe'
 */
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: destroy.url(options),
    method: 'post',
})

destroy.definition = {
    methods: ["post"],
    url: '/push/unsubscribe',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PushSubscriptionController::destroy
 * @see app/Http/Controllers/PushSubscriptionController.php:35
 * @route '/push/unsubscribe'
 */
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PushSubscriptionController::destroy
 * @see app/Http/Controllers/PushSubscriptionController.php:35
 * @route '/push/unsubscribe'
 */
destroy.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: destroy.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PushSubscriptionController::destroy
 * @see app/Http/Controllers/PushSubscriptionController.php:35
 * @route '/push/unsubscribe'
 */
    const destroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PushSubscriptionController::destroy
 * @see app/Http/Controllers/PushSubscriptionController.php:35
 * @route '/push/unsubscribe'
 */
        destroyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(options),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\PushSubscriptionController::vapidPublicKey
 * @see app/Http/Controllers/PushSubscriptionController.php:49
 * @route '/push/vapid-key'
 */
export const vapidPublicKey = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vapidPublicKey.url(options),
    method: 'get',
})

vapidPublicKey.definition = {
    methods: ["get","head"],
    url: '/push/vapid-key',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PushSubscriptionController::vapidPublicKey
 * @see app/Http/Controllers/PushSubscriptionController.php:49
 * @route '/push/vapid-key'
 */
vapidPublicKey.url = (options?: RouteQueryOptions) => {
    return vapidPublicKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PushSubscriptionController::vapidPublicKey
 * @see app/Http/Controllers/PushSubscriptionController.php:49
 * @route '/push/vapid-key'
 */
vapidPublicKey.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vapidPublicKey.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PushSubscriptionController::vapidPublicKey
 * @see app/Http/Controllers/PushSubscriptionController.php:49
 * @route '/push/vapid-key'
 */
vapidPublicKey.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: vapidPublicKey.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PushSubscriptionController::vapidPublicKey
 * @see app/Http/Controllers/PushSubscriptionController.php:49
 * @route '/push/vapid-key'
 */
    const vapidPublicKeyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: vapidPublicKey.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PushSubscriptionController::vapidPublicKey
 * @see app/Http/Controllers/PushSubscriptionController.php:49
 * @route '/push/vapid-key'
 */
        vapidPublicKeyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vapidPublicKey.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PushSubscriptionController::vapidPublicKey
 * @see app/Http/Controllers/PushSubscriptionController.php:49
 * @route '/push/vapid-key'
 */
        vapidPublicKeyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vapidPublicKey.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    vapidPublicKey.form = vapidPublicKeyForm
const PushSubscriptionController = { store, destroy, vapidPublicKey }

export default PushSubscriptionController