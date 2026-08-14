import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ShopController::send
 * @see app/Http/Controllers/ShopController.php:122
 * @route '/shop/gifts/send'
 */
export const send = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/shop/gifts/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ShopController::send
 * @see app/Http/Controllers/ShopController.php:122
 * @route '/shop/gifts/send'
 */
send.url = (options?: RouteQueryOptions) => {
    return send.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShopController::send
 * @see app/Http/Controllers/ShopController.php:122
 * @route '/shop/gifts/send'
 */
send.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ShopController::send
 * @see app/Http/Controllers/ShopController.php:122
 * @route '/shop/gifts/send'
 */
    const sendForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: send.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ShopController::send
 * @see app/Http/Controllers/ShopController.php:122
 * @route '/shop/gifts/send'
 */
        sendForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: send.url(options),
            method: 'post',
        })
    
    send.form = sendForm
const gifts = {
    send: Object.assign(send, send),
}

export default gifts