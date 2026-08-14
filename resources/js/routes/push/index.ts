import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\PushSubscriptionController::subscribe
 * @see app/Http/Controllers/PushSubscriptionController.php:11
 * @route '/push/subscribe'
 */
export const subscribe = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: subscribe.url(options),
    method: 'post',
})

subscribe.definition = {
    methods: ["post"],
    url: '/push/subscribe',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PushSubscriptionController::subscribe
 * @see app/Http/Controllers/PushSubscriptionController.php:11
 * @route '/push/subscribe'
 */
subscribe.url = (options?: RouteQueryOptions) => {
    return subscribe.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PushSubscriptionController::subscribe
 * @see app/Http/Controllers/PushSubscriptionController.php:11
 * @route '/push/subscribe'
 */
subscribe.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: subscribe.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PushSubscriptionController::subscribe
 * @see app/Http/Controllers/PushSubscriptionController.php:11
 * @route '/push/subscribe'
 */
    const subscribeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: subscribe.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PushSubscriptionController::subscribe
 * @see app/Http/Controllers/PushSubscriptionController.php:11
 * @route '/push/subscribe'
 */
        subscribeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: subscribe.url(options),
            method: 'post',
        })
    
    subscribe.form = subscribeForm
/**
* @see \App\Http\Controllers\PushSubscriptionController::unsubscribe
 * @see app/Http/Controllers/PushSubscriptionController.php:35
 * @route '/push/unsubscribe'
 */
export const unsubscribe = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unsubscribe.url(options),
    method: 'post',
})

unsubscribe.definition = {
    methods: ["post"],
    url: '/push/unsubscribe',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PushSubscriptionController::unsubscribe
 * @see app/Http/Controllers/PushSubscriptionController.php:35
 * @route '/push/unsubscribe'
 */
unsubscribe.url = (options?: RouteQueryOptions) => {
    return unsubscribe.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PushSubscriptionController::unsubscribe
 * @see app/Http/Controllers/PushSubscriptionController.php:35
 * @route '/push/unsubscribe'
 */
unsubscribe.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unsubscribe.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PushSubscriptionController::unsubscribe
 * @see app/Http/Controllers/PushSubscriptionController.php:35
 * @route '/push/unsubscribe'
 */
    const unsubscribeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unsubscribe.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PushSubscriptionController::unsubscribe
 * @see app/Http/Controllers/PushSubscriptionController.php:35
 * @route '/push/unsubscribe'
 */
        unsubscribeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unsubscribe.url(options),
            method: 'post',
        })
    
    unsubscribe.form = unsubscribeForm
/**
* @see \App\Http\Controllers\PushSubscriptionController::vapidKey
 * @see app/Http/Controllers/PushSubscriptionController.php:49
 * @route '/push/vapid-key'
 */
export const vapidKey = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vapidKey.url(options),
    method: 'get',
})

vapidKey.definition = {
    methods: ["get","head"],
    url: '/push/vapid-key',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PushSubscriptionController::vapidKey
 * @see app/Http/Controllers/PushSubscriptionController.php:49
 * @route '/push/vapid-key'
 */
vapidKey.url = (options?: RouteQueryOptions) => {
    return vapidKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PushSubscriptionController::vapidKey
 * @see app/Http/Controllers/PushSubscriptionController.php:49
 * @route '/push/vapid-key'
 */
vapidKey.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vapidKey.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PushSubscriptionController::vapidKey
 * @see app/Http/Controllers/PushSubscriptionController.php:49
 * @route '/push/vapid-key'
 */
vapidKey.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: vapidKey.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PushSubscriptionController::vapidKey
 * @see app/Http/Controllers/PushSubscriptionController.php:49
 * @route '/push/vapid-key'
 */
    const vapidKeyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: vapidKey.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PushSubscriptionController::vapidKey
 * @see app/Http/Controllers/PushSubscriptionController.php:49
 * @route '/push/vapid-key'
 */
        vapidKeyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vapidKey.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PushSubscriptionController::vapidKey
 * @see app/Http/Controllers/PushSubscriptionController.php:49
 * @route '/push/vapid-key'
 */
        vapidKeyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vapidKey.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    vapidKey.form = vapidKeyForm
const push = {
    subscribe: Object.assign(subscribe, subscribe),
unsubscribe: Object.assign(unsubscribe, unsubscribe),
vapidKey: Object.assign(vapidKey, vapidKey),
}

export default push