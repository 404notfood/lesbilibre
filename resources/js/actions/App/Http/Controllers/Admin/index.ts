import DashboardController from './DashboardController'
import UserController from './UserController'
import SubscriptionController from './SubscriptionController'
import ModerationController from './ModerationController'
import StaticPageAdminController from './StaticPageAdminController'
import SettingsController from './SettingsController'
const Admin = {
    DashboardController: Object.assign(DashboardController, DashboardController),
UserController: Object.assign(UserController, UserController),
SubscriptionController: Object.assign(SubscriptionController, SubscriptionController),
ModerationController: Object.assign(ModerationController, ModerationController),
StaticPageAdminController: Object.assign(StaticPageAdminController, StaticPageAdminController),
SettingsController: Object.assign(SettingsController, SettingsController),
}

export default Admin