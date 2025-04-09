<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');


service('auth')->routes($routes);

// $routes->get('excel/import', 'ExcelController::importExcel');
// $routes->post('excel/upload', 'ExcelController::uploadExcel');
// $routes->get('/subscription', 'StripeController::index');
$routes->get('/success', 'StripeController::success');
$routes->get('/error', 'StripeController::error');
// $routes->post('/subscription/createSubscription', 'StripeController::createSubscription');
//$routes->post('/stripe-webhook', 'StripeController::handle');
$routes->get('/email-testing', 'StripeController::emailTesting');


// $routes->get('/subscription-form', 'StripeController::subscriptionForm');
// $routes->post('create-subscription', 'StripeController::createSubscription');
// $routes->post('stripe-webhook', 'StripeController::webhook');

$routes->get('/subscription-form', 'StripeController::subscriptionForm');
$routes->post('subscription/subscribe', 'StripeController::subscribe');

$routes->get('upgrade-subscription-form', 'StripeController::upgradeSubscriptionForm');
$routes->post('subscription/upgrade', 'StripeController::upgradeSubscription');

// $routes->post('stripe-webhook', 'Api\StripeController::handle');
$routes->get('subscription/cancel', 'StripeController::cancelForm');
$routes->post('subscription/cancel', 'StripeController::cancel');



$routes->get('generate-PDF', 'Home::generatePDF');
$routes->get('staticPdf', 'Home::staticPdf');
$routes->get('generate-InvoicePDF', 'Home::generateInvoicePDF');
// $routes->get('download-PDF', 'Home::downloadUserPdf');
$routes->get('load-email', 'Home::loadEmail');
$routes->post('send-email', 'Home::loadEmail');

$routes->get('frontend_test',       'Home::amritTest');




$routes->get('uploads/(:segment)',              'Api\AuthController::displayFile/$1');
$routes->get('uploads/logos/(:segment)',        'Api\AuthController::displayTeamLogo/$1');
$routes->get('uploads/documents/(:segment)',    'Api\AuthController::displayDocuments/$1');
$routes->get('uploads/pdf-icons/(:segment)',    'Api\AuthController::displayPDFIcons/$1');
$routes->get('get-positions-image',             'Home::getPositionImage');
$routes->get('uploads/exports/(:segment)',      'Api\AuthController::displayCsv/$1');
$routes->get('uploads/frontend/(:segment)',     'Api\AuthController::frontEnd/$1');

$routes->get('users-test',                      'TestController::getUsersTesting');       /////////////////// testing ////////////
$routes->get('users-frontend-with-login-test',  'TestController::getUsersOnFrontendTesting', ['filter' => 'loginAuth']);       /////////////////// testing ////////////
// $routes->get('users-test',             'TestController::getUsersTesting', ['filter' => 'loginAuth']);       /////////////////// testing ////////////



$routes->group('api', ['namespace' => 'App\Controllers\Api'], function ($routes) {


   header('Access-Control-Allow-Origin: *');
   header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Request-Method, Lang");
   header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");

   $method = $_SERVER['REQUEST_METHOD'] ?? '';
   // $method = $_SERVER['REQUEST_METHOD'];
   if ($method == "OPTIONS") {
      die();
   }

   // $routes->post('stripe-webhook', 'StripeController::handle');
   $routes->post('stripe-webhook', 'StripeWebhookEventController::handle');
   // $routes->post('stripe-webhook', 'StripeController::handle_new');
   // $routes->get('process-stripe-webhook', 'StripeController::processPendingEventsLater');
   $routes->get('process-stripe-webhook', 'StripeWebhookEventController::processPendingEventsLater');

   $routes->post('create-stripe-customer', 'StripeController::createStripeCustomer', ['filter' => 'loginAuth']);


   //$routes->post('create-payment-intent', 'StripeController::createPaymentIntent');
   $routes->post('add-payment-method',    'StripeController::addPaymentMethod');
   $routes->get('export-user-csv',        'UserController::exportUsers');
   $routes->get('download-PDF',           'UserController::downloadUserPdf');
   $routes->get('export-single-user/(:num)/(:num)',              'UserController::downloadUserPdf/$1/$2');

   //$routes->post('add-email-template-test',                   'EmailTemplateController::addEmailTemplate');

   //$routes->get('users',                  'AuthController::getPlayers');  // route disabled temporary
   $routes->get('users',                  'UserController::getUsers');
   $routes->get('users/(:any)',           'UserController::getUsers/$1');
   $routes->get('users-frontend',         'UserController::getUsersOnFrontend');
   $routes->get('get-countries',          'CountryController::getCountries');
   $routes->get('get-leagues',            'LeagueController::getLeagues');
   $routes->get('get-positions',          'PositionController::getPositions');
   $routes->get('get-positions/(:num)',   'PositionController::getPositions/$1');
   $routes->get('get-packages',           'PackageController::getPackages');
   $routes->get('get-packages/(:any)',    'PackageController::getPackages/$1');
   $routes->get('get-packages-by-domain/(:any)/(:any)',           'PackageController::getPackagesByDomain/$1/$2');
   $routes->get('get-packages-by-domain/(:any)/(:any)/(:any)',    'PackageController::getPackagesByDomain/$1/$2/$3');

   // test_by_amrit
   $routes->get('get-activity',                          'UserController::getActivity', ['filter' => 'loginAuth']); //
   $routes->post('delete-activity',                      'UserController::deleteActivity', ['filter' => 'loginAuth']);
   $routes->get('get-subscription',                      'UserSubscriptionController::getSubscriptionPlans'); //
   $routes->post('common-profile-upload',                'UserController::UploadProfileImageCommon');
   // 
   $routes->get('admin-access',                          'AuthController::adminAccessDenied');
   $routes->get('player-access',                         'AuthController::playerAccessDenied');
   $routes->get('club-access',                           'AuthController::clubAccessDenied');
   $routes->get('scout-access',                          'AuthController::scoutAccessDenied');
   $routes->get('invalid-access',                        'AuthController::accessDenied');

   $routes->post('register',                             'AuthController::register');
   $routes->post('login',                                'AuthController::login');

   $routes->get('get-domains',                           'DomainController::getDomains');
   $routes->get('get-domains/(:num)',                    'DomainController::getDomains/$1');
   $routes->get('get-currencies',                        'DomainController::getCurrencies');

   $routes->get('get-roles/(:num)',                      'RoleController::getRoles/$1');
   $routes->get('get-languages',                         'LanguageController::getLanguages');
   $routes->get('get-languages/(:num)',                  'LanguageController::getLanguages/$1');
   $routes->get('get-language/(:num)',                   'LanguageController::getLanguage/$1');
   $routes->get('get-ads',                               'AdvertisementController::frontendAds');




   $routes->get('delete-user/(:num)',                       'AuthController::deleteUser/$1', ['filter' => 'loginAuth']);
   //$routes->post('delete-user',                           'AuthController::deleteUser', ['filter' => 'loginAuth']);
   $routes->post('change-password',                         'AuthController::changePassword', ['filter' => 'loginAuth']);
   $routes->post('reset-password',                          'AuthController::resetPassword', ['filter' => 'loginAuth']);
   $routes->get('logout',                                   'AuthController::logout', ['filter' => 'loginAuth']);




   $routes->get('verify-email/(:any)/(:any)',               'AuthController::verifyEmail/$1/$2');
   $routes->get('verify-club-email/(:any)',                 'AuthController::verifyClubEmail/$1');     // not using
   $routes->post('forgot-password',                         'AuthController::forgotPassword');
   $routes->get('magic-login/(:any)',                       'AuthController::magicLogin/$1');

   $routes->get('validate-email-confirmation-token/(:any)/(:any)',         'AuthController::verifyEmail/$1/$2');
   $routes->get('validate-forgot-password-token/(:any)',                   'AuthController::magicLogin/$1');



   $routes->get('dashboard',                                'AuthController::dashboard', ['filter' => 'loginAuth']);
   // $routes->get('profile',                               'AuthController::profile', ['filter' => 'loginAuth']);
   $routes->get('profile',                                  'UserController::userProfile', ['filter' => 'loginAuth']);
   $routes->get('profile/(:num)',                           'UserController::userProfile/$1', ['filter' => 'loginAuth']);        // lang id
   $routes->get('search',                                   'UserController::searchBar', ['filter' => 'loginAuth']);


   $routes->post('add-favorite',                            'FavoriteController::addFavorite', ['filter' => 'loginAuth']);
   $routes->get('get-favorites',                            'FavoriteController::getFavorites', ['filter' => 'loginAuth']);
   // $routes->get('get-favorites/(:num)',                  'FavoriteController::getFavorites/$1', ['filter' => 'loginAuth']);
   $routes->get('get-favorites-profile',                    'FavoriteController::getFavoritesWithProfile'); // test_by_amrit

   $routes->post('delete-favorites',                        'FavoriteController::deleteFavorites', ['filter' => 'loginAuth']);
   $routes->post('remove-favorites-talent',                 'FavoriteController::deleteSingleFavorite', ['filter' => 'loginAuth']);

   $routes->get('get-clubs-list',                           'ClubController::getClubs');
   // $routes->get('get-clubs-list',                        'ClubController::getClubs', ['filter' => 'loginAuth']);
   $routes->get('get-teams',                                'TeamController::getTeams');
   $routes->get('get-club-teams/(:num)',                    'TeamController::getTeams/$1', ['filter' => 'loginAuth']);
   $routes->post('update-user-language',                    'AuthController::updateUserLanguage', ['filter' => 'loginAuth']);
   $routes->post('delete-csv-file',                         'AuthController::deleteCSVFile', ['filter' => 'loginAuth']);

   $routes->get('users-frontend-with-login',                'UserController::getUsersOnFrontend', ['filter' => 'loginAuth']);

   $routes->get('get-representator-roles',                  'RepresentatorRoleController::getRepresentatorRoles', ['filter' => 'loginAuth']);
   $routes->post('create-payment-intent/(:num)',            'StripeController::createPaymentIntent/$1', ['filter' => 'loginAuth']);



   //$routes->post('update-profile', 'AuthController::updateProfile', ['filter' => 'loginAuth']);
   //$routes->post('players', 'AuthController::getPlayers', ['filter' => 'loginAuth']);

   // google sign up
   $routes->get('google-login',                                'AuthController::googleLogin'); // Google sign-in link
   $routes->get('google-callback',                             'AuthController::googleCallback'); // Google callback URL

   $routes->post('google-signin',                              'AuthController::googleSignIn'); // Google sign-in link

   //ADMIN Routes
   //$routes->get('admin/users',                               'UserController::getUsers');

   // APIs to get player details
   $routes->get('get-transfer-detail/(:num)',                  'TeamTransferController::getTeamTransfer/$1');
   $routes->get('get-performance-reports/(:num)',              'PerformanceReportController::getPerformanceReports/$1');
   $routes->get('get-performance-detail/(:num)',               'PerformanceDetailController::getPerformanceDetail/$1');
   $routes->get('get-gallery-highlights/(:num)',               'GalleryController::getGalleryHighlights/$1');
   $routes->get('get-gallery/(:num)',                          'GalleryController::getGallery/$1');
   $routes->post('track-advertisement',                        'AdvertisementController::trackAdvertisement', ['filter' => 'loginAuth']);
   $routes->get('user-profile/(:num)',                         'UserController::userProfile/$1');
   $routes->get('user-profile/(:num)/(:num)',                  'UserController::userProfile/$1/$2');


   // Cron jobs
   $routes->group('cron', function ($routes) {
      // $routes->get('send-email-via-cron',                   'BackgroundController::sendEmailFromCron');
      $routes->get('update-status-advertisement',              'BackgroundController::updateStatusAdvertisement');
      $routes->get('update-status-coupon',                     'BackgroundController::updateStatusCoupon');
      $routes->get('update-status-system-popups',              'BackgroundController::updateStatusSystemPopUp');
   });



   $routes->group('admin', ['filter' => ['loginAuth', 'adminAuth']], function ($routes) {
      $routes->get('users',                                 'UserController::getUsers');
      $routes->get('users/(:num)',                          'UserController::getUsers/$1');
      $routes->get('export-users',                          'UserController::downloadCsv');
      $routes->get('profile/(:num)/(:num)',                 'UserController::userProfile/$1/$2');
      $routes->post('update-user-status',                   'UserController::updateUserStatus');
      $routes->post('delete-user',                          'UserController::deleteUser');
      $routes->post('change-password/(:num)',               'AuthController::changePassword/$1');


      // $routes->post('update-profile/(:num)',                'UserController::updateProfileAdmin/$1');
      $routes->post('update-profile/(:num)',                'UserController::updateProfile/$1');
      $routes->post('update-general-info/(:num)',           'UserController::updateGeneralInfoAdmin/$1');
      $routes->post('update-market-value/(:num)',           'UserController::playerMarketValueAdmin/$1');

      $routes->get('get-gallery/(:num)',                    'GalleryController::getGallery/$1');
      $routes->get('get-gallery-highlights/(:num)',         'GalleryController::getGalleryHighlights/$1');
      $routes->post('upload-gallery-image/(:num)',          'GalleryController::uploadGalleryImageAdmin/$1');
      $routes->post('delete-gallery-file',                  'GalleryController::deleteGalleryFileAdmin');

      $routes->post('upload-profile-image/(:num)',          'UserController::uploadProfileImageAdmin/$1');
      $routes->post('upload-cover-image/(:num)',            'UserController::uploadCoverImageAdmin/$1');

      $routes->get('get-profile-image/(:num)',              'UserController::getProfileImageAdmin/$1');
      $routes->get('get-cover-image/(:num)',                'UserController::getCoverImageAdmin/$1');

      $routes->get('delete-profile-image/(:num)',           'UserController::deleteProfileImageAdmin/$1');
      $routes->get('delete-cover-image/(:num)',             'UserController::deleteCoverImageAdmin/$1');


      $routes->get('get-performance-detail/(:num)',         'PerformanceDetailController::getPerformanceDetail/$1');
      $routes->post('edit-performance-detail/(:num)',       'PerformanceDetailController::editPerformanceDetailAdmin/$1');

      $routes->get('get-transfer-detail/(:num)',            'TeamTransferController::adminGetTeamTransfers/$1');
      $routes->post('edit-transfer-detail/(:num)',          'TeamTransferController::editTeamTransferAdmin/$1');

      $routes->get('get-performance-reports/(:num)',        'PerformanceReportController::getPerformanceReports/$1');


      // CLUB
      $routes->post('add-club-history/(:num)',              'UserController::addClubHistory/$1');
      $routes->get('get-club-history/(:num)',               'UserController::getClubHistory/$1');
      $routes->post('edit-club-history/(:num)',             'UserController::updateClubHistoryAdmin/$1');

      $routes->get('get-club-players/(:num)',               'ClubPlayerController::getClubPlayersAdmin/$1');         // first param team id, second param lang
      $routes->get('get-club-players/(:num)/(:num)',        'ClubPlayerController::getClubPlayersAdmin/$1/$2');         // first param team id, second param lang
      $routes->post('add-club-player/(:num)',               'ClubPlayerController::addClubPlayerAdmin/$1');
      $routes->post('edit-club-player/(:num)',              'ClubPlayerController::EditClubPlayerAdmin/$1');

      // $routes->post('add-sighting/(:num)',                  'SightingController::addSightingAdmin/$1');
      $routes->post('add-sighting/(:num)',                  'SightingController::addSighting/$1');
      $routes->post('delete-sighting',                      'SightingController::deleteSightingAdmin');
      // $routes->get('get-sightings/(:num)',                  'SightingController::getSightingsAdmin/$1');
      $routes->get('get-sightings/(:num)',                  'SightingController::getSightings/$1');
      $routes->get('get-sighting/(:num)',                   'SightingController::getSighting/$1');
      $routes->post('edit-sighting-cover/(:num)',           'SightingController::editSightingCover/$1');
      $routes->post('edit-sighting-detail/(:num)',          'SightingController::editSightingDetail/$1');
      $routes->post('edit-sighting-about/(:num)',           'SightingController::editSightingAbout/$1');
      $routes->post('add-sighting-attachments/(:num)',      'SightingController::addSightingAttachments/$1');
      $routes->get('delete-sighting-attachment/(:num)/(:num)',     'SightingController::deleteSightingAttachment/$1/$2');
      $routes->post('add-sighting-invites/(:num)',          'SightingController::addSightingInvites/$1');
      $routes->get('delete-sighting-invite/(:num)',         'SightingController::deleteSightingInvite/$1');
      $routes->get('delete-sighting-cover/(:num)',          'SightingController::deleteSightingCover/$1');


      // SCOUT
      $routes->get('get-company-history/(:num)',            'UserController::getCompanyHistory/$1');
      $routes->post('add-company-history/(:num)',           'UserController::addCompanyHistory/$1');
      $routes->post('edit-company-history/(:num)',          'UserController::editCompanyHistory/$1');

      $routes->post('add-scout-player/(:num)',              'ScoutPlayerController::addScoutPlayer/$1');
      $routes->get('delete-scout-player/(:num)/(:num)',     'ScoutPlayerController::deleteScoutPlayer/$1/$2');       // second param lang id
      $routes->get('get-scout-players/(:num)',              'ScoutPlayerController::getScoutPlayers/$1');
      $routes->get('get-scout-players/(:num)/(:num)',       'ScoutPlayerController::getScoutPlayers/$1/$2');   // first param lang

      // Favorites
      $routes->get('get-favorites/(:num)',                  'FavoriteController::getFavorites/$1');
      $routes->post('delete-favorites',                     'FavoriteController::deleteFavorites');

      // System Popups
      $routes->post('add-system-popup',                     'SystemPopUpController::addSystemPopUp');
      $routes->get('get-system-popups',                     'SystemPopUpController::getSystemPopUps');
      $routes->get('get-system-popup/(:num)',               'SystemPopUpController::getSystemPopUp/$1');
      $routes->post('edit-system-popup/(:num)',             'SystemPopUpController::editSystemPopUp/$1');
      $routes->post('delete-system-popup',                  'SystemPopUpController::deleteSystemPopUp');

      $routes->post('add-system-popup/(:any)',               'SystemPopUpController::addSystemPopUp/$1');
      $routes->get('get-system-popups/(:any)',               'SystemPopUpController::getSystemPopUps/$1');
      $routes->get('get-system-popup/(:num)/(:num)',         'SystemPopUpController::getSystemPopUp/$1/$2');
      $routes->post('edit-system-popup/(:num)/(:num)',       'SystemPopUpController::editSystemPopUp/$1/$2');
      $routes->post('delete-system-popup/(:any)',            'SystemPopUpController::deleteSystemPopUp/$1');


      // Email Template
      $routes->post('add-email-template',                   'EmailTemplateController::addEmailTemplate');
      $routes->post('edit-email-template/(:num)',           'EmailTemplateController::editEmailTemplate/$1');
      $routes->get('get-email-templates',                   'EmailTemplateController::getEmailTemplates');
      $routes->get('get-email-templates/(:num)',            'EmailTemplateController::getEmailTemplates/$1');
      $routes->get('get-email-template/(:num)',             'EmailTemplateController::getEmailTemplate/$1');
      $routes->post('delete-email-template',                'EmailTemplateController::deleteEmailTemplate');

      // Coupon
      $routes->post('add-coupon',                           'CouponController::addCoupon');
      $routes->post('add-coupon/(:num)',                    'CouponController::addCoupon/$1');
      $routes->post('edit-coupon/(:num)',                   'CouponController::editCoupon/$1');
      $routes->post('edit-coupon/(:num)/(:num)',            'CouponController::editCoupon/$1/$2');
      $routes->get('get-coupons',                           'CouponController::getCoupons');
      $routes->get('get-coupons/(:num)',                    'CouponController::getCoupons/$1');
      $routes->get('get-coupon/(:num)',                     'CouponController::getCoupon/$1');
      $routes->post('delete-coupon',                        'CouponController::deleteCoupon');
      $routes->post('delete-coupon/(:num)',                 'CouponController::deleteCoupon/$1');
      $routes->post('publish-coupon',                       'CouponController::publishCoupon');
      $routes->post('publish-coupon/(:num)',                'CouponController::publishCoupon/$1');
      $routes->post('draft-coupon',                         'CouponController::draftCoupon');
      $routes->post('draft-coupon/(:num)',                  'CouponController::draftCoupon/$1');
      $routes->post('expire-coupon',                        'CouponController::expireCoupon');
      $routes->post('expire-coupon/(:num)',                 'CouponController::expireCoupon/$1');

      // addBlog
      $routes->post('add-blog',                             'BlogController::addBlog');
      $routes->post('add-blog/(:num)',                      'BlogController::addBlog/$1');
      $routes->post('edit-blog/(:num)',                     'BlogController::editBlog/$1');
      $routes->post('edit-blog/(:num)/(:num)',              'BlogController::editBlog/$1/$2');
      $routes->get('get-blogs',                             'BlogController::getBlogs');
      $routes->get('get-blogs/(:any)',                      'BlogController::getBlogs/$1');
      $routes->get('get-blog',                              'BlogController::getBlog');
      $routes->get('get-blog/(:any)',                       'BlogController::getBlog/$1');
      $routes->post('delete-blog',                          'BlogController::deleteBlog');
      $routes->post('delete-blog',                          'BlogController::deleteBlog');
      $routes->post('delete-blog/(:any)',                   'BlogController::deleteBlog/$1');
      $routes->post('publish-blog',                         'BlogController::publishBlog');
      $routes->post('publish-blog/(:any)',                  'BlogController::publishBlog/$1');
      $routes->post('draft-blog',                           'BlogController::draftBlog');
      $routes->post('draft-blog/(:any)',                    'BlogController::draftBlog/$1');

      // Advertisement
      $routes->post('add-advertisement',                    'AdvertisementController::addAdvertisement');
      $routes->post('add-advertisement/(:num)',             'AdvertisementController::addAdvertisement/$1');
      $routes->post('edit-advertisement/(:num)',            'AdvertisementController::editAdvertisement/$1');
      $routes->post('edit-advertisement/(:num)/(:num)',     'AdvertisementController::editAdvertisement/$1/$2');
      $routes->get('get-advertisements',                    'AdvertisementController::getAdvertisements');
      $routes->get('get-advertisements/(:num)',             'AdvertisementController::getAdvertisements/$1');
      $routes->get('get-advertisement/(:num)',              'AdvertisementController::getAdvertisement/$1');
      $routes->post('delete-advertisement',                 'AdvertisementController::deleteAdvertisement');
      $routes->post('publish-advertisement',                'AdvertisementController::publishAdvertisement');
      $routes->post('draft-advertisement',                  'AdvertisementController::draftAdvertisement');
      $routes->post('expire-advertisement',                 'AdvertisementController::expireAdvertisement');

      $routes->post('delete-advertisement/(:any)',           'AdvertisementController::deleteAdvertisement/$1');
      $routes->post('publish-advertisement/(:any)',          'AdvertisementController::publishAdvertisement/$1');
      $routes->post('draft-advertisement/(:any)',            'AdvertisementController::draftAdvertisement/$1');
      $routes->post('expire-advertisement/(:any)',           'AdvertisementController::expireAdvertisement/$1');

      // Pages
      $routes->post('add-page',                             'PageController::addPage');
      $routes->post('edit-page/(:num)',                     'PageController::editPage/$1');
      $routes->get('get-pages',                             'PageController::getPages');
      $routes->get('get-pages/(:num)',                      'PageController::getPages/$1');
      $routes->get('get-page/(:num)',                       'PageController::getPage/$1');
      $routes->post('delete-page',                          'PageController::draftPage');

      $routes->post('delete-page/(:any)',                    'PageController::deletePage/$1');
      $routes->post('publish-page/(:any)',                   'PageContrroller::deletePage');
      $routes->post('publish-page',                         'PageController::publishPage');
      $routes->post('draft-page',                           'PageContoller::publishPage/$1');
      $routes->post('draft-page/(:any)',                     'PageController::draftPage/$1');

      $routes->get('get-pagecontent/(:num)',                'PageMetaController::getFullPageById/$1', ['namespace' => 'App\Controllers\Frontend']);

      // SETTINGS
      $routes->post('settings/profile',                     'UserController::updateProfile');
      $routes->post('settings/upload-profile-image',        'UserController::uploadProfileImage');

      // statistics data
      $routes->get('get-users-count-monthly/(:num)/(:num)',          'UserController::getUsersCountMonthly/$1/$2');
      $routes->get('get-subscriptions-count-monthly/(:num)/(:num)',  'UserController::getSubscriptionsCountMonthly/$1/$2');
      $routes->get('get-sales-count-monthly/(:num)/(:num)',          'UserController::getSalesCountMonthly/$1/$2');

      $routes->get('get-users-count-yearly/(:num)',                  'UserController::getUsersCountYearly/$1');
      $routes->get('get-users-count-yearly/(:num)/(:num)',           'UserController::getUsersCountYearly/$1/$2');               // by domain
      $routes->get('get-subscriptions-count-yearly/(:num)',          'UserController::getSubscriptionsCountYearly/$1');
      $routes->get('get-subscriptions-count-yearly/(:num)/(:num)',   'UserController::getSubscriptionsCountYearly/$1/$2');       // by domain
      $routes->get('get-sales-count-yearly/(:num)',                  'UserController::getSalesCountYearly/$1');
      $routes->get('get-sales-count-yearly/(:num)/(:num)',           'UserController::getSalesCountYearly/$1/$2');               // by domain
      $routes->get('get-graph-data/(:num)',                          'UserController::getGraphDataYearly/$1');
      $routes->get('get-graph-data/(:num)/(:num)',                   'UserController::getGraphDataYearly/$1/$2');                // by domain
      $routes->get('get-graph-data/(:num)/(:num)/(:num)',            'UserController::getGraphDataYearly/$1/$2/$3');             // by domain and language



      $routes->get('get-role-payment-types',                         'RolePaymentTypeController::getRolePaymentTypes');
      $routes->get('get-role-payment-types/(:num)',                  'RolePaymentTypeController::getRolePaymentTypes/$1');
      $routes->get('get-purchase-history/(:num)',                    'UserSubscriptionController::getUserPurchaseHistory/$1');
      $routes->get('get-transactions',                               'UserSubscriptionController::getTransactions');
      $routes->post('verify-club-application/(:num)',                'AuthController::verifyClubApplication/$1');    // not using
      $routes->get('get-payment-methods/(:num)',                     'PaymentMethodController::getPaymentMethods/$1');
      $routes->get('export-purchase-history/(:num)',                 'UserSubscriptionController::getUserPurchaseHistoryExport/$1');
      $routes->get('generate-invoice-pdf/(:num)/(:num)',             'UserSubscriptionController::generateInvoicePDF/$1/$2');    //  subscription id / language id /



      $routes->post('add-club',                                      'AuthController::addClub');   // not using

      //Representator
      $routes->post('add-representator',                             'UserController::addRepresentator');      // to add representator in admin profile
      $routes->get('get-representators',                             'UserController::getRepresentators');

      $routes->post('add-representator/(:num)',                      'UserController::addRepresentator/$1');   // pass club or scout ID in param
      $routes->get('get-representators/(:num)',                      'UserController::getRepresentators/$1');   // pass club or scout ID in param
      $routes->post('update-representator-role/(:num)/(:num)',       'UserController::updateRepresentatorRole/$1/$2');   // first param user_id second param lang id
      $routes->get('delete-representator/(:num)/(:num)',             'UserController::deleteRepresentator/$1/$2');

      // test_by_amrit
      $routes->post('upload-profile-photo/(:num)',                   'UserController::UploadProfilePhoto/$1');    // not using

      $routes->post('export-favorites/(:num)',                        'FavoriteController::exportFavorites/$1');
      $routes->get('export-performance-detail/(:num)',               'PerformanceDetailController::exportPerformanceDetailAdmin/$1');
      $routes->get('export-transfer-detail/(:num)',                  'TeamTransferController::exportTeamTransferAdmin/$1');
      $routes->get('export-scout-players/(:num)',                    'ScoutPlayerController::exportScoutPlayers/$1');
      $routes->post('export-sightings/(:num)',                       'SightingController::exportSightingsAdmin/$1');
      $routes->get('export-club-players/(:num)',                     'ClubPlayerController::exportClubPlayersAdmin/$1');
      $routes->get('get-page-ads/(:num)',                            'PageController::getPageAds/$1');
   });

   // Players Routes
   $routes->group('player', ['filter' => ['loginAuth', 'playerAuth']], function ($routes) {
      //$routes->post('update-profile', 'AuthController::updateProfile', ['filter' => 'loginAuth']);
      //$routes->post('update-profile',              'UserController::updateProfile');
      $routes->post('update-general-info',         'UserController::updateGeneralInfo');

      /* $routes->post('upload-profile-image',     'UserController::uploadProfileImage');
      $routes->post('upload-cover-image',          'UserController::uploadCoverImage');

      $routes->get('get-profile-image',            'UserController::getProfileImage');
      $routes->get('get-cover-image',              'UserController::getCoverImage');
      
      $routes->get('delete-profile-image',         'UserController::deleteProfileImage');
      $routes->get('delete-cover-image',           'UserController::deleteCoverImage');

      $routes->post('upload-gallery-image',        'GalleryController::uploadGalleryImage');
      $routes->get('get-gallery',                  'GalleryController::getGallery');
      $routes->post('delete-gallery-file',         'GalleryController::deleteGalleryFile');
      $routes->post('set-featured-file',           'GalleryController::SetFeaturedFile');
      $routes->get('unset-featured-file/(:num)',   'GalleryController::UnSetFeaturedFile/$1'); */

      $routes->post('upload-performance-report',                        'PerformanceReportController::addPerformanceReport');
      $routes->post('delete-performance-report',                        'PerformanceReportController::deletePerformanceReport');
      $routes->get('get-performance-reports',                           'PerformanceReportController::getPerformanceReports');

      $routes->post('add-transfer-detail',                              'TeamTransferController::addTeamTransfer');
      $routes->get('get-transfer-detail',                               'TeamTransferController::getTeamTransfer');
      $routes->post('edit-transfer-detail/(:num)',                      'TeamTransferController::editTeamTransfer/$1');
      $routes->get('delete-transfer-detail/(:num)',                     'TeamTransferController::deleteTeamTransfer/$1');

      $routes->post('add-performance-detail/(:num)',                    'PerformanceDetailController::addPerformanceDetail/$1');
      $routes->get('get-performance-detail',                            'PerformanceDetailController::getPerformanceDetail');
      $routes->post('edit-performance-detail/(:num)/(:num)',            'PerformanceDetailController::editPerformanceDetail/$1/$2');
      $routes->get('delete-performance-detail/(:num)',                  'PerformanceDetailController::deletePerformanceDetail/$1');

      $routes->post('download-performance-reports',                     'PerformanceReportController::downloadPerformanceReports');
      // $routes->post('update-scout-request/(:num)',                   'ScoutPlayerController::updateScoutRequest/$1');
      $routes->post('update-scout-request/(:num)/(:num)',               'ScoutPlayerController::updateScoutRequest/$1/$2');     // lang_id, scout id
      $routes->post('update-sighting-invite-response/(:num)',           'SightingController::updateSightingInviteResponse/$1');  //  lang_id
   });

   // multiRoleAuth ('player', 'club', 'scout')
   $routes->group('user', ['filter' => ['loginAuth']], function ($routes) {

      $routes->get('profile/(:num)/(:num)',              'UserController::userProfile/$1/$2');  // lang
      $routes->post('update-profile',                    'UserController::updateProfile');

      $routes->post('upload-profile-image',              'UserController::uploadProfileImage');
      $routes->post('upload-profile-image/(:num)',       'UserController::uploadProfileImage/$1');
      $routes->post('upload-cover-image/(:num)',         'UserController::uploadCoverImage/$1');

      $routes->get('get-profile-image',                  'UserController::getProfileImage');
      $routes->get('get-cover-image',                    'UserController::getCoverImage');

      $routes->get('delete-profile-image',               'UserController::deleteProfileImage');
      $routes->get('delete-cover-image/(:num)',          'UserController::deleteCoverImage/$1');

      $routes->post('upload-gallery-image',              'GalleryController::uploadGalleryImage');
      $routes->post('upload-gallery-image/(:num)',       'GalleryController::uploadGalleryImage/$1');
      $routes->get('get-gallery',                        'GalleryController::getGallery');
      $routes->get('get-gallery-highlights',             'GalleryController::getGalleryHighlights');

      $routes->post('delete-gallery-file',               'GalleryController::deleteGalleryFile');
      $routes->post('delete-gallery-file/(:num)',        'GalleryController::deleteGalleryFile/$1');
      $routes->post('set-featured-file',                 'GalleryController::SetFeaturedFile');
      $routes->post('set-featured-file/(:num)',          'GalleryController::SetFeaturedFile/$1');
      $routes->get('unset-featured-file/(:num)',         'GalleryController::UnSetFeaturedFile/$1');
      $routes->get('get-purchase-history',               'UserSubscriptionController::getUserPurchaseHistory');
      $routes->get('get-active-packages',                'UserSubscriptionController::getActivePackages');
      $routes->get('get-active-packages/(:num)',         'UserSubscriptionController::getActivePackages/$1');
      $routes->post('upgrade-subscription',              'StripeController::upgradeSubscription');
      $routes->post('cancel-subscription',               'StripeController::cancelSubscription');

      // $routes->get('upgrade-subscription/(:num)/(:num)', 'StripeController::upgradeSubscription/$1/$2');


      $routes->post('delete-nationality/(:num)',         'UserNationalityController::deleteUserNationality/$1');
      $routes->get('get-payment-methods',                'PaymentMethodController::getPaymentMethods');

      $routes->get('export-purchase-history',            'UserSubscriptionController::getUserPurchaseHistoryExport');

      $routes->post('settings/newsletter',               'UserController::updateNewsletterStatus');
      // $routes->get('settings/newsletter',                 'UserController::getNewsletterStatus');

      $routes->get('get-packages',                       'PackageController::getPackages');
      $routes->get('get-packages-new',                   'PackageController::getPackagesNew');
      $routes->get('delete-my-account/(:num)',           'UserController::deleteMyAccount/$1');
      $routes->get('delete-my-account',                  'UserController::deleteMyAccount');
      $routes->get('get-active-domains',                 'PackageController::getActiveDomains');
      $routes->get('get-active-domains/(:num)',          'PackageController::getActiveDomains/$1');
      $routes->post('track-booster-profile',             'BoosterStatisticController::addBoosterAction');
      $routes->get('get-booster-stats',                  'BoosterStatisticController::getBoosterAction');
      $routes->get('get-booster-stats/(:num)',           'BoosterStatisticController::getBoosterAction/$1');      // pass lang id
      $routes->post('update-booster-audience',           'BoosterAudiencController::updateBoosterAudience');
      $routes->post('validate-coupon',                   'StripeController::validateCoupon');

      $routes->get('generate-invoice-pdf/(:num)/(:num)',               'UserSubscriptionController::generateInvoicePDF/$1/$2');    //  subscription id / language id /

   });

   // clubAuth
   $routes->group('club', ['filter' => ['loginAuth', 'clubAuth']], function ($routes) {

      $routes->get('get-club-history',                   'UserController::getClubHistory');
      $routes->post('add-club-history',                  'UserController::addClubHistory');
      $routes->post('edit-club-history',                 'UserController::updateClubHistory');

      $routes->post('add-club-player',                   'ClubPlayerController::addClubPlayer');
      $routes->get('get-club-players/(:num)',            'ClubPlayerController::getClubPlayers/$1');           // first param team id, second param lang
      $routes->get('get-club-players/(:num)/(:num)',     'ClubPlayerController::getClubPlayers/$1/$2');           // first param team id, second param lang
      $routes->post('edit-club-player/(:num)',           'ClubPlayerController::EditClubPlayer/$1');
      $routes->get('delete-club-player/(:num)/(:num)',   'ClubPlayerController::deleteClubPlayer/$1/$2');            // second param lang id

      $routes->post('add-sighting',                      'SightingController::addSighting');
      $routes->post('delete-sighting',                   'SightingController::deleteSighting');
      $routes->get('get-sightings',                      'SightingController::getSightings');
      $routes->get('get-sighting/(:num)',                'SightingController::getSighting/$1');
      $routes->post('edit-sighting-cover/(:num)',        'SightingController::editSightingCover/$1');
      $routes->post('edit-sighting-detail/(:num)',       'SightingController::editSightingDetail/$1');
      $routes->post('edit-sighting-about/(:num)',        'SightingController::editSightingAbout/$1');
      $routes->post('add-sighting-attachments/(:num)',   'SightingController::addSightingAttachments/$1');
      $routes->get('delete-sighting-attachment/(:num)/(:num)',  'SightingController::deleteSightingAttachment/$1/$2');
      $routes->post('add-sighting-invites/(:num)',       'SightingController::addSightingInvites/$1');
      $routes->get('delete-sighting-invite/(:num)',      'SightingController::deleteSightingInvite/$1');
      $routes->get('delete-sighting-cover/(:num)',       'SightingController::deleteSightingCover/$1');

      $routes->post('add-representator',                 'UserController::addRepresentator');
      $routes->get('get-representators',                 'UserController::getRepresentators');
      $routes->post('update-representator-role/(:num)/(:num)',    'UserController::updateRepresentatorRole/$1/$2');
      $routes->get('delete-representator/(:num)/(:num)',          'UserController::deleteRepresentator/$1/$2');      // first param usuer id,  second param lang id
      $routes->post('update-representator/(:num)',                 'UserController::updateRepresentator/$1');         // representator ID


      // $routes->post('update-profile',                    'UserController::updateProfile');

   });

   // scoutAuth
   $routes->group('scout', ['filter' => ['loginAuth', 'scoutAuth']], function ($routes) {

      $routes->get('get-company-history',                'UserController::getCompanyHistory');
      $routes->post('add-company-history',               'UserController::addCompanyHistory');
      $routes->post('edit-company-history',              'UserController::editCompanyHistory');

      // $routes->post('add-scout-player',                  'ClubPlayerController::addScoutPlayer');
      // $routes->get('get-scout-players',                  'ClubPlayerController::getScoutPlayers');   
      // $routes->get('delete-scout-player/(:num)/(:num)',         'ClubPlayerController::deleteScoutPlayer/$1');

      $routes->post('add-scout-player',                         'ScoutPlayerController::addScoutPlayer');
      $routes->get('delete-scout-player/(:num)/(:num)',         'ScoutPlayerController::deleteScoutPlayer/$1/$2');
      $routes->get('get-scout-players/(:num)',                  'ScoutPlayerController::getScoutPlayers/$1');

      //representator
      $routes->post('add-representator',                 'UserController::addRepresentator');
      $routes->get('get-representators',                 'UserController::getRepresentators');
      $routes->post('update-representator-role/(:num)/(:num)',    'UserController::updateRepresentatorRole/$1/$2');
      $routes->get('delete-representator/(:num)/(:num)',          'UserController::deleteRepresentator/$1/$2');
      $routes->post('update-representator/(:num)',                 'UserController::updateRepresentator/$1');         // representator ID
   });
});

$routes->group('frontend', ['namespace' => 'App\Controllers\Frontend'], function ($routes) {

   header('Access-Control-Allow-Origin: *');
   header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Request-Method, Lang");
   header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");

   // $method = $_SERVER['REQUEST_METHOD'] ?? '';
   // $method = $_SERVER['REQUEST_METHOD'];
   // if ($method == "OPTIONS") {
   //    die();
   // }
   ##### New Routes #####
   $routes->post('test-save', 'PageMetaController::testSaveData', ['filter' => 'loginAuth']);
   $routes->get('test-get', 'PageMetaController::testGetData', ['filter' => 'loginAuth']);
   $routes->post('save-homepage', 'PageMetaController::homePageMetaData', ['filter' => 'loginAuth']);
   $routes->post('save-player-list', 'PageMetaController::playerList', ['filter' => 'loginAuth']);
   $routes->post('save-talentpage', 'PageMetaController::talentPageMetaData', ['filter' => 'loginAuth']);

   $routes->post('save-club-and-scout-page', 'PageMetaController::clubsAndScoutsMetaData', ['filter' => 'loginAuth']);
   $routes->post('save-contactpage', 'PageMetaController::contactPageMetaData', ['filter' => 'loginAuth']);
   $routes->post('save-newspage', 'PageMetaController::newsAndMediaMetaData', ['filter' => 'loginAuth']);
   $routes->post('save-tabs-homepage', 'PageMetaController::homePageTabsMetaData');
   $routes->post('save-aboutpage', 'PageMetaController::aboutPageMetaData', ['filter' => 'loginAuth']);
   $routes->get('get-page-by-id', 'PageMetaController::getPageByID');
   $routes->get('get-page-by-slug', 'PageMetaController::getPageByType');
   $routes->post('save-pricingpage', 'PageMetaController::savePricePageData', ['filter' => 'loginAuth']);
   $routes->post('save-faqpage', 'PageMetaController::saveFaqPageData', ['filter' => 'loginAuth']);
   $routes->post('save-content-page', 'PageMetaController::addContentPage', ['filter' => 'loginAuth']);
   $routes->post('save-contact-form', 'PageMetaController::contactFormSubmit');
   $routes->get('get-frontend-pages',        'PageMetaController::getFrontendPages');
   $routes->get('get-single-news/(:any)/(:num)',    'PageMetaController::getSingleNews/$1/$2');
   $routes->get('get-single-news/(:num)',    'PageMetaController::getSingleNews/$1');
   $routes->get('get-news-page/(:num)',    'PageMetaController::getNewsPage/$1');


   ##### End New Routes #####
});
