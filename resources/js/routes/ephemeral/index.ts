import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\EphemeralMediaController::store
 * @see app/Http/Controllers/EphemeralMediaController.php:29
 * @route '/conversations/{conversation}/ephemeral'
 */
export const store = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/conversations/{conversation}/ephemeral',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EphemeralMediaController::store
 * @see app/Http/Controllers/EphemeralMediaController.php:29
 * @route '/conversations/{conversation}/ephemeral'
 */
store.url = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversation: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { conversation: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    conversation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        conversation: typeof args.conversation === 'object'
                ? args.conversation.id
                : args.conversation,
                }

    return store.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EphemeralMediaController::store
 * @see app/Http/Controllers/EphemeralMediaController.php:29
 * @route '/conversations/{conversation}/ephemeral'
 */
store.post = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\EphemeralMediaController::store
 * @see app/Http/Controllers/EphemeralMediaController.php:29
 * @route '/conversations/{conversation}/ephemeral'
 */
    const storeForm = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EphemeralMediaController::store
 * @see app/Http/Controllers/EphemeralMediaController.php:29
 * @route '/conversations/{conversation}/ephemeral'
 */
        storeForm.post = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\EphemeralMediaController::show
 * @see app/Http/Controllers/EphemeralMediaController.php:68
 * @route '/ephemeral/{medium}'
 */
export const show = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/ephemeral/{medium}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\EphemeralMediaController::show
 * @see app/Http/Controllers/EphemeralMediaController.php:68
 * @route '/ephemeral/{medium}'
 */
show.url = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { medium: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { medium: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    medium: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        medium: typeof args.medium === 'object'
                ? args.medium.id
                : args.medium,
                }

    return show.definition.url
            .replace('{medium}', parsedArgs.medium.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EphemeralMediaController::show
 * @see app/Http/Controllers/EphemeralMediaController.php:68
 * @route '/ephemeral/{medium}'
 */
show.get = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\EphemeralMediaController::show
 * @see app/Http/Controllers/EphemeralMediaController.php:68
 * @route '/ephemeral/{medium}'
 */
show.head = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\EphemeralMediaController::show
 * @see app/Http/Controllers/EphemeralMediaController.php:68
 * @route '/ephemeral/{medium}'
 */
    const showForm = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\EphemeralMediaController::show
 * @see app/Http/Controllers/EphemeralMediaController.php:68
 * @route '/ephemeral/{medium}'
 */
        showForm.get = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\EphemeralMediaController::show
 * @see app/Http/Controllers/EphemeralMediaController.php:68
 * @route '/ephemeral/{medium}'
 */
        showForm.head = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\EphemeralMediaController::report
 * @see app/Http/Controllers/EphemeralMediaController.php:108
 * @route '/ephemeral/{medium}/report'
 */
export const report = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: report.url(args, options),
    method: 'post',
})

report.definition = {
    methods: ["post"],
    url: '/ephemeral/{medium}/report',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EphemeralMediaController::report
 * @see app/Http/Controllers/EphemeralMediaController.php:108
 * @route '/ephemeral/{medium}/report'
 */
report.url = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { medium: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { medium: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    medium: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        medium: typeof args.medium === 'object'
                ? args.medium.id
                : args.medium,
                }

    return report.definition.url
            .replace('{medium}', parsedArgs.medium.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EphemeralMediaController::report
 * @see app/Http/Controllers/EphemeralMediaController.php:108
 * @route '/ephemeral/{medium}/report'
 */
report.post = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: report.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\EphemeralMediaController::report
 * @see app/Http/Controllers/EphemeralMediaController.php:108
 * @route '/ephemeral/{medium}/report'
 */
    const reportForm = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: report.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EphemeralMediaController::report
 * @see app/Http/Controllers/EphemeralMediaController.php:108
 * @route '/ephemeral/{medium}/report'
 */
        reportForm.post = (args: { medium: number | { id: number } } | [medium: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: report.url(args, options),
            method: 'post',
        })
    
    report.form = reportForm
const ephemeral = {
    store: Object.assign(store, store),
show: Object.assign(show, show),
report: Object.assign(report, report),
}

export default ephemeral