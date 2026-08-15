import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
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
 * @see app/Http/Controllers/PremiumController.php:130
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
 * @see app/Http/Controllers/PremiumController.php:130
 * @route '/premium/subscribe'
 */
subscribe.url = (options?: RouteQueryOptions) => {
    return subscribe.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PremiumController::subscribe
 * @see app/Http/Controllers/PremiumController.php:130
 * @route '/premium/subscribe'
 */
subscribe.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: subscribe.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PremiumController::subscribe
 * @see app/Http/Controllers/PremiumController.php:130
 * @route '/premium/subscribe'
 */
    const subscribeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: subscribe.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PremiumController::subscribe
 * @see app/Http/Controllers/PremiumController.php:130
 * @route '/premium/subscribe'
 */
        subscribeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: subscribe.url(options),
            method: 'post',
        })
    
    subscribe.form = subscribeForm
/**
* @see \App\Http\Controllers\PremiumController::checkoutSuccess
 * @see app/Http/Controllers/PremiumController.php:170
 * @route '/premium/checkout/success'
 */
export const checkoutSuccess = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkoutSuccess.url(options),
    method: 'get',
})

checkoutSuccess.definition = {
    methods: ["get","head"],
    url: '/premium/checkout/success',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PremiumController::checkoutSuccess
 * @see app/Http/Controllers/PremiumController.php:170
 * @route '/premium/checkout/success'
 */
checkoutSuccess.url = (options?: RouteQueryOptions) => {
    return checkoutSuccess.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PremiumController::checkoutSuccess
 * @see app/Http/Controllers/PremiumController.php:170
 * @route '/premium/checkout/success'
 */
checkoutSuccess.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkoutSuccess.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PremiumController::checkoutSuccess
 * @see app/Http/Controllers/PremiumController.php:170
 * @route '/premium/checkout/success'
 */
checkoutSuccess.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkoutSuccess.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PremiumController::checkoutSuccess
 * @see app/Http/Controllers/PremiumController.php:170
 * @route '/premium/checkout/success'
 */
    const checkoutSuccessForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: checkoutSuccess.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PremiumController::checkoutSuccess
 * @see app/Http/Controllers/PremiumController.php:170
 * @route '/premium/checkout/success'
 */
        checkoutSuccessForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: checkoutSuccess.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PremiumController::checkoutSuccess
 * @see app/Http/Controllers/PremiumController.php:170
 * @route '/premium/checkout/success'
 */
        checkoutSuccessForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: checkoutSuccess.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    checkoutSuccess.form = checkoutSuccessForm
/**
* @see \App\Http\Controllers\PremiumController::checkoutCancel
 * @see app/Http/Controllers/PremiumController.php:191
 * @route '/premium/checkout/cancel'
 */
export const checkoutCancel = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkoutCancel.url(options),
    method: 'get',
})

checkoutCancel.definition = {
    methods: ["get","head"],
    url: '/premium/checkout/cancel',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PremiumController::checkoutCancel
 * @see app/Http/Controllers/PremiumController.php:191
 * @route '/premium/checkout/cancel'
 */
checkoutCancel.url = (options?: RouteQueryOptions) => {
    return checkoutCancel.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PremiumController::checkoutCancel
 * @see app/Http/Controllers/PremiumController.php:191
 * @route '/premium/checkout/cancel'
 */
checkoutCancel.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkoutCancel.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PremiumController::checkoutCancel
 * @see app/Http/Controllers/PremiumController.php:191
 * @route '/premium/checkout/cancel'
 */
checkoutCancel.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkoutCancel.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PremiumController::checkoutCancel
 * @see app/Http/Controllers/PremiumController.php:191
 * @route '/premium/checkout/cancel'
 */
    const checkoutCancelForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: checkoutCancel.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PremiumController::checkoutCancel
 * @see app/Http/Controllers/PremiumController.php:191
 * @route '/premium/checkout/cancel'
 */
        checkoutCancelForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: checkoutCancel.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PremiumController::checkoutCancel
 * @see app/Http/Controllers/PremiumController.php:191
 * @route '/premium/checkout/cancel'
 */
        checkoutCancelForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: checkoutCancel.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    checkoutCancel.form = checkoutCancelForm
/**
* @see \App\Http\Controllers\PremiumController::billingPortal
 * @see app/Http/Controllers/PremiumController.php:197
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
 * @see app/Http/Controllers/PremiumController.php:197
 * @route '/premium/billing-portal'
 */
billingPortal.url = (options?: RouteQueryOptions) => {
    return billingPortal.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PremiumController::billingPortal
 * @see app/Http/Controllers/PremiumController.php:197
 * @route '/premium/billing-portal'
 */
billingPortal.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: billingPortal.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PremiumController::billingPortal
 * @see app/Http/Controllers/PremiumController.php:197
 * @route '/premium/billing-portal'
 */
    const billingPortalForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: billingPortal.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PremiumController::billingPortal
 * @see app/Http/Controllers/PremiumController.php:197
 * @route '/premium/billing-portal'
 */
        billingPortalForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: billingPortal.url(options),
            method: 'post',
        })
    
    billingPortal.form = billingPortalForm
/**
* @see \App\Http\Controllers\PremiumController::cancel
 * @see app/Http/Controllers/PremiumController.php:222
 * @route '/premium/cancel'
 */
export const cancel = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/premium/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PremiumController::cancel
 * @see app/Http/Controllers/PremiumController.php:222
 * @route '/premium/cancel'
 */
cancel.url = (options?: RouteQueryOptions) => {
    return cancel.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PremiumController::cancel
 * @see app/Http/Controllers/PremiumController.php:222
 * @route '/premium/cancel'
 */
cancel.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PremiumController::cancel
 * @see app/Http/Controllers/PremiumController.php:222
 * @route '/premium/cancel'
 */
    const cancelForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: cancel.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PremiumController::cancel
 * @see app/Http/Controllers/PremiumController.php:222
 * @route '/premium/cancel'
 */
        cancelForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: cancel.url(options),
            method: 'post',
        })
    
    cancel.form = cancelForm
const PremiumController = { index, subscribe, checkoutSuccess, checkoutCancel, billingPortal, cancel }

export default PremiumController