import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import profile from './profile'
import notifications from './notifications'
/**
* @see \App\Http\Controllers\DataPrivacyController::privacy
 * @see app/Http/Controllers/DataPrivacyController.php:28
 * @route '/settings/privacy'
 */
export const privacy = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: privacy.url(options),
    method: 'get',
})

privacy.definition = {
    methods: ["get","head"],
    url: '/settings/privacy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DataPrivacyController::privacy
 * @see app/Http/Controllers/DataPrivacyController.php:28
 * @route '/settings/privacy'
 */
privacy.url = (options?: RouteQueryOptions) => {
    return privacy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DataPrivacyController::privacy
 * @see app/Http/Controllers/DataPrivacyController.php:28
 * @route '/settings/privacy'
 */
privacy.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: privacy.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DataPrivacyController::privacy
 * @see app/Http/Controllers/DataPrivacyController.php:28
 * @route '/settings/privacy'
 */
privacy.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: privacy.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DataPrivacyController::privacy
 * @see app/Http/Controllers/DataPrivacyController.php:28
 * @route '/settings/privacy'
 */
    const privacyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: privacy.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DataPrivacyController::privacy
 * @see app/Http/Controllers/DataPrivacyController.php:28
 * @route '/settings/privacy'
 */
        privacyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: privacy.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DataPrivacyController::privacy
 * @see app/Http/Controllers/DataPrivacyController.php:28
 * @route '/settings/privacy'
 */
        privacyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: privacy.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    privacy.form = privacyForm
/**
* @see \App\Http\Controllers\DataPrivacyController::dataExport
 * @see app/Http/Controllers/DataPrivacyController.php:44
 * @route '/settings/data-export'
 */
export const dataExport = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dataExport.url(options),
    method: 'get',
})

dataExport.definition = {
    methods: ["get","head"],
    url: '/settings/data-export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DataPrivacyController::dataExport
 * @see app/Http/Controllers/DataPrivacyController.php:44
 * @route '/settings/data-export'
 */
dataExport.url = (options?: RouteQueryOptions) => {
    return dataExport.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DataPrivacyController::dataExport
 * @see app/Http/Controllers/DataPrivacyController.php:44
 * @route '/settings/data-export'
 */
dataExport.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dataExport.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DataPrivacyController::dataExport
 * @see app/Http/Controllers/DataPrivacyController.php:44
 * @route '/settings/data-export'
 */
dataExport.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dataExport.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DataPrivacyController::dataExport
 * @see app/Http/Controllers/DataPrivacyController.php:44
 * @route '/settings/data-export'
 */
    const dataExportForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dataExport.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DataPrivacyController::dataExport
 * @see app/Http/Controllers/DataPrivacyController.php:44
 * @route '/settings/data-export'
 */
        dataExportForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dataExport.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DataPrivacyController::dataExport
 * @see app/Http/Controllers/DataPrivacyController.php:44
 * @route '/settings/data-export'
 */
        dataExportForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dataExport.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dataExport.form = dataExportForm
/**
* @see \App\Http\Controllers\DataPrivacyController::deleteAccount
 * @see app/Http/Controllers/DataPrivacyController.php:90
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
 * @see app/Http/Controllers/DataPrivacyController.php:90
 * @route '/settings/delete-account'
 */
deleteAccount.url = (options?: RouteQueryOptions) => {
    return deleteAccount.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DataPrivacyController::deleteAccount
 * @see app/Http/Controllers/DataPrivacyController.php:90
 * @route '/settings/delete-account'
 */
deleteAccount.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteAccount.url(options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\DataPrivacyController::deleteAccount
 * @see app/Http/Controllers/DataPrivacyController.php:90
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
 * @see app/Http/Controllers/DataPrivacyController.php:90
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
 * @see app/Http/Controllers/DataPrivacyController.php:201
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
 * @see app/Http/Controllers/DataPrivacyController.php:201
 * @route '/settings/consent'
 */
updateConsent.url = (options?: RouteQueryOptions) => {
    return updateConsent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DataPrivacyController::updateConsent
 * @see app/Http/Controllers/DataPrivacyController.php:201
 * @route '/settings/consent'
 */
updateConsent.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateConsent.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DataPrivacyController::updateConsent
 * @see app/Http/Controllers/DataPrivacyController.php:201
 * @route '/settings/consent'
 */
    const updateConsentForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateConsent.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DataPrivacyController::updateConsent
 * @see app/Http/Controllers/DataPrivacyController.php:201
 * @route '/settings/consent'
 */
        updateConsentForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateConsent.url(options),
            method: 'post',
        })
    
    updateConsent.form = updateConsentForm
const settings = {
    privacy: Object.assign(privacy, privacy),
dataExport: Object.assign(dataExport, dataExport),
deleteAccount: Object.assign(deleteAccount, deleteAccount),
updateConsent: Object.assign(updateConsent, updateConsent),
profile: Object.assign(profile, profile),
notifications: Object.assign(notifications, notifications),
}

export default settings