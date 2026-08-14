import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\StripeWebhookController::stripe
 * @see app/Http/Controllers/StripeWebhookController.php:25
 * @route '/webhook/stripe'
 */
export const stripe = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stripe.url(options),
    method: 'post',
})

stripe.definition = {
    methods: ["post"],
    url: '/webhook/stripe',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripeWebhookController::stripe
 * @see app/Http/Controllers/StripeWebhookController.php:25
 * @route '/webhook/stripe'
 */
stripe.url = (options?: RouteQueryOptions) => {
    return stripe.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripeWebhookController::stripe
 * @see app/Http/Controllers/StripeWebhookController.php:25
 * @route '/webhook/stripe'
 */
stripe.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stripe.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\StripeWebhookController::stripe
 * @see app/Http/Controllers/StripeWebhookController.php:25
 * @route '/webhook/stripe'
 */
    const stripeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: stripe.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\StripeWebhookController::stripe
 * @see app/Http/Controllers/StripeWebhookController.php:25
 * @route '/webhook/stripe'
 */
        stripeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: stripe.url(options),
            method: 'post',
        })
    
    stripe.form = stripeForm
const webhook = {
    stripe: Object.assign(stripe, stripe),
}

export default webhook