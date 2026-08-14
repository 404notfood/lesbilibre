import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ShopController::index
 * @see app/Http/Controllers/ShopController.php:17
 * @route '/shop'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/shop',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ShopController::index
 * @see app/Http/Controllers/ShopController.php:17
 * @route '/shop'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShopController::index
 * @see app/Http/Controllers/ShopController.php:17
 * @route '/shop'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ShopController::index
 * @see app/Http/Controllers/ShopController.php:17
 * @route '/shop'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ShopController::index
 * @see app/Http/Controllers/ShopController.php:17
 * @route '/shop'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ShopController::index
 * @see app/Http/Controllers/ShopController.php:17
 * @route '/shop'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ShopController::index
 * @see app/Http/Controllers/ShopController.php:17
 * @route '/shop'
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
* @see \App\Http\Controllers\ShopController::purchaseGems
 * @see app/Http/Controllers/ShopController.php:61
 * @route '/shop/gems/purchase'
 */
export const purchaseGems = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: purchaseGems.url(options),
    method: 'post',
})

purchaseGems.definition = {
    methods: ["post"],
    url: '/shop/gems/purchase',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ShopController::purchaseGems
 * @see app/Http/Controllers/ShopController.php:61
 * @route '/shop/gems/purchase'
 */
purchaseGems.url = (options?: RouteQueryOptions) => {
    return purchaseGems.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShopController::purchaseGems
 * @see app/Http/Controllers/ShopController.php:61
 * @route '/shop/gems/purchase'
 */
purchaseGems.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: purchaseGems.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ShopController::purchaseGems
 * @see app/Http/Controllers/ShopController.php:61
 * @route '/shop/gems/purchase'
 */
    const purchaseGemsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: purchaseGems.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ShopController::purchaseGems
 * @see app/Http/Controllers/ShopController.php:61
 * @route '/shop/gems/purchase'
 */
        purchaseGemsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: purchaseGems.url(options),
            method: 'post',
        })
    
    purchaseGems.form = purchaseGemsForm
/**
* @see \App\Http\Controllers\ShopController::sendGift
 * @see app/Http/Controllers/ShopController.php:129
 * @route '/shop/gifts/send'
 */
export const sendGift = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendGift.url(options),
    method: 'post',
})

sendGift.definition = {
    methods: ["post"],
    url: '/shop/gifts/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ShopController::sendGift
 * @see app/Http/Controllers/ShopController.php:129
 * @route '/shop/gifts/send'
 */
sendGift.url = (options?: RouteQueryOptions) => {
    return sendGift.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShopController::sendGift
 * @see app/Http/Controllers/ShopController.php:129
 * @route '/shop/gifts/send'
 */
sendGift.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendGift.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ShopController::sendGift
 * @see app/Http/Controllers/ShopController.php:129
 * @route '/shop/gifts/send'
 */
    const sendGiftForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: sendGift.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ShopController::sendGift
 * @see app/Http/Controllers/ShopController.php:129
 * @route '/shop/gifts/send'
 */
        sendGiftForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: sendGift.url(options),
            method: 'post',
        })
    
    sendGift.form = sendGiftForm
/**
* @see \App\Http\Controllers\ShopController::checkoutSuccess
 * @see app/Http/Controllers/ShopController.php:103
 * @route '/shop/checkout/success'
 */
export const checkoutSuccess = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkoutSuccess.url(options),
    method: 'get',
})

checkoutSuccess.definition = {
    methods: ["get","head"],
    url: '/shop/checkout/success',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ShopController::checkoutSuccess
 * @see app/Http/Controllers/ShopController.php:103
 * @route '/shop/checkout/success'
 */
checkoutSuccess.url = (options?: RouteQueryOptions) => {
    return checkoutSuccess.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShopController::checkoutSuccess
 * @see app/Http/Controllers/ShopController.php:103
 * @route '/shop/checkout/success'
 */
checkoutSuccess.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkoutSuccess.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ShopController::checkoutSuccess
 * @see app/Http/Controllers/ShopController.php:103
 * @route '/shop/checkout/success'
 */
checkoutSuccess.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkoutSuccess.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ShopController::checkoutSuccess
 * @see app/Http/Controllers/ShopController.php:103
 * @route '/shop/checkout/success'
 */
    const checkoutSuccessForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: checkoutSuccess.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ShopController::checkoutSuccess
 * @see app/Http/Controllers/ShopController.php:103
 * @route '/shop/checkout/success'
 */
        checkoutSuccessForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: checkoutSuccess.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ShopController::checkoutSuccess
 * @see app/Http/Controllers/ShopController.php:103
 * @route '/shop/checkout/success'
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
* @see \App\Http\Controllers\ShopController::checkoutCancel
 * @see app/Http/Controllers/ShopController.php:124
 * @route '/shop/checkout/cancel'
 */
export const checkoutCancel = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkoutCancel.url(options),
    method: 'get',
})

checkoutCancel.definition = {
    methods: ["get","head"],
    url: '/shop/checkout/cancel',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ShopController::checkoutCancel
 * @see app/Http/Controllers/ShopController.php:124
 * @route '/shop/checkout/cancel'
 */
checkoutCancel.url = (options?: RouteQueryOptions) => {
    return checkoutCancel.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShopController::checkoutCancel
 * @see app/Http/Controllers/ShopController.php:124
 * @route '/shop/checkout/cancel'
 */
checkoutCancel.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkoutCancel.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ShopController::checkoutCancel
 * @see app/Http/Controllers/ShopController.php:124
 * @route '/shop/checkout/cancel'
 */
checkoutCancel.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkoutCancel.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ShopController::checkoutCancel
 * @see app/Http/Controllers/ShopController.php:124
 * @route '/shop/checkout/cancel'
 */
    const checkoutCancelForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: checkoutCancel.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ShopController::checkoutCancel
 * @see app/Http/Controllers/ShopController.php:124
 * @route '/shop/checkout/cancel'
 */
        checkoutCancelForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: checkoutCancel.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ShopController::checkoutCancel
 * @see app/Http/Controllers/ShopController.php:124
 * @route '/shop/checkout/cancel'
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
const ShopController = { index, purchaseGems, sendGift, checkoutSuccess, checkoutCancel }

export default ShopController