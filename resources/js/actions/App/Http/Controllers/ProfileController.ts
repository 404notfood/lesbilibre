import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ProfileController::show
 * @see app/Http/Controllers/ProfileController.php:17
 * @route '/profile'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProfileController::show
 * @see app/Http/Controllers/ProfileController.php:17
 * @route '/profile'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProfileController::show
 * @see app/Http/Controllers/ProfileController.php:17
 * @route '/profile'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProfileController::show
 * @see app/Http/Controllers/ProfileController.php:17
 * @route '/profile'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ProfileController::show
 * @see app/Http/Controllers/ProfileController.php:17
 * @route '/profile'
 */
    const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ProfileController::show
 * @see app/Http/Controllers/ProfileController.php:17
 * @route '/profile'
 */
        showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ProfileController::show
 * @see app/Http/Controllers/ProfileController.php:17
 * @route '/profile'
 */
        showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\ProfileController::edit
 * @see app/Http/Controllers/ProfileController.php:31
 * @route '/profile/edit'
 */
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/profile/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProfileController::edit
 * @see app/Http/Controllers/ProfileController.php:31
 * @route '/profile/edit'
 */
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProfileController::edit
 * @see app/Http/Controllers/ProfileController.php:31
 * @route '/profile/edit'
 */
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProfileController::edit
 * @see app/Http/Controllers/ProfileController.php:31
 * @route '/profile/edit'
 */
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ProfileController::edit
 * @see app/Http/Controllers/ProfileController.php:31
 * @route '/profile/edit'
 */
    const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ProfileController::edit
 * @see app/Http/Controllers/ProfileController.php:31
 * @route '/profile/edit'
 */
        editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ProfileController::edit
 * @see app/Http/Controllers/ProfileController.php:31
 * @route '/profile/edit'
 */
        editForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
/**
* @see \App\Http\Controllers\ProfileController::update
 * @see app/Http/Controllers/ProfileController.php:53
 * @route '/profile'
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/profile',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ProfileController::update
 * @see app/Http/Controllers/ProfileController.php:53
 * @route '/profile'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProfileController::update
 * @see app/Http/Controllers/ProfileController.php:53
 * @route '/profile'
 */
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\ProfileController::update
 * @see app/Http/Controllers/ProfileController.php:53
 * @route '/profile'
 */
    const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ProfileController::update
 * @see app/Http/Controllers/ProfileController.php:53
 * @route '/profile'
 */
        updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\ProfileController::view
 * @see app/Http/Controllers/ProfileController.php:80
 * @route '/profile/{userId}'
 */
export const view = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(args, options),
    method: 'get',
})

view.definition = {
    methods: ["get","head"],
    url: '/profile/{userId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProfileController::view
 * @see app/Http/Controllers/ProfileController.php:80
 * @route '/profile/{userId}'
 */
view.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return view.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProfileController::view
 * @see app/Http/Controllers/ProfileController.php:80
 * @route '/profile/{userId}'
 */
view.get = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProfileController::view
 * @see app/Http/Controllers/ProfileController.php:80
 * @route '/profile/{userId}'
 */
view.head = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: view.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ProfileController::view
 * @see app/Http/Controllers/ProfileController.php:80
 * @route '/profile/{userId}'
 */
    const viewForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: view.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ProfileController::view
 * @see app/Http/Controllers/ProfileController.php:80
 * @route '/profile/{userId}'
 */
        viewForm.get = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: view.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ProfileController::view
 * @see app/Http/Controllers/ProfileController.php:80
 * @route '/profile/{userId}'
 */
        viewForm.head = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: view.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    view.form = viewForm
const ProfileController = { show, edit, update, view }

export default ProfileController