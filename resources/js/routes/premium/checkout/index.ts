import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PremiumController::success
 * @see app/Http/Controllers/PremiumController.php:161
 * @route '/premium/checkout/success'
 */
export const success = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: success.url(options),
    method: 'get',
})

success.definition = {
    methods: ["get","head"],
    url: '/premium/checkout/success',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PremiumController::success
 * @see app/Http/Controllers/PremiumController.php:161
 * @route '/premium/checkout/success'
 */
success.url = (options?: RouteQueryOptions) => {
    return success.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PremiumController::success
 * @see app/Http/Controllers/PremiumController.php:161
 * @route '/premium/checkout/success'
 */
success.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: success.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PremiumController::success
 * @see app/Http/Controllers/PremiumController.php:161
 * @route '/premium/checkout/success'
 */
success.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: success.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PremiumController::success
 * @see app/Http/Controllers/PremiumController.php:161
 * @route '/premium/checkout/success'
 */
    const successForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: success.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PremiumController::success
 * @see app/Http/Controllers/PremiumController.php:161
 * @route '/premium/checkout/success'
 */
        successForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: success.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PremiumController::success
 * @see app/Http/Controllers/PremiumController.php:161
 * @route '/premium/checkout/success'
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
* @see \App\Http\Controllers\PremiumController::cancel
 * @see app/Http/Controllers/PremiumController.php:182
 * @route '/premium/checkout/cancel'
 */
export const cancel = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cancel.url(options),
    method: 'get',
})

cancel.definition = {
    methods: ["get","head"],
    url: '/premium/checkout/cancel',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PremiumController::cancel
 * @see app/Http/Controllers/PremiumController.php:182
 * @route '/premium/checkout/cancel'
 */
cancel.url = (options?: RouteQueryOptions) => {
    return cancel.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PremiumController::cancel
 * @see app/Http/Controllers/PremiumController.php:182
 * @route '/premium/checkout/cancel'
 */
cancel.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cancel.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PremiumController::cancel
 * @see app/Http/Controllers/PremiumController.php:182
 * @route '/premium/checkout/cancel'
 */
cancel.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: cancel.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PremiumController::cancel
 * @see app/Http/Controllers/PremiumController.php:182
 * @route '/premium/checkout/cancel'
 */
    const cancelForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: cancel.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PremiumController::cancel
 * @see app/Http/Controllers/PremiumController.php:182
 * @route '/premium/checkout/cancel'
 */
        cancelForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: cancel.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PremiumController::cancel
 * @see app/Http/Controllers/PremiumController.php:182
 * @route '/premium/checkout/cancel'
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