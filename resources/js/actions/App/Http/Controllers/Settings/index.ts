import ProfileController from './ProfileController'
import PasswordController from './PasswordController'
import TwoFactorAuthenticationController from './TwoFactorAuthenticationController'
import SessionController from './SessionController'
import NotificationPreferenceController from './NotificationPreferenceController'
const Settings = {
    ProfileController: Object.assign(ProfileController, ProfileController),
PasswordController: Object.assign(PasswordController, PasswordController),
TwoFactorAuthenticationController: Object.assign(TwoFactorAuthenticationController, TwoFactorAuthenticationController),
SessionController: Object.assign(SessionController, SessionController),
NotificationPreferenceController: Object.assign(NotificationPreferenceController, NotificationPreferenceController),
}

export default Settings