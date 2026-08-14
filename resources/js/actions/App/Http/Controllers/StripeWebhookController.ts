import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\StripeWebhookController::handle
 * @see app/Http/Controllers/StripeWebhookController.php:24
 * @route '/webhook/stripe'
 */
export const handle = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(options),
    method: 'post',
})

handle.definition = {
    methods: ["post"],
    url: '/webhook/stripe',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripeWebhookController::handle
 * @see app/Http/Controllers/StripeWebhookController.php:24
 * @route '/webhook/stripe'
 */
handle.url = (options?: RouteQueryOptions) => {
    return handle.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripeWebhookController::handle
 * @see app/Http/Controllers/StripeWebhookController.php:24
 * @route '/webhook/stripe'
 */
handle.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\StripeWebhookController::handle
 * @see app/Http/Controllers/StripeWebhookController.php:24
 * @route '/webhook/stripe'
 */
    const handleForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: handle.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\StripeWebhookController::handle
 * @see app/Http/Controllers/StripeWebhookController.php:24
 * @route '/webhook/stripe'
 */
        handleForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: handle.url(options),
            method: 'post',
        })
    
    handle.form = handleForm
const StripeWebhookController = { handle }

export default StripeWebhookController