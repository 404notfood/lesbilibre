import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BlockController::index
 * @see app/Http/Controllers/BlockController.php:20
 * @route '/blocked-users'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/blocked-users',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BlockController::index
 * @see app/Http/Controllers/BlockController.php:20
 * @route '/blocked-users'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BlockController::index
 * @see app/Http/Controllers/BlockController.php:20
 * @route '/blocked-users'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BlockController::index
 * @see app/Http/Controllers/BlockController.php:20
 * @route '/blocked-users'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BlockController::index
 * @see app/Http/Controllers/BlockController.php:20
 * @route '/blocked-users'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BlockController::index
 * @see app/Http/Controllers/BlockController.php:20
 * @route '/blocked-users'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BlockController::index
 * @see app/Http/Controllers/BlockController.php:20
 * @route '/blocked-users'
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
* @see \App\Http\Controllers\BlockController::store
 * @see app/Http/Controllers/BlockController.php:53
 * @route '/block/{userId}'
 */
export const store = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/block/{userId}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BlockController::store
 * @see app/Http/Controllers/BlockController.php:53
 * @route '/block/{userId}'
 */
store.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { userId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    userId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        userId: args.userId,
                }

    return store.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BlockController::store
 * @see app/Http/Controllers/BlockController.php:53
 * @route '/block/{userId}'
 */
store.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BlockController::store
 * @see app/Http/Controllers/BlockController.php:53
 * @route '/block/{userId}'
 */
    const storeForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BlockController::store
 * @see app/Http/Controllers/BlockController.php:53
 * @route '/block/{userId}'
 */
        storeForm.post = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\BlockController::destroy
 * @see app/Http/Controllers/BlockController.php:107
 * @route '/block/{blockId}'
 */
export const destroy = (args: { blockId: string | number } | [blockId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/block/{blockId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\BlockController::destroy
 * @see app/Http/Controllers/BlockController.php:107
 * @route '/block/{blockId}'
 */
destroy.url = (args: { blockId: string | number } | [blockId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { blockId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    blockId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        blockId: args.blockId,
                }

    return destroy.definition.url
            .replace('{blockId}', parsedArgs.blockId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BlockController::destroy
 * @see app/Http/Controllers/BlockController.php:107
 * @route '/block/{blockId}'
 */
destroy.delete = (args: { blockId: string | number } | [blockId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\BlockController::destroy
 * @see app/Http/Controllers/BlockController.php:107
 * @route '/block/{blockId}'
 */
    const destroyForm = (args: { blockId: string | number } | [blockId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BlockController::destroy
 * @see app/Http/Controllers/BlockController.php:107
 * @route '/block/{blockId}'
 */
        destroyForm.delete = (args: { blockId: string | number } | [blockId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const BlockController = { index, store, destroy }

export default BlockController