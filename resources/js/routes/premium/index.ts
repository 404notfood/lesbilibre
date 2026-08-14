import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import checkout from './checkout'
/**
* @see \App\Http\Controllers\PremiumController::index
 * @see app/Http/Controllers/PremiumController.php:22
 * @route '/premium'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/premium',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PremiumController::index
 * @see app/Http/Controllers/PremiumController.php:22
 * @route '/premium'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PremiumController::index
 * @see app/Http/Controllers/PremiumController.php:22
 * @route '/premium'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PremiumController::index
 * @see app/Http/Controllers/PremiumController.php:22
 * @route '/premium'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PremiumController::index
 * @see app/Http/Controllers/PremiumController.php:22
 * @route '/premium'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PremiumController::index
 * @see app/Http/Controllers/PremiumController.php:22
 * @route '/premium'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PremiumController::index
 * @see app/Http/Controllers/PremiumController.php:22
 * @route '/premium'
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
* @see \App\Http\Controllers\PremiumController::subscribe
 * @see app/Http/Controllers/PremiumController.php:121
 * @route '/premium/subscribe'
 */
export const subscribe = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: subscribe.url(options),
    method: 'post',
})

subscribe.definition = {
    methods: ["post"],
    url: '/premium/subscribe',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PremiumController::subscribe
 * @see app/Http/Controllers/PremiumController.php:121
 * @route '/premium/subscribe'
 */
subscribe.url = (options?: RouteQueryOptions) => {
    return subscribe.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PremiumController::subscribe
 * @see app/Http/Controllers/PremiumController.php:121
 * @route '/premium/subscribe'
 */
subscribe.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: subscribe.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PremiumController::subscribe
 * @see app/Http/Controllers/PremiumController.php:121
 * @route '/premium/subscribe'
 */
    const subscribeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: subscribe.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PremiumController::subscribe
 * @see app/Http/Controllers/PremiumController.php:121
 * @route '/premium/subscribe'
 */
        subscribeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: subscribe.url(options),
            method: 'post',
        })
    
    subscribe.form = subscribeForm
/**
* @see \App\Http\Controllers\PremiumController::billingPortal
 * @see app/Http/Controllers/PremiumController.php:188
 * @route '/premium/billing-portal'
 */
export const billingPortal = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: billingPortal.url(options),
    method: 'post',
})

billingPortal.definition = {
    methods: ["post"],
    url: '/premium/billing-portal',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PremiumController::billingPortal
 * @see app/Http/Controllers/PremiumController.php:188
 * @route '/premium/billing-portal'
 */
billingPortal.url = (options?: RouteQueryOptions) => {
    return billingPortal.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PremiumController::billingPortal
 * @see app/Http/Controllers/PremiumController.php:188
 * @route '/premium/billing-portal'
 */
billingPortal.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: billingPortal.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PremiumController::billingPortal
 * @see app/Http/Controllers/PremiumController.php:188
 * @route '/premium/billing-portal'
 */
    const billingPortalForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: billingPortal.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PremiumController::billingPortal
 * @see app/Http/Controllers/PremiumController.php:188
 * @route '/premium/billing-portal'
 */
        billingPortalForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: billingPortal.url(options),
            method: 'post',
        })
    
    billingPortal.form = billingPortalForm
const premium = {
    index: Object.assign(index, index),
subscribe: Object.assign(subscribe, subscribe),
checkout: Object.assign(checkout, checkout),
billingPortal: Object.assign(billingPortal, billingPortal),
}

export default premium