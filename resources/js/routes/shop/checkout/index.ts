import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ShopController::success
 * @see app/Http/Controllers/ShopController.php:108
 * @route '/shop/checkout/success'
 */
export const success = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: success.url(options),
    method: 'get',
})

success.definition = {
    methods: ["get","head"],
    url: '/shop/checkout/success',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ShopController::success
 * @see app/Http/Controllers/ShopController.php:108
 * @route '/shop/checkout/success'
 */
success.url = (options?: RouteQueryOptions) => {
    return success.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShopController::success
 * @see app/Http/Controllers/ShopController.php:108
 * @route '/shop/checkout/success'
 */
success.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: success.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ShopController::success
 * @see app/Http/Controllers/ShopController.php:108
 * @route '/shop/checkout/success'
 */
success.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: success.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ShopController::success
 * @see app/Http/Controllers/ShopController.php:108
 * @route '/shop/checkout/success'
 */
    const successForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: success.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ShopController::success
 * @see app/Http/Controllers/ShopController.php:108
 * @route '/shop/checkout/success'
 */
        successForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: success.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ShopController::success
 * @see app/Http/Controllers/ShopController.php:108
 * @route '/shop/checkout/success'
 */
        successForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: success.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    success.form = successForm
/**
* @see \App\Http\Controllers\ShopController::cancel
 * @see app/Http/Controllers/ShopController.php:129
 * @route '/shop/checkout/cancel'
 */
export const cancel = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cancel.url(options),
    method: 'get',
})

cancel.definition = {
    methods: ["get","head"],
    url: '/shop/checkout/cancel',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ShopController::cancel
 * @see app/Http/Controllers/ShopController.php:129
 * @route '/shop/checkout/cancel'
 */
cancel.url = (options?: RouteQueryOptions) => {
    return cancel.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShopController::cancel
 * @see app/Http/Controllers/ShopController.php:129
 * @route '/shop/checkout/cancel'
 */
cancel.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cancel.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ShopController::cancel
 * @see app/Http/Controllers/ShopController.php:129
 * @route '/shop/checkout/cancel'
 */
cancel.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: cancel.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ShopController::cancel
 * @see app/Http/Controllers/ShopController.php:129
 * @route '/shop/checkout/cancel'
 */
    const cancelForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: cancel.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ShopController::cancel
 * @see app/Http/Controllers/ShopController.php:129
 * @route '/shop/checkout/cancel'
 */
        cancelForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: cancel.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ShopController::cancel
 * @see app/Http/Controllers/ShopController.php:129
 * @route '/shop/checkout/cancel'
 */
        cancelForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: cancel.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    cancel.form = cancelForm
const checkout = {
    success: Object.assign(success, success),
cancel: Object.assign(cancel, cancel),
}

export default checkout