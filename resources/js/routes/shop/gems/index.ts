import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ShopController::purchase
 * @see app/Http/Controllers/ShopController.php:61
 * @route '/shop/gems/purchase'
 */
export const purchase = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: purchase.url(options),
    method: 'post',
})

purchase.definition = {
    methods: ["post"],
    url: '/shop/gems/purchase',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ShopController::purchase
 * @see app/Http/Controllers/ShopController.php:61
 * @route '/shop/gems/purchase'
 */
purchase.url = (options?: RouteQueryOptions) => {
    return purchase.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShopController::purchase
 * @see app/Http/Controllers/ShopController.php:61
 * @route '/shop/gems/purchase'
 */
purchase.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: purchase.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ShopController::purchase
 * @see app/Http/Controllers/ShopController.php:61
 * @route '/shop/gems/purchase'
 */
    const purchaseForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: purchase.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ShopController::purchase
 * @see app/Http/Controllers/ShopController.php:61
 * @route '/shop/gems/purchase'
 */
        purchaseForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: purchase.url(options),
            method: 'post',
        })
    
    purchase.form = purchaseForm
const gems = {
    purchase: Object.assign(purchase, purchase),
}

export default gems