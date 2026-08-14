import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DataPrivacyController::index
 * @see app/Http/Controllers/DataPrivacyController.php:27
 * @route '/settings/privacy'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/privacy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DataPrivacyController::index
 * @see app/Http/Controllers/DataPrivacyController.php:27
 * @route '/settings/privacy'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DataPrivacyController::index
 * @see app/Http/Controllers/DataPrivacyController.php:27
 * @route '/settings/privacy'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DataPrivacyController::index
 * @see app/Http/Controllers/DataPrivacyController.php:27
 * @route '/settings/privacy'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DataPrivacyController::index
 * @see app/Http/Controllers/DataPrivacyController.php:27
 * @route '/settings/privacy'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DataPrivacyController::index
 * @see app/Http/Controllers/DataPrivacyController.php:27
 * @route '/settings/privacy'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DataPrivacyController::index
 * @see app/Http/Controllers/DataPrivacyController.php:27
 * @route '/settings/privacy'
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
* @see \App\Http\Controllers\DataPrivacyController::exportMethod
 * @see app/Http/Controllers/DataPrivacyController.php:43
 * @route '/settings/data-export'
 */
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/settings/data-export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DataPrivacyController::exportMethod
 * @see app/Http/Controllers/DataPrivacyController.php:43
 * @route '/settings/data-export'
 */
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DataPrivacyController::exportMethod
 * @see app/Http/Controllers/DataPrivacyController.php:43
 * @route '/settings/data-export'
 */
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DataPrivacyController::exportMethod
 * @see app/Http/Controllers/DataPrivacyController.php:43
 * @route '/settings/data-export'
 */
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DataPrivacyController::exportMethod
 * @see app/Http/Controllers/DataPrivacyController.php:43
 * @route '/settings/data-export'
 */
    const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: exportMethod.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DataPrivacyController::exportMethod
 * @see app/Http/Controllers/DataPrivacyController.php:43
 * @route '/settings/data-export'
 */
        exportMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DataPrivacyController::exportMethod
 * @see app/Http/Controllers/DataPrivacyController.php:43
 * @route '/settings/data-export'
 */
        exportMethodForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    exportMethod.form = exportMethodForm
/**
* @see \App\Http\Controllers\DataPrivacyController::deleteAccount
 * @see app/Http/Controllers/DataPrivacyController.php:88
 * @route '/settings/delete-account'
 */
export const deleteAccount = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteAccount.url(options),
    method: 'delete',
})

deleteAccount.definition = {
    methods: ["delete"],
    url: '/settings/delete-account',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DataPrivacyController::deleteAccount
 * @see app/Http/Controllers/DataPrivacyController.php:88
 * @route '/settings/delete-account'
 */
deleteAccount.url = (options?: RouteQueryOptions) => {
    return deleteAccount.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DataPrivacyController::deleteAccount
 * @see app/Http/Controllers/DataPrivacyController.php:88
 * @route '/settings/delete-account'
 */
deleteAccount.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteAccount.url(options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\DataPrivacyController::deleteAccount
 * @see app/Http/Controllers/DataPrivacyController.php:88
 * @route '/settings/delete-account'
 */
    const deleteAccountForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: deleteAccount.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DataPrivacyController::deleteAccount
 * @see app/Http/Controllers/DataPrivacyController.php:88
 * @route '/settings/delete-account'
 */
        deleteAccountForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: deleteAccount.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    deleteAccount.form = deleteAccountForm
/**
* @see \App\Http\Controllers\DataPrivacyController::updateConsent
 * @see app/Http/Controllers/DataPrivacyController.php:199
 * @route '/settings/consent'
 */
export const updateConsent = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateConsent.url(options),
    method: 'post',
})

updateConsent.definition = {
    methods: ["post"],
    url: '/settings/consent',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DataPrivacyController::updateConsent
 * @see app/Http/Controllers/DataPrivacyController.php:199
 * @route '/settings/consent'
 */
updateConsent.url = (options?: RouteQueryOptions) => {
    return updateConsent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DataPrivacyController::updateConsent
 * @see app/Http/Controllers/DataPrivacyController.php:199
 * @route '/settings/consent'
 */
updateConsent.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateConsent.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DataPrivacyController::updateConsent
 * @see app/Http/Controllers/DataPrivacyController.php:199
 * @route '/settings/consent'
 */
    const updateConsentForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateConsent.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DataPrivacyController::updateConsent
 * @see app/Http/Controllers/DataPrivacyController.php:199
 * @route '/settings/consent'
 */
        updateConsentForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateConsent.url(options),
            method: 'post',
        })
    
    updateConsent.form = updateConsentForm
const DataPrivacyController = { index, exportMethod, deleteAccount, updateConsent, export: exportMethod }

export default DataPrivacyController