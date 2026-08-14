import StaticPageController from './StaticPageController'
import DashboardController from './DashboardController'
import ProfileController from './ProfileController'
import VerificationController from './VerificationController'
import LikeController from './LikeController'
import MatchController from './MatchController'
import SearchController from './SearchController'
import ActivityController from './ActivityController'
import ShopController from './ShopController'
import PremiumController from './PremiumController'
import ConversationController from './ConversationController'
import MessageController from './MessageController'
import NotificationController from './NotificationController'
import BadgeController from './BadgeController'
import StatsController from './StatsController'
import GemHistoryController from './GemHistoryController'
import GalleryAccessController from './GalleryAccessController'
import PhotoController from './PhotoController'
import ReportController from './ReportController'
import BlockController from './BlockController'
import PushSubscriptionController from './PushSubscriptionController'
import DataPrivacyController from './DataPrivacyController'
import Admin from './Admin'
import StripeWebhookController from './StripeWebhookController'
import Settings from './Settings'
const Controllers = {
    StaticPageController: Object.assign(StaticPageController, StaticPageController),
DashboardController: Object.assign(DashboardController, DashboardController),
ProfileController: Object.assign(ProfileController, ProfileController),
VerificationController: Object.assign(VerificationController, VerificationController),
LikeController: Object.assign(LikeController, LikeController),
MatchController: Object.assign(MatchController, MatchController),
SearchController: Object.assign(SearchController, SearchController),
ActivityController: Object.assign(ActivityController, ActivityController),
ShopController: Object.assign(ShopController, ShopController),
PremiumController: Object.assign(PremiumController, PremiumController),
ConversationController: Object.assign(ConversationController, ConversationController),
MessageController: Object.assign(MessageController, MessageController),
NotificationController: Object.assign(NotificationController, NotificationController),
BadgeController: Object.assign(BadgeController, BadgeController),
StatsController: Object.assign(StatsController, StatsController),
GemHistoryController: Object.assign(GemHistoryController, GemHistoryController),
GalleryAccessController: Object.assign(GalleryAccessController, GalleryAccessController),
PhotoController: Object.assign(PhotoController, PhotoController),
ReportController: Object.assign(ReportController, ReportController),
BlockController: Object.assign(BlockController, BlockController),
PushSubscriptionController: Object.assign(PushSubscriptionController, PushSubscriptionController),
DataPrivacyController: Object.assign(DataPrivacyController, DataPrivacyController),
Admin: Object.assign(Admin, Admin),
StripeWebhookController: Object.assign(StripeWebhookController, StripeWebhookController),
Settings: Object.assign(Settings, Settings),
}

export default Controllers