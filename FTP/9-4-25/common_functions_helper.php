<?php

// app/Helpers/info_helper.php
//use CodeIgniter\CodeIgniter;
use CodeIgniter\Shield\Models\UserModel;
use App\Models\UserMetaDataModel;
use App\Models\ActivityModel;
use App\Models\FavoriteModel;
use App\Models\UserSubscriptionModel;
use App\Models\PackageModel;
use App\Models\PackageDetailModel;
use App\Models\CouponModel;
use App\Models\DomainModel;
use App\Models\CountryModel;
use App\Models\EmailTemplateModel;
use App\Models\ActivityEventModel;

use App\Controllers\Api\UserSubscriptionController;

// use CodeIgniter\Shield\Authentication\Authentication;
// use CodeIgniter\Shield\Authentication\Authenticators\Session;
// use CodeIgniter\Shield\Entities\User;
// use CodeIgniter\Session\Session;


// use Mpdf;


function pr($data)
{
    return '<pre>' . print_r($data) . '</pre>';
}

function prx($data)
{
    return '<pre>' . print_r($data) . '</pre>';
    exit;
}

function sendEmail($data = [])
{
    if ($data) {

        $email = \Config\Services::email(true);
        $email->clear(true);

        $email->setFrom($data['fromEmail'], $data['fromName']);
        $email->setTo($data['toEmail']);

        if (isset($data['ccEmail']) && !empty($data['ccEmail'])) {
            $email->setCC($data['ccEmail']);
        }

        if (isset($data['bccEmail']) && !empty($data['bccEmail'])) {
            $email->setBCC($data['bccEmail']);
        }

        $email->setSubject($data['subject']);
        $email->setMessage($data['message']);

        log_message('debug', ' >>>>>>>>>>>>>>> sendEmail toEmail >>>>>>>>>>>>>>: ' . json_encode($data['toEmail']));
        log_message('debug', ' >>>>>>>>>>>>>>> sendEmail subject >>>>>>>>>>>>>>: ' . json_encode($data['subject']));

        if (isset($data['attachments']) && count($data['attachments']) > 0) {
            foreach ($data['attachments'] as $attachment) {
                $email->attach($attachment);
            }
        }

        $res = $email->send();
        // $email->clear(); // Clear the email object to release old attachments
        // $error = $email->printDebugger();
        // log_message('debug', ' >>>>>>>>>>>>>>> sendEmail error >>>>>>>>>>>>>>: ' . json_encode($error));

        return $res;
    }
}


function getLanguageCode($lang_id = null, $locale = false)
{
    $db = \Config\Database::connect();
    $lang_id = $lang_id ?? DEFAULT_LANGUAGE;
    $builder = $db->table('languages')->where('id', $lang_id)->get();
    $language = $builder->getRow();

    if ($language) {

        if ($locale == true) {
            return $language->locale;
        } else {
            return $language->slug;
        }
    } else {
        return 'en';
    }
}

function getClubName($club_id = null)
{
    $db = \Config\Database::connect();
    $builder = $db->table('clubs')->select('club_name')->where('taken_by', $club_id)->get();
    $clubInfo = $builder->getRow();

    if ($clubInfo) {
        return $clubInfo->club_name;
    }
}



function getPlayers_old($whereClause = [], $metaQuery = [], $search = '', $orderBy = '', $order = '',  $limit = 10, $offset = 0, $noLimit = false, $countOnly = false)
{
    $db = \Config\Database::connect();

    // Start building the main query
    $builder = $db->table('users');
    if (!$countOnly) {
        $builder->select('users.*, 
                            user_roles.role_name as role_name,
                            languages.language as language,
                            domains.domain_name as domain_name,
                            domains.location as user_location,
                            auth.secret as email,
                            us.status as subscription_status,
                            us.plan_period_start as plan_period_start,,
                            us.plan_period_end as plan_period_end,
                            packages.title as package_name,
                            us.plan_interval as plan_interval,
                            us.coupon_used as coupon_used
                        ',);
    } else {
        $builder->select('COUNT(*) as totalRecords');
    }

    //$builder->join('auth_identities', 'auth_identities.user_id = users.id', 'INNER');
    $builder->join('(SELECT user_id, secret FROM auth_identities WHERE type = "email_password") auth ', 'auth.user_id = users.id', 'LEFT');
    $builder->join('user_roles', 'user_roles.id = users.role', 'INNER');
    $builder->join('languages', 'languages.id = users.lang', 'INNER');
    $builder->join('domains', 'domains.id = users.user_domain', 'INNER');
    $builder->join('(SELECT MAX(id), user_id, status, package_id, plan_period_start, plan_period_end, plan_interval, coupon_used FROM user_subscriptions  GROUP BY user_id) us', 'us.user_id = users.id', 'LEFT');
    $builder->join('packages', 'packages.id = us.package_id', 'LEFT');


    if (isset($whereClause) && count($whereClause) > 0) {
        foreach ($whereClause as $key => $value) {
            if ($key == 'email') {
                $builder->like("auth_identities.secret", $value);
            }
            if ($key == 'location') {
                $builder->like("domains.id", $value);
            } else {
                $builder->where("users.$key", $value);
            }
        }
    }


    // Handle meta query with multiple key-value pairs
    if (isset($metaQuery) && count($metaQuery) > 0) {
        foreach ($metaQuery as $meta) {
            $metaBuilder = $db->table('user_meta');
            $metaBuilder->select('user_id')
                ->where('meta_key', $meta['meta_key']);

            // check if meta value is array or simple data            
            if (is_array($meta['meta_value'])) {
                $metaValue = $meta['meta_value'];
            } else {
                $metaValue = is_numeric($meta['meta_value']) ? (int)$meta['meta_value'] : $meta['meta_value'];
            }

            if ($meta['operator'] == "=") {
                $metaBuilder->where('meta_value', $metaValue);
            } else if ($meta['operator'] == ">=") {
                $metaBuilder->where('meta_value >=', $metaValue);
            } else if ($meta['operator'] == "<=") {
                $metaBuilder->where('meta_value <=', $metaValue);
            } else if ($meta['operator'] == "IN") {
                $metaBuilder->whereIN('meta_value', $metaValue);
            } else {
                $metaBuilder->like('meta_value', $metaValue);
            }
            $metaSubquery = $metaBuilder->getCompiledSelect();
            $builder->where("users.id IN ($metaSubquery)");
        }
    }

    if (isset($search) && !empty($search)) {
        $builder->groupStart();
        $builder->orLike('users.username', $search);
        $builder->orLike('users.first_name', $search);
        $builder->orLike('users.last_name', $search);
        $builder->orLike('CONCAT(users.first_name," ", users.last_name)', $search);
        $builder->orLike('auth.secret', $search);
        $builder->groupEnd();
    }

    // Count the total number of results
    // $countBuilder = clone $builder;
    // $countBuilder->select('COUNT(*) as total_count');
    $countQuery = $countBuilder->get();
    $totalCount = $countQuery->getRow()->total_count;

    // Add Sorting
    if (!empty($orderBy)) {
        $builder->orderBy($orderBy, $order);
    } else {
        $builder->orderBy('id', 'DESC');
    }

    // Add pagination
    if (!$noLimit) {
        $builder->limit($limit, $offset);
    }

    // $query = $builder->get();
    // echo '>>>>>>>> getLastQuery >>>>> '. $db->getLastQuery(); //exit;
    // die;

    if (!$countOnly) {
        $result = $query->getResultArray();

        // Process the results to merge metadata into user objects
        $users = [];

        foreach ($result as $row) {
            $userId = $row['id'];
            if (!isset($users[$userId])) {
                $users[$userId] = [
                    'id'                            => $row['id'],
                    'username'                      => $row['username'],
                    'email'                         => $row['email'],
                    'created_at'                    => $row['created_at'],
                    'updated_at'                    => $row['updated_at'],
                    'first_name'                    => $row['first_name'],
                    'last_name'                     => $row['last_name'],
                    'role_name'                     => $row['role_name'],
                    'language'                      => $row['language'],
                    'newsletter'                    => $row['newsletter'],
                    'user_domain'                   => $row['domain_name'],
                    'user_location'                 => $row['user_location'],
                    'last_active'                   => $row['last_active'],
                    'status'                        => $row['status'],
                    'subscription_status'           => $row['subscription_status'],
                    'plan_period_start'             => $row['plan_period_start'],
                    'plan_period_end'               => $row['plan_period_end'],
                    'package_name'                  => $row['package_name'],
                    'meta' => []
                ];
            }
        }

        // Get all meta data for each user
        $userIds = array_keys($users);
        if (!empty($userIds)) {
            $metaBuilder = $db->table('user_meta');
            $metaBuilder->whereIn('user_id', $userIds);
            $metaQuery = $metaBuilder->get();
            $metaResult = $metaQuery->getResultArray();

            foreach ($metaResult as $metaRow) {
                $userId = $metaRow['user_id'];
                $users[$userId]['meta'][$metaRow['meta_key']] = $metaRow['meta_value'];
            }
        }
    } else {
        $totalRecords = $query->getRow();
    }

    if (!$countOnly) {

        $userData = array_values($users);
        // return $userData;

        return [
            'totalCount'    => $totalCount,
            'userData'      => $userData
        ];
    } else {
        return $totalRecords;
    }
}


function getPlayers($whereClause = [], $metaQuery = [], $search = '', $orderBy = '', $order = '', $limit = 10, $offset = 0, $noLimit = false, $lang_id = null)
{
    $db = \Config\Database::connect();
    $language = \Config\Services::language();
    $lang_id = $lang_id ?? DEFAULT_LANGUAGE;
    $language->setLocale(getLanguageCode($lang_id, true));
    $currentLanguageCode = getLanguageCode($lang_id);

    $flagPath =  base_url() . 'uploads/logos/';

    // Start building the main query
    $builder = $db->table('users');
    // timeAgo(users.last_active)
    $builder->select('users.*, 
                        user_roles.role_name_' . $currentLanguageCode . ' as role_name,
                        languages.language_' . $currentLanguageCode . ' as language,
                        domains.domain_name as domain_name,
                        domains.location_' . $currentLanguageCode . ' as user_location,
                        auth.secret as email,
                        packages.title_' . $currentLanguageCode . ' as package_name,
                        pd.interval_' . $currentLanguageCode . ' as package_interval,
                        pm.last4 as last4,
                        pm.brand as brand,
                        pm.exp_month as exp_month,
                        pm.exp_year as exp_year,
                        us.status as subscription_status,
                        us.plan_period_start as plan_period_start,
                        us.plan_period_end as plan_period_end,
                        us.plan_interval as plan_interval,
                        us.coupon_used as coupon_used,

                        cb.club_name as pre_current_club_name,
                        cb.club_logo as pre_current_club_logo,
                        c2.country_flag as pre_current_club_country,
                        apu.permission as permission,

                        t.id as team_id,
                        t.team_type as team_type,
                        um2.meta_value as current_club_name,
                        um3.meta_value as current_club_logo,
                        c3.country_flag as current_club_country,

                        TIMESTAMPDIFF(SECOND, `users`.`last_active`, NOW()) AS activity_diff_seconds,
                        TIMESTAMPDIFF(SECOND, `users`.`created_at`, NOW()) AS registration_diff_seconds,

                        CASE
                            WHEN TIMESTAMPDIFF(SECOND, `users`.`last_active`, NOW()) < 60 THEN 
                                CONCAT(TIMESTAMPDIFF(SECOND, `users`.`last_active`, NOW()), " secs ago")
                            WHEN TIMESTAMPDIFF(MINUTE, `users`.`last_active`, NOW()) < 60 THEN 
                                CONCAT(TIMESTAMPDIFF(MINUTE, `users`.`last_active`, NOW()), " mins ago")
                            WHEN TIMESTAMPDIFF(HOUR, `users`.`last_active`, NOW()) < 24 THEN 
                                CONCAT(TIMESTAMPDIFF(HOUR, `users`.`last_active`, NOW()), " hours ago")
                            WHEN TIMESTAMPDIFF(DAY, `users`.`last_active`, NOW()) < 30 THEN 
                                 CONCAT(TIMESTAMPDIFF(DAY, `users`.`last_active`, NOW()), " days ago")
                            WHEN TIMESTAMPDIFF(MONTH, `users`.`last_active`, NOW()) < 12 THEN 
                                CONCAT(TIMESTAMPDIFF(MONTH, `users`.`last_active`, NOW()), " months ago")
                            ELSE 
                                CONCAT(TIMESTAMPDIFF(YEAR, `users`.`last_active`, NOW()), " years ago")
                        END AS last_activity_time,

                        CASE
                            WHEN TIMESTAMPDIFF(SECOND, `users`.`created_at`, NOW()) < 60 THEN 
                                CONCAT(TIMESTAMPDIFF(SECOND, `users`.`created_at`, NOW()), " secs ago")
                            WHEN TIMESTAMPDIFF(MINUTE, `users`.`created_at`, NOW()) < 60 THEN 
                                CONCAT(TIMESTAMPDIFF(MINUTE, `users`.`created_at`, NOW()), " mins ago")
                            WHEN TIMESTAMPDIFF(HOUR, `users`.`created_at`, NOW()) < 24 THEN 
                                CONCAT(TIMESTAMPDIFF(HOUR, `users`.`created_at`, NOW()), " hours ago")
                            WHEN TIMESTAMPDIFF(DAY, `users`.`created_at`, NOW()) < 30 THEN 
                                CONCAT(TIMESTAMPDIFF(DAY, `users`.`created_at`, NOW()), " days ago")
                            WHEN TIMESTAMPDIFF(MONTH, `users`.`created_at`, NOW()) < 12 THEN 
                                CONCAT(TIMESTAMPDIFF(MONTH, `users`.`created_at`, NOW()), " months ago")
                            ELSE 
                                CONCAT(TIMESTAMPDIFF(YEAR, `users`.`created_at`, NOW()), " years ago")
                        END AS registration_time,

                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                "country_name", c.country_name, 
                                "flag_path", CONCAT("' . $flagPath . '", c.country_flag)
                            )
                        ) AS user_nationalities,

                        l.league_name as league_name,
                        l.league_logo as league_logo,
                        CONCAT("' . $flagPath . '", l.league_logo) as league_logo_path
                    ');



    // $builder->join('(SELECT user_id, secret FROM auth_identities WHERE type = "email_password") auth', 'auth.user_id = users.id', 'LEFT');
    $builder->join('auth_identities auth', 'auth.user_id = users.id AND type = "email_password"', 'LEFT');
    $builder->join('user_roles', 'user_roles.id = users.role', 'INNER');
    $builder->join('languages', 'languages.id = users.lang', 'INNER');
    $builder->join('domains', 'domains.id = users.user_domain', 'INNER');
    $builder->join('user_nationalities un', 'un.user_id = users.id', 'LEFT');
    $builder->join('countries c', 'c.id = un.country_id', 'LEFT');
    $builder->join('(SELECT user_id, brand, exp_month, exp_year, last4 FROM payment_methods WHERE is_default = 1) pm', 'pm.user_id = users.id', 'LEFT');
    $builder->join('user_meta um', 'um.user_id = users.id AND um.meta_key = "current_club"', 'LEFT');
    $builder->join('league_clubs lc', 'lc.club_id = um.meta_value', 'LEFT');
    $builder->join('leagues l', 'l.id = lc.league_id', 'LEFT');

    // get current club details (registered and verified clubs)
    $builder->join('club_players cp', 'cp.player_id = users.id AND cp.status = "active"', 'LEFT');
    $builder->join('teams t', 't.id = cp.team_id', 'LEFT');
    $builder->join('clubs cb2', 'cb2.id = t.club_id', 'LEFT');
    $builder->join('user_meta um2', 'um2.user_id = cb2.taken_by AND um2.meta_key = "club_name"', 'LEFT');
    $builder->join('countries c3', 'c3.id = t.country_id', 'LEFT');
    $builder->join('user_meta um3', 'um3.user_id = t.club_id AND um3.meta_key = "profile_image"', 'LEFT');


    // additoinal current club of player/talent (default clubs)
    $builder->join('user_meta um5', 'um5.user_id = users.id AND um5.meta_key = "pre_club_id"', 'LEFT');
    $builder->join('clubs cb', 'cb.id = um5.meta_value', 'LEFT');
    $builder->join('countries c2', 'c2.id = cb.country_id', 'LEFT');
    $builder->join('auth_permissions_users apu', 'apu.user_id = users.id', 'LEFT');

    if (isset($whereClause['selectedUserIds']) && !empty($whereClause['selectedUserIds'])) {
        if (is_array($whereClause['selectedUserIds'])) {
        } else {
            $whereClause['selectedUserIds'] = explode(',', $whereClause['selectedUserIds']);
        }
        //   echo '<pre>'; print_r($whereClause['selectedUserIds']); die;
        $builder->whereIn('users.id', $whereClause['selectedUserIds']);
        unset($whereClause['selectedUserIds']); // unset after use
    }
    if (isset($whereClause['created_month_year']) && !empty($whereClause['created_month_year'])) {
        $value = $whereClause['created_month_year'];
        $monthYear = explode('_', $value);
        $month = $monthYear[0];
        $year = $monthYear[1];
        $builder->where('YEAR(users.created_at)', $year)
        ->where('MONTH(users.created_at)', $month);
        unset($whereClause['created_month_year']);
    }
    // START: membership check
    if (isset($whereClause['membership'])) {

        if ($whereClause['membership'] == 'paid') {
            $builder->join('(SELECT id as max_id, user_id, status, package_id, plan_period_start, plan_period_end, plan_interval, coupon_used FROM user_subscriptions WHERE id IN (SELECT MAX(id) as max_id FROM user_subscriptions GROUP BY user_id) AND status = "active") us', 'us.user_id = users.id', 'INNER');
        } else {
            $builder->join('user_subscriptions us', 'us.user_id = users.id', 'LEFT');
        }
    } else {
        $builder->join('(SELECT id as max_id, user_id, status, package_id, plan_period_start, plan_period_end, plan_interval, coupon_used FROM user_subscriptions WHERE id IN (SELECT MAX(id) as max_id FROM user_subscriptions GROUP BY user_id)) us', 'us.user_id = users.id', 'LEFT');
    }
    // END: membership check


    $builder->join('package_details pd', 'pd.id = us.package_id', 'LEFT');
    $builder->join('packages', 'packages.id = pd.package_id', 'LEFT');

    $builder->where('users.deleted_at', NULL);
    $builder->where("users.status IS NOT NULL");
    $builder->whereNotIn("users.role", [5]);

    if (auth()->id()) {
        $builder->whereNotIn("users.id", [auth()->id()]);

        // if(!in_array(auth()->id(), ADMIN_ROLES)){
        //     $builder->where("users.status", 2);     // 2 => verified users
        // }

    }

    // Build the query with the same conditions
    if (isset($whereClause) && count($whereClause) > 0) {
        foreach ($whereClause as $key => $value) {
            if ($key == 'membership') {
                continue;
            } elseif ($key == 'email') {
                $builder->like("auth.secret", $value);
            } elseif ($key == 'location') {
                $builder->like("domains.id", $value);
            } /* elseif ($key == 'last_active') {
                $builder->where("users.last_active >= ", ( CURDATE() " - INTERVAL". $value ));
            } */ else {
                $builder->where("users.$key", $value);
            }
        }
    }

    if (isset($metaQuery) && count($metaQuery) > 0) {
        foreach ($metaQuery as $meta) {
            $metaBuilder = $db->table('user_meta');
            $metaBuilder->select('user_id')
                ->where('meta_key', $meta['meta_key']);

            $metaValue = is_array($meta['meta_value']) ? $meta['meta_value'] : (is_numeric($meta['meta_value']) ? (int)$meta['meta_value'] : $meta['meta_value']);

            if ($meta['operator'] == "=") {
                $metaBuilder->where('meta_value', $metaValue);
            } elseif ($meta['operator'] == ">=") {
                $metaBuilder->where('meta_value >=', $metaValue);
            } elseif ($meta['operator'] == "<=") {
                $metaBuilder->where('meta_value <=', $metaValue);
            } elseif ($meta['operator'] == "IN") {
                $metaBuilder->whereIn('meta_value', $metaValue);
            } else {
                $metaBuilder->like('meta_value', $metaValue);
            }

            $metaSubquery = $metaBuilder->getCompiledSelect();
            $builder->where("users.id IN ($metaSubquery)");
        }
    }

    // START: membership check
    // check only users with free membership
    if (isset($whereClause['membership']) && $whereClause['membership'] == 'free') {
        $builder->where("us.user_id", NULL);
    }
    // END: membership check


    if (isset($search) && !empty($search)) {
        $builder->groupStart();
        $builder->orLike('users.username', $search);
        $builder->orLike('users.first_name', $search);
        $builder->orLike('users.last_name', $search);
        $builder->orLike('CONCAT(TRIM(users.first_name), " ", TRIM(users.last_name))', $search);
        $builder->orLike('auth.secret', $search);
        $builder->groupEnd();
    }

    $builder->groupBy('users.id');

    // Count the total number of results
    // $countBuilder  = $db->newQuery()->select('count(*) as total_count')->fromSubquery($builder, 'counter_table');
    // $countQuery = $countBuilder->get();
    // $totalCount = $countQuery->getRow()->total_count;

    // Count the total number of results
    $countBuilder = clone $builder;
    $countQuery = $countBuilder->get();
    $totalCount =  $countQuery->getNumRows();


    // Add Sorting
    if (!empty($orderBy)) {
        $builder->orderBy($orderBy, $order);
    } else {
        $builder->orderBy('id', 'DESC');
    }

    // Add pagination
    if ($noLimit != true) {
        $builder->limit($limit, $offset);
    }

    // Execute the main query
    $query = $builder->get();
    // echo '>>>>>>>> getLastQuery getplayers>>>>> '. $db->getLastQuery(); exit;
    // die;
    // echo $db->getLastQuery(); die;

    $result = $query->getResultArray();

    // Process the results to merge metadata into user objects
    $users = [];
    foreach ($result as $row) {
        $userId = $row['id'];
        if (!isset($users[$userId])) {

            // last activity
            if ($row['activity_diff_seconds'] > 0) {
                if ($row['activity_diff_seconds'] < 60) {
                    $last_activity =  lang('Time.ago.seconds', [$row['activity_diff_seconds']]);
                } elseif ($row['activity_diff_seconds'] < 3600) {
                    $minutes = floor($row['activity_diff_seconds'] / 60);
                    $last_activity = lang('Time.ago.minutes', [$minutes]);
                } elseif ($row['activity_diff_seconds'] < 86400) {
                    $hours = floor($row['activity_diff_seconds'] / 3600);
                    $last_activity = lang('Time.ago.hours', [$hours]);
                } elseif ($row['activity_diff_seconds'] < 2592000) {
                    $days = floor($row['activity_diff_seconds'] / 86400);
                    $last_activity = lang('Time.ago.days', [$days]);
                } elseif ($row['activity_diff_seconds'] < 31536000) {
                    $month = floor($row['activity_diff_seconds'] / 2592000);
                    $last_activity = lang('Time.ago.months', [$month]);
                } else {
                    $years = floor($row['activity_diff_seconds'] / 31536000);
                    $last_activity = lang('Time.ago.years', [$years]);
                }
            } else {
                $last_activity = '';
            }

            // registration time
            if ($row['registration_diff_seconds'] < 60) {
                $registration_time =  lang('Time.ago.seconds', [$row['registration_diff_seconds']]);
            } elseif ($row['registration_diff_seconds'] < 3600) {
                $minutes = floor($row['registration_diff_seconds'] / 60);
                $registration_time = lang('Time.ago.minutes', [$minutes]);
            } elseif ($row['registration_diff_seconds'] < 86400) {
                $hours = floor($row['registration_diff_seconds'] / 3600);
                $registration_time = lang('Time.ago.hours', [$hours]);
            } elseif ($row['registration_diff_seconds'] < 2592000) {
                $days = floor($row['registration_diff_seconds'] / 86400);
                $registration_time = lang('Time.ago.days', [$days]);
            } elseif ($row['registration_diff_seconds'] < 31536000) {
                $month = floor($row['registration_diff_seconds'] / 2592000);
                $registration_time = lang('Time.ago.months', [$month]);
            } else {
                $years = floor($row['registration_diff_seconds'] / 31536000);
                $registration_time = lang('Time.ago.years', [$years]);
            }


            $users[$userId] = [
                'id'                            => $row['id'],
                'username'                      => $row['username'],
                'email'                         => $row['email'],
                'created_at'                    => $row['created_at'],
                'updated_at'                    => $row['updated_at'],
                'first_name'                    => $row['first_name'],
                'last_name'                     => $row['last_name'],
                'role_name'                     => $row['role_name'],
                'language'                      => $row['language'],
                'newsletter'                    => $row['newsletter'],
                'user_domain'                   => $row['domain_name'],
                'user_location'                 => $row['user_location'],
                'last_active'                   => $row['last_active'],
                'status'                        => $row['status'],
                'last4'                         => $row['last4'],
                'brand'                         => $row['brand'],
                'exp_month'                     => $row['exp_month'],
                'exp_year'                      => $row['exp_year'],
                'package_name'                  => $row['package_name'],
                'subscription_status'           => $row['subscription_status'],
                'plan_period_start'             => $row['plan_period_start'],
                'plan_period_end'               => $row['plan_period_end'],
                'plan_interval'                 => $row['plan_interval'],
                'coupon_used'                   => $row['coupon_used'],
                'last_activity_time'            => $last_activity,
                'registration_time'             => $registration_time,

                'team_type'                     => $row['team_type'],
                'current_club_name'             => $row['current_club_name'],
                'current_club_country'          => $row['current_club_country'],
                'current_club_logo'             => $row['current_club_logo'],
                'pre_current_club_name'         => $row['pre_current_club_name'],
                'pre_current_club_logo'         => $row['pre_current_club_logo'],
                'pre_current_club_country'      => $row['pre_current_club_country'],

                'user_nationalities'            => $row['user_nationalities'],
                'league_name'                   => $row['league_name'],
                'league_logo'                   => $row['league_logo'],
                'league_logo_path'              => $row['league_logo_path'],
                'meta' => []
            ];
        }
    }

    $flagPath =  base_url() . 'uploads/logos/';
    $imagePath = base_url() . 'uploads/';

    // Get all meta data for each user
    $userIds = array_keys($users);
    if (!empty($userIds)) {
        $metaBuilder = $db->table('user_meta');
        $metaBuilder->whereIn('user_id', $userIds);
        $metaQuery = $metaBuilder->get();
        $metaResult = $metaQuery->getResultArray();

        foreach ($metaResult as $metaRow) {
            //pr($metaRow);
            $userId = $metaRow['user_id'];
            $users[$userId]['meta'][$metaRow['meta_key']] = $metaRow['meta_value'];
            if ($metaRow['meta_key'] == 'profile_image') {
                $users[$userId]['meta']['profile_image_path'] = $imagePath . $metaRow['meta_value'];
            }
            if ($metaRow['meta_key'] == 'cover_image') {
                $users[$userId]['meta']['cover_image_path'] = $imagePath . $metaRow['meta_value'];
            }
        }
    }

    $userData = array_values($users);
    return [
        'totalCount'    => $totalCount,
        'imagePath'     => $imagePath,
        'flagPath'      => $flagPath,
        'users'         => $userData
    ];
}

function getPlayersOnFrontend_old($whereClause = [], $metaQuery = [], $search = '', $orderBy = '', $order = '', $limit = 10, $offset = 0, $noLimit = false, $currentLang = null)
{
    $db = \Config\Database::connect();
    $currentLangCode = getLanguageCode($currentLang);
    // $auth = service('auth'); // Manually load the auth service
    // $userId = $auth->id();

    $flagPath =  base_url() . 'uploads/logos/';
    $imagePath = base_url() . 'uploads/';

    $booster_package_id = '3, 4';
    // BOOSTER_PACKAGES

    // Start building the main query
    $builder = $db->table('users');
    $builder->select('users.*, 
                        user_roles.role_name_' . $currentLangCode . ' as role_name,
                        languages.language_' . $currentLangCode . ' as language,
                        domains.domain_name as domain_name,
                        domains.location_' . $currentLangCode . ' as user_location,
                        auth.secret as email,
                        us.status as subscription_status,
                        us.plan_period_start as plan_period_start,
                        us.plan_period_end as plan_period_end,
                        us.title as package_name,

                        cb.club_name as pre_current_club_name,
                        cb.club_logo as pre_current_club_logo,
                        c2.country_flag as pre_current_club_country,
                        apu.permission as permission,

                        t.id as team_id,
                        t.team_type as team_type,
                        um2.meta_value as current_club_name,
                        um3.meta_value as current_club_logo,
                        c3.country_flag as current_club_country,
                        
                        CASE
                            WHEN TIMESTAMPDIFF(SECOND, `users`.`last_active`, NOW()) < 60 THEN 
                                CONCAT(TIMESTAMPDIFF(SECOND, `users`.`last_active`, NOW()), " secs ago")
                            WHEN TIMESTAMPDIFF(MINUTE, `users`.`last_active`, NOW()) < 60 THEN 
                                CONCAT(TIMESTAMPDIFF(MINUTE, `users`.`last_active`, NOW()), " mins ago")
                            WHEN TIMESTAMPDIFF(HOUR, `users`.`last_active`, NOW()) < 24 THEN 
                                CONCAT(TIMESTAMPDIFF(HOUR, `users`.`last_active`, NOW()), " hours ago")
                            WHEN TIMESTAMPDIFF(DAY, `users`.`last_active`, NOW()) < 30 THEN 
                                CONCAT(TIMESTAMPDIFF(DAY, `users`.`last_active`, NOW()), " days ago")
                            WHEN TIMESTAMPDIFF(MONTH, `users`.`last_active`, NOW()) < 12 THEN 
                                CONCAT(TIMESTAMPDIFF(MONTH, `users`.`last_active`, NOW()), " months ago")
                            ELSE 
                                CONCAT(TIMESTAMPDIFF(YEAR, `users`.`last_active`, NOW()), " years ago")
                        END AS last_activity_time,

                        pp.position_id as position_id,

                        JSON_ARRAYAGG(
                            DISTINCT JSON_OBJECT(
                                "country_name", c.country_name, 
                                "flag_path", CONCAT("' . $flagPath . '", c.country_flag)
                            )
                        ) AS user_nationalities,

                        c4.country_name as birth_country_name,
                        c4.country_flag as birth_country_flag
                        
                    ');

    // Adding more select fields conditionally
    if (auth()->id()) {
        $builder->select('us.target_role as target_role');
    }

    //$builder->join('auth_identities', 'auth_identities.user_id = users.id', 'INNER');
    $builder->join('auth_identities auth', 'auth.user_id = users.id AND  auth.type = "email_password"', 'LEFT');
    $builder->join('user_roles', 'user_roles.id = users.role', 'INNER');
    $builder->join('languages', 'languages.id = users.lang', 'INNER');

    $builder->join('domains', 'domains.id = users.user_domain', 'INNER');
    $builder->join('user_nationalities un', 'un.user_id = users.id', 'LEFT');
    $builder->join('countries c', 'c.id = un.country_id', 'LEFT');

    // for positions
    $builder->join('player_positions pp', 'pp.user_id = users.id', 'LEFT');

    // get current club details (registered and verified clubs)
    $builder->join('club_players cp', 'cp.player_id = users.id AND cp.status = "active"', 'LEFT');
    $builder->join('teams t', 't.id = cp.team_id', 'LEFT');
    $builder->join('clubs cb2', 'cb2.id = t.club_id', 'LEFT');
    $builder->join('user_meta um2', 'um2.user_id = cb2.taken_by AND um2.meta_key = "club_name"', 'LEFT');
    $builder->join('countries c3', 'c3.id = t.country_id', 'LEFT');
    $builder->join('user_meta um3', 'um3.user_id = t.club_id AND um3.meta_key = "profile_image"', 'LEFT');


    // additoinal current club of player/talent (default clubs)
    $builder->join('user_meta um5', 'um5.user_id = users.id AND um5.meta_key = "pre_club_id"', 'LEFT');
    $builder->join('clubs cb', 'cb.id = um5.meta_value', 'LEFT');
    $builder->join('countries c2', 'c2.id = cb.country_id', 'LEFT');
    $builder->join('auth_permissions_users apu', 'apu.user_id = users.id', 'LEFT');

    // birth_country
    $builder->join('user_meta um6', 'um6.user_id = users.id AND um6.meta_key = "birth_country"', 'LEFT');
    $builder->join('countries c4', 'c4.id = um6.meta_value', 'LEFT');

    // This join not returning latest info
    // $builder->join('(SELECT MAX(id) as max_id, user_id, status, package_id, plan_period_start, plan_period_end 
    //                  FROM user_subscriptions 
    //                  GROUP BY user_id
    //                 ) us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');




    /* if (auth()->id()) {
        $targetRole = auth()->user()->role;
        $builder->join('(SELECT uss.id, uss.user_id, uss.status, uss.package_id, uss.plan_period_start, uss.plan_period_end, ad.target_role
                    FROM user_subscriptions uss
                    INNER JOIN (
                        SELECT user_id, MAX(id) as max_id
                        FROM user_subscriptions
                        GROUP BY user_id
                    ) latest ON uss.id = latest.max_id

                    LEFT JOIN audiences ad
                    ON ad.subscription_id = uss.id AND ad.target_role = ' . $targetRole . ') us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');
    } else {
        // this join returning latest subscription info
        $builder->join('(SELECT uss.id, uss.user_id, uss.status, uss.package_id, uss.plan_period_start, uss.plan_period_end
                        FROM user_subscriptions uss
                        INNER JOIN (
                            SELECT user_id, MAX(id) as max_id
                            FROM user_subscriptions
                            GROUP BY user_id
                        ) latest ON uss.id = latest.max_id) us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');
    } */

    if (auth()->id() && !in_array(auth()->id(), ADMIN_ROLES)) {
        $targetRole = auth()->user()->role;

        $builder->join('(SELECT uss.id, uss.user_id, uss.status, uss.package_id, uss.plan_period_start, uss.plan_period_end, p.title, ba.target_role
                        FROM user_subscriptions uss
                        LEFT JOIN package_details pd ON pd.id = uss.package_id
                        LEFT JOIN packages p ON p.id = pd.package_id
                               

                        LEFT JOIN booster_audiences ba
                        ON ba.subscription_id = uss.stripe_subscription_id AND ba.target_role = ' . $targetRole . '

                        WHERE uss.package_id IN(' . $booster_package_id . ')
                        AND uss.status = "active"
                        

                    ) us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');

        // LEFT JOIN users u ON u.id = uss.user_id
        // AND (p.domain_id = '.$whereClause["user_domain"].' OR u.user_domain = '.$whereClause["user_domain"].')
    } else {
        // this join returning latest subscription info
        $builder->join('(SELECT uss.id, uss.user_id, uss.status, uss.package_id, uss.plan_period_start, uss.plan_period_end, p.title
                        FROM user_subscriptions uss
                        LEFT JOIN package_details pd ON pd.id = uss.package_id
                        LEFT JOIN packages p ON p.id = pd.package_id
                        WHERE uss.package_id IN(' . $booster_package_id . ')
                        AND uss.status = "active"
                        ) us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');
    }

    // $builder->join('packages', 'packages.id = us.package_id', 'LEFT');

    $builder->where('users.deleted_at', NULL);
    $builder->whereNotIn("users.role", [1, 5]);
    $builder->whereIn("users.status", [2]);

    if (auth()->id()) {
        $builder->whereNotIn("users.id", [auth()->id()]);
    }

    // if (auth()->id() &&  !in_array(auth()->id(), ADMIN_ROLES)) {
    //     $builder->whereIn("users.status", [2]);
    // } else {
    //     $builder->whereIn("users.status", [2]);
    // }

    // echo $key; die('dd');
    // echo '<pre>'; print_r($whereClause); die;
    if (isset($whereClause) && count($whereClause) > 0) {
        foreach ($whereClause as $key => $value) {
            if ($key == "user_domain") {
                continue;
            }

            if ($key == 'email') {
                $builder->like("auth_identities.secret", $value);
            } elseif ($key == 'location') {
                $builder->where("domains.id", $value);
                // $builder->where("users.user_domain", $value);
                // continue;
            } elseif ($key == 'position') {
                $builder->whereIn("pp.position_id", $value);
            } elseif ($key == 'age') {
                $builder->whereIn('(
                    SELECT DATE_FORMAT(FROM_DAYS(DATEDIFF(now(),
                    (SELECT meta_value FROM user_meta umm WHERE umm.user_id = users.id AND umm.meta_key = "date_of_birth")
                    )), "%Y")+0 
                )', $value);
            } else {
                $builder->where("users.$key", $value);
            }
        }
    }

    // Handle meta query with multiple key-value pairs
    if (isset($metaQuery) && count($metaQuery) > 0) {
        // pr($metaQuery); //exit;
        foreach ($metaQuery as $meta) {
            $metaBuilder = $db->table('user_meta');
            $metaBuilder->select('user_id')
                ->where('meta_key', $meta['meta_key']);

            $metaValue = is_array($meta['meta_value']) ? $meta['meta_value'] : (is_numeric($meta['meta_value']) ? (int)$meta['meta_value'] : $meta['meta_value']);

            switch ($meta['operator']) {
                case "=":
                    $metaBuilder->where('meta_value', $metaValue);
                    break;
                case ">=":
                    $metaBuilder->where('meta_value >=', $metaValue);
                    break;
                case "<=":
                    $metaBuilder->where('meta_value <=', $metaValue);
                    break;
                case "IN":
                    $metaBuilder->whereIn('meta_value', $metaValue);
                    break;
                default:
                    $metaBuilder->like('meta_value', $metaValue);
                    break;
            }
            $metaSubquery = $metaBuilder->getCompiledSelect();
            $builder->where("users.id IN ($metaSubquery)");
        }
    }

    if (isset($search) && !empty($search)) {
        $builder->groupStart();
        $builder->orLike('users.username', $search);
        $builder->orLike('users.first_name', $search);
        $builder->orLike('users.last_name', $search);
        $builder->orLike('auth.secret', $search);
        $builder->groupEnd();
    }

    // Add custom condition for user_domain
    // show user on other domains id have active multi-country package
    if (isset($whereClause['user_domain'])) {

        $user_domain = $whereClause['user_domain'];

        $builder->groupStart();
        $builder->where('users.user_domain', $user_domain);
        $builder->orGroupStart()
            ->whereIn('users.id', function ($subQuery) use ($user_domain) {
                return $subQuery->select('DISTINCT(user_id)')
                    ->from('user_subscriptions')
                    ->whereIn('package_id', function ($subSubQuery) use ($user_domain) {
                        // return $subSubQuery->select('id')
                        //     ->from('packages')
                        //     ->where('domain_id', $user_domain);

                        // $countryPackages = implode(",", COUNTRY_PACKAGES);
                        return $subSubQuery->select('pd.id')
                            ->from('package_details pd')
                            ->join('packages p', 'p.id = pd.package_id', 'RIGHT')
                            ->where('p.domain_id', $user_domain);
                        // ->whereIn('pd.id', $countryPackages);

                        // SELECT pd.id, p.domain_id FROM `package_details` pd RIGHT JOIN packages p ON p.id = pd.package_id WHERE p.domain_id = 7;

                    })
                    ->where('status', "active")
                    ->where('CURRENT_DATE() <= plan_period_end');
            })
            ->groupEnd();
        $builder->groupEnd();
    }

    $builder->groupBy('users.id');

    // Count the total number of results
    //  $countBuilder  = $db->newQuery()->select('count(*) as total_count')->fromSubquery($builder, 'counter_table');
    //  $countQuery = $countBuilder->get();
    //  $totalCount = $countQuery->getRow()->total_count;

    // Count the total number of results
    $countBuilder = clone $builder;
    $countQuery = $countBuilder->get();
    $totalCount =  $countQuery->getNumRows();

    // Count the total number of results
    // $countBuilder = clone $builder;
    // $countBuilder->select('COUNT(*) as total_count');
    // $countQuery = $countBuilder->get();
    // $totalCount = $countQuery->getRow()->total_count;

    if (auth()->id()) {
        $targetRole = auth()->user()->role;

        $builder->orderBy("
            CASE 
                WHEN us.target_role = '" . $targetRole . "' THEN 1
                WHEN us.title = 'Booster' THEN 2
                ELSE 3
            END
        ");
    } else {
        $builder->orderBy("
            CASE 
                WHEN us.title = 'Booster' THEN 1
                WHEN us.title = 'Premium' THEN 2
                ELSE 3
            END
        ");
    }

    // Add sorting
    if (!empty($orderBy)) {
        $builder->orderBy($orderBy, $order);
    } else {
        $builder->orderBy('users.last_active', 'DESC');          // order by last activity
        // $builder->orderBy('users.id', 'DESC');
    }

    // Add pagination
    if ($noLimit != true) {
        $builder->limit($limit, $offset);
    }

    $query = $builder->get();
    // echo '>>>>>>>>>>>>>>>>>> getLastQuery >>> ' . $db->getLastQuery(); //exit;

    $result = $query->getResultArray();
    // pr($result);

    // Process the results to merge metadata into user objects
    $users = [];

    // $flagPath =  base_url() . 'uploads/logos/';
    // $imagePath = base_url() . 'uploads/';

    foreach ($result as $row) {
        $userId = $row['id'];
        if (!isset($users[$userId])) {
            $users[$userId] = [
                'id'                        => $row['id'],
                'username'                  => $row['username'],
                'email'                     => $row['email'],
                'created_at'                => $row['created_at'],
                'updated_at'                => $row['updated_at'],
                'first_name'                => $row['first_name'],
                'last_name'                 => $row['last_name'],
                'role_name'                 => $row['role_name'],
                'language'                  => $row['language'],
                'newsletter'                => $row['newsletter'],
                'user_domain'               => $row['domain_name'],
                'user_location'             => $row['user_location'],
                'last_active'               => $row['last_active'],
                'status'                    => $row['status'],
                'subscription_status'       => $row['subscription_status'],
                'plan_period_start'         => $row['plan_period_start'],
                'plan_period_end'           => $row['plan_period_end'],
                'package_name'              => $row['package_name'],
                'last_activity_time'        => $row['last_activity_time'],
                'user_nationalities'        => $row['user_nationalities'],

                'team_type'                 => $row['team_type'],
                'current_club_name'         => $row['current_club_name'],
                'current_club_country'      => $row['current_club_country'],
                'current_club_logo'         => $row['current_club_logo'],
                'pre_current_club_name'     => $row['pre_current_club_name'],
                'pre_current_club_logo'     => $row['pre_current_club_logo'],
                'pre_current_club_country'  => $row['pre_current_club_country'],
                'birth_country_name'        => $row['birth_country_name'],
                'birth_country_flag'        => $row['birth_country_flag'],

                'meta'                      => []
            ];
        }
    }

    // um3.meta_value as current_club_logo,
    // c3.country_flag as current_club_country,

    // cb.club_logo as pre_current_club_logo,
    //                     c2.country_flag as pre_current_club_country,

    $imagePath = base_url() . 'uploads/';
    $flagPath = base_url() . 'uploads/flags/';
    $logoPath = base_url() . 'uploads/logos/';

    // Get all meta data for each user
    $userIds = array_keys($users);
    if (!empty($userIds)) {
        $metaBuilder = $db->table('user_meta');
        $metaBuilder->whereIn('user_id', $userIds);
        $metaQuery = $metaBuilder->get();
        $metaResult = $metaQuery->getResultArray();

        foreach ($metaResult as $metaRow) {
            $userId = $metaRow['user_id'];
            $users[$userId]['meta'][$metaRow['meta_key']] = $metaRow['meta_value'];
            if ($metaRow['meta_key'] == 'profile_image') {
                $users[$userId]['meta']['profile_image_path'] = $imagePath . $metaRow['meta_value'];
            }
            if ($metaRow['meta_key'] == 'cover_image') {
                $users[$userId]['meta']['cover_image_path'] = $imagePath . $metaRow['meta_value'];
            }
        }
    }

    $userData = array_values($users);

    return [
        'totalCount'    => $totalCount,
        'imagePath'     => $imagePath,
        'flagPath'      => $flagPath,
        'logoPath'      => $logoPath,
        'users'         => $userData
    ];
}

function getPlayersOnFrontend__old2($whereClause = [], $metaQuery = [], $search = '', $orderBy = '', $order = '', $limit = 10, $offset = 0, $noLimit = false, $currentLang = null)
{
    $db = \Config\Database::connect();
    $currentLangCode = getLanguageCode($currentLang);
    // $auth = service('auth'); // Manually load the auth service
    // $userId = $auth->id();

    // pr($whereClause);
 
    $flagPath =  base_url() . 'uploads/logos/';
    $imagePath = base_url() . 'uploads/';

    $booster_package_id = '3, 4';
    // BOOSTER_PACKAGES

    // Start building the main query
    $builder = $db->table('users');
    $builder->select('users.*, 
                        user_roles.role_name_' . $currentLangCode . ' as role_name,
                        languages.language_' . $currentLangCode . ' as language,
                        domains.domain_name as domain_name,
                        domains.location_' . $currentLangCode . ' as user_location,
                        auth.secret as email,
                        us.status as subscription_status,
                        us.plan_period_start as plan_period_start,
                        us.plan_period_end as plan_period_end,
                        us.title as package_name,

                        cb.club_name as pre_current_club_name,
                        cb.club_logo as pre_current_club_logo,
                        c2.country_flag as pre_current_club_country,
                        apu.permission as permission,

                        t.id as team_id,
                        t.team_type as team_type,
                        um2.meta_value as current_club_name,
                        um3.meta_value as current_club_logo,
                        c3.country_flag as current_club_country,
                        
                        CASE
                            WHEN TIMESTAMPDIFF(SECOND, `users`.`last_active`, NOW()) < 60 THEN 
                                CONCAT(TIMESTAMPDIFF(SECOND, `users`.`last_active`, NOW()), " secs ago")
                            WHEN TIMESTAMPDIFF(MINUTE, `users`.`last_active`, NOW()) < 60 THEN 
                                CONCAT(TIMESTAMPDIFF(MINUTE, `users`.`last_active`, NOW()), " mins ago")
                            WHEN TIMESTAMPDIFF(HOUR, `users`.`last_active`, NOW()) < 24 THEN 
                                CONCAT(TIMESTAMPDIFF(HOUR, `users`.`last_active`, NOW()), " hours ago")
                            WHEN TIMESTAMPDIFF(DAY, `users`.`last_active`, NOW()) < 30 THEN 
                                CONCAT(TIMESTAMPDIFF(DAY, `users`.`last_active`, NOW()), " days ago")
                            WHEN TIMESTAMPDIFF(MONTH, `users`.`last_active`, NOW()) < 12 THEN 
                                CONCAT(TIMESTAMPDIFF(MONTH, `users`.`last_active`, NOW()), " months ago")
                            ELSE 
                                CONCAT(TIMESTAMPDIFF(YEAR, `users`.`last_active`, NOW()), " years ago")
                        END AS last_activity_time,

                        pp.position_id as position_id,

                        JSON_ARRAYAGG(
                            DISTINCT JSON_OBJECT(
                                "country_name", c.country_name, 
                                "flag_path", CONCAT("' . $flagPath . '", c.country_flag)
                            )
                        ) AS user_nationalities,

                        c4.country_name as birth_country_name,
                        c4.country_flag as birth_country_flag
                        
                    ');

    // Adding more select fields conditionally
    if (auth()->id()) {
        $builder->select('us.target_role as target_role');
    }

    //$builder->join('auth_identities', 'auth_identities.user_id = users.id', 'INNER');
    $builder->join('auth_identities auth', 'auth.user_id = users.id AND  auth.type = "email_password"', 'LEFT');
    $builder->join('user_roles', 'user_roles.id = users.role', 'INNER');
    $builder->join('languages', 'languages.id = users.lang', 'INNER');

    $builder->join('domains', 'domains.id = users.user_domain', 'INNER');
    $builder->join('user_nationalities un', 'un.user_id = users.id', 'LEFT');
    $builder->join('countries c', 'c.id = un.country_id', 'LEFT');

    // for positions
    $builder->join('player_positions pp', 'pp.user_id = users.id', 'LEFT');

    // get current club details (registered and verified clubs)
    $builder->join('club_players cp', 'cp.player_id = users.id AND cp.status = "active"', 'LEFT');
    $builder->join('teams t', 't.id = cp.team_id', 'LEFT');
    $builder->join('clubs cb2', 'cb2.id = t.club_id', 'LEFT');
    $builder->join('user_meta um2', 'um2.user_id = cb2.taken_by AND um2.meta_key = "club_name"', 'LEFT');
    $builder->join('countries c3', 'c3.id = t.country_id', 'LEFT');
    $builder->join('user_meta um3', 'um3.user_id = t.club_id AND um3.meta_key = "profile_image"', 'LEFT');


    // additoinal current club of player/talent (default clubs)
    $builder->join('user_meta um5', 'um5.user_id = users.id AND um5.meta_key = "pre_club_id"', 'LEFT');
    $builder->join('clubs cb', 'cb.id = um5.meta_value', 'LEFT');
    $builder->join('countries c2', 'c2.id = cb.country_id', 'LEFT');
    $builder->join('auth_permissions_users apu', 'apu.user_id = users.id', 'LEFT');

    // birth_country
    $builder->join('user_meta um6', 'um6.user_id = users.id AND um6.meta_key = "birth_country"', 'LEFT');
    $builder->join('countries c4', 'c4.id = um6.meta_value', 'LEFT');

    // This join not returning latest info
    // $builder->join('(SELECT MAX(id) as max_id, user_id, status, package_id, plan_period_start, plan_period_end 
    //                  FROM user_subscriptions 
    //                  GROUP BY user_id
    //                 ) us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');




    /* if (auth()->id()) {
        $targetRole = auth()->user()->role;
        $builder->join('(SELECT uss.id, uss.user_id, uss.status, uss.package_id, uss.plan_period_start, uss.plan_period_end, ad.target_role
                    FROM user_subscriptions uss
                    INNER JOIN (
                        SELECT user_id, MAX(id) as max_id
                        FROM user_subscriptions
                        GROUP BY user_id
                    ) latest ON uss.id = latest.max_id

                    LEFT JOIN audiences ad
                    ON ad.subscription_id = uss.id AND ad.target_role = ' . $targetRole . ') us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');
    } else {
        // this join returning latest subscription info
        $builder->join('(SELECT uss.id, uss.user_id, uss.status, uss.package_id, uss.plan_period_start, uss.plan_period_end
                        FROM user_subscriptions uss
                        INNER JOIN (
                            SELECT user_id, MAX(id) as max_id
                            FROM user_subscriptions
                            GROUP BY user_id
                        ) latest ON uss.id = latest.max_id) us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');
    } */

    if (auth()->id() && !in_array(auth()->id(), ADMIN_ROLES)) {
        $targetRole = auth()->user()->role;

        $builder->join('(SELECT uss.id, uss.user_id, uss.status, uss.package_id, uss.plan_period_start, uss.plan_period_end, p.title, ba.target_role
                        FROM user_subscriptions uss
                        LEFT JOIN package_details pd ON pd.id = uss.package_id
                        LEFT JOIN packages p ON p.id = pd.package_id
                               

                        LEFT JOIN booster_audiences ba
                        ON ba.subscription_id = uss.stripe_subscription_id AND ba.target_role = ' . $targetRole . '

                        WHERE uss.package_id IN(' . $booster_package_id . ')
                        AND uss.status = "active"
                        

                    ) us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');

        // LEFT JOIN users u ON u.id = uss.user_id
        // AND (p.domain_id = '.$whereClause["user_domain"].' OR u.user_domain = '.$whereClause["user_domain"].')
    } else {
        // this join returning latest subscription info
        $builder->join('(SELECT uss.id, uss.user_id, uss.status, uss.package_id, uss.plan_period_start, uss.plan_period_end, p.title
                        FROM user_subscriptions uss
                        LEFT JOIN package_details pd ON pd.id = uss.package_id
                        LEFT JOIN packages p ON p.id = pd.package_id
                        WHERE uss.package_id IN(' . $booster_package_id . ')
                        AND uss.status = "active"
                        ) us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');
    }

    // $builder->join('packages', 'packages.id = us.package_id', 'LEFT');

    $builder->where('users.deleted_at', NULL);
    $builder->whereNotIn("users.role", [1, 5]);
    $builder->whereIn("users.status", [2]);

    if (auth()->id()) {
        $builder->whereNotIn("users.id", [auth()->id()]);
    }

    // if (auth()->id() &&  !in_array(auth()->id(), ADMIN_ROLES)) {
    //     $builder->whereIn("users.status", [2]);
    // } else {
    //     $builder->whereIn("users.status", [2]);
    // }

    // echo $key; die('dd');
    // echo '<pre>'; print_r($whereClause); die;
    if (isset($whereClause) && count($whereClause) > 0) {
        foreach ($whereClause as $key => $value) {
            if ($key == "user_domain") {
                continue;
            }

            if ($key == 'email') {
                $builder->like("auth_identities.secret", $value);
            } elseif ($key == 'location') {
                $builder->where("domains.id", $value);
                // $builder->where("users.user_domain", $value);
                // continue;
            } elseif ($key == 'position') {
                $builder->whereIn("pp.position_id", $value);
            } elseif ($key == 'age') {
                $builder->whereIn('(
                    SELECT DATE_FORMAT(FROM_DAYS(DATEDIFF(now(),
                    (SELECT meta_value FROM user_meta umm WHERE umm.user_id = users.id AND umm.meta_key = "date_of_birth")
                    )), "%Y")+0 
                )', $value);
            } elseif ($key == 'league_id') {
                $league_id = $value;
                continue;
            } elseif ($key == 'club_id') {
                $club_id = $value;
                continue;
            } elseif ($key == 'team_id') {
                $team_id = $value;
                continue;
            } else {
                $builder->where("users.$key", $value);
            }
        }
    }

    // Handle meta query with multiple key-value pairs
    if (isset($metaQuery) && count($metaQuery) > 0) {
        // pr($metaQuery); //exit;
        foreach ($metaQuery as $meta) {
            $metaBuilder = $db->table('user_meta');
            $metaBuilder->select('user_id')
                ->where('meta_key', $meta['meta_key']);

            $metaValue = is_array($meta['meta_value']) ? $meta['meta_value'] : (is_numeric($meta['meta_value']) ? (int)$meta['meta_value'] : $meta['meta_value']);

            switch ($meta['operator']) {
                case "=":
                    $metaBuilder->where('meta_value', $metaValue);
                    break;
                case ">=":
                    $metaBuilder->where('meta_value >=', $metaValue);
                    break;
                case "<=":
                    $metaBuilder->where('meta_value <=', $metaValue);
                    break;
                case "IN":
                    $metaBuilder->whereIn('meta_value', $metaValue);
                    break;
                default:
                    $metaBuilder->like('meta_value', $metaValue);
                    break;
            }
            $metaSubquery = $metaBuilder->getCompiledSelect();
            $builder->where("users.id IN ($metaSubquery)");
        }
    }

    if (isset($search) && !empty($search)) {
        $builder->groupStart();
        $builder->orLike('users.username', $search);
        $builder->orLike('users.first_name', $search);
        $builder->orLike('users.last_name', $search);
        $builder->orLike('auth.secret', $search);
        $builder->groupEnd();
    }

    // Add custom condition for user_domain
    // show user on other domains id have active multi-country package
    if (isset($whereClause['user_domain'])) {

        $user_domain = $whereClause['user_domain'];

        $builder->groupStart();
        $builder->where('users.user_domain', $user_domain);
        $builder->orGroupStart()
            ->whereIn('users.id', function ($subQuery) use ($user_domain) {
                return $subQuery->select('DISTINCT(user_id)')
                    ->from('user_subscriptions')
                    ->whereIn('package_id', function ($subSubQuery) use ($user_domain) {
                        // return $subSubQuery->select('id')
                        //     ->from('packages')
                        //     ->where('domain_id', $user_domain);

                        // $countryPackages = implode(",", COUNTRY_PACKAGES);
                        return $subSubQuery->select('pd.id')
                            ->from('package_details pd')
                            ->join('packages p', 'p.id = pd.package_id', 'RIGHT')
                            ->where('p.domain_id', $user_domain);
                        // ->whereIn('pd.id', $countryPackages);

                        // SELECT pd.id, p.domain_id FROM `package_details` pd RIGHT JOIN packages p ON p.id = pd.package_id WHERE p.domain_id = 7;

                    })
                    ->where('status', "active")
                    ->where('CURRENT_DATE() <= plan_period_end');
            })
            ->groupEnd();
        $builder->groupEnd();
    }


    // team, club, league filter
    /* if (isset($whereClause['league_id']) || isset($whereClause['club_id']) || isset($whereClause['team_id'])) { 

        // talent
        if($whereClause['role'] == 4){

            $teamBuilder = $db->table('club_players cp')
                            ->select('DISTINCT(cp.player_id)')
                            ->join('teams t', 'cp.team_id = t.id', 'LEFT')
                            ->join('clubs c', 't.club_id = c.id', 'LEFT')
                            ->join('league_clubs lc', 'c.id = lc.club_id', 'LEFT')
                            ->join('leagues l', 'lc.league_id = l.id', 'LEFT');

            $teamBuilder->where('cp.status', 'active');

            // Apply `whereIn` only if values are provided
            if (!empty($whereClause['team_id'])) {
                $teamBuilder->whereIn('t.id', $whereClause['team_id']);
            }

            if (!empty($whereClause['club_id'])) {
                $teamBuilder->whereIn('c.id', $whereClause['club_id']);
            }

            if (!empty($whereClause['league_id'])) {
                $teamBuilder->whereIn('l.id', $whereClause['league_id']);
            }

            $subQuery = $teamBuilder->getCompiledSelect(); // Get subquery as a string

            $builder->groupStart();
            $builder->where("users.id IN ($subQuery)"); // Corrected
            $builder->groupEnd();
        }
    } */



    $builder->groupBy('users.id');

    // Count the total number of results
    //  $countBuilder  = $db->newQuery()->select('count(*) as total_count')->fromSubquery($builder, 'counter_table');
    //  $countQuery = $countBuilder->get();
    //  $totalCount = $countQuery->getRow()->total_count;

    // Count the total number of results
    $countBuilder = clone $builder;
    $countQuery = $countBuilder->get();
    $totalCount =  $countQuery->getNumRows();

    // Count the total number of results
    // $countBuilder = clone $builder;
    // $countBuilder->select('COUNT(*) as total_count');
    // $countQuery = $countBuilder->get();
    // $totalCount = $countQuery->getRow()->total_count;

    if (auth()->id()) {
        $targetRole = auth()->user()->role;

        $builder->orderBy("
            CASE 
                WHEN us.target_role = '" . $targetRole . "' THEN 1
                WHEN us.title = 'Booster' THEN 2
                ELSE 3
            END
        ");
    } else {
        $builder->orderBy("
            CASE 
                WHEN us.title = 'Booster' THEN 1
                WHEN us.title = 'Premium' THEN 2
                ELSE 3
            END
        ");
    }

    // Add sorting
    if (!empty($orderBy)) {
        $builder->orderBy($orderBy, $order);
    } else {
        $builder->orderBy('users.last_active', 'DESC');          // order by last activity
        // $builder->orderBy('users.id', 'DESC');
    }

    // Add pagination
    if ($noLimit != true) {
        $builder->limit($limit, $offset);
    }

    $query = $builder->get();
    // echo '>>>>>>>>>>>>>>>>>> getLastQuery >>> ' . $db->getLastQuery(); //exit;

    $result = $query->getResultArray();
    // pr($result);

    // Process the results to merge metadata into user objects
    $users = [];

    // $flagPath =  base_url() . 'uploads/logos/';
    // $imagePath = base_url() . 'uploads/';

    foreach ($result as $row) {
        $userId = $row['id'];
        if (!isset($users[$userId])) {
            $users[$userId] = [
                'id'                        => $row['id'],
                'username'                  => $row['username'],
                'email'                     => $row['email'],
                'created_at'                => $row['created_at'],
                'updated_at'                => $row['updated_at'],
                'first_name'                => $row['first_name'],
                'last_name'                 => $row['last_name'],
                'role_name'                 => $row['role_name'],
                'language'                  => $row['language'],
                'newsletter'                => $row['newsletter'],
                'user_domain'               => $row['domain_name'],
                'user_location'             => $row['user_location'],
                'last_active'               => $row['last_active'],
                'status'                    => $row['status'],
                'subscription_status'       => $row['subscription_status'],
                'plan_period_start'         => $row['plan_period_start'],
                'plan_period_end'           => $row['plan_period_end'],
                'package_name'              => $row['package_name'],
                'last_activity_time'        => $row['last_activity_time'],
                'user_nationalities'        => $row['user_nationalities'],

                'team_type'                 => $row['team_type'],
                'current_club_name'         => $row['current_club_name'],
                'current_club_country'      => $row['current_club_country'],
                'current_club_logo'         => $row['current_club_logo'],
                'pre_current_club_name'     => $row['pre_current_club_name'],
                'pre_current_club_logo'     => $row['pre_current_club_logo'],
                'pre_current_club_country'  => $row['pre_current_club_country'],
                'birth_country_name'        => $row['birth_country_name'],
                'birth_country_flag'        => $row['birth_country_flag'],

                'meta'                      => []
            ];
        }
    }

    // um3.meta_value as current_club_logo,
    // c3.country_flag as current_club_country,

    // cb.club_logo as pre_current_club_logo,
    //                     c2.country_flag as pre_current_club_country,

    $imagePath = base_url() . 'uploads/';
    $flagPath = base_url() . 'uploads/flags/';
    $logoPath = base_url() . 'uploads/logos/';

    // Get all meta data for each user
    $userIds = array_keys($users);
    if (!empty($userIds)) {
        $metaBuilder = $db->table('user_meta');
        $metaBuilder->whereIn('user_id', $userIds);
        $metaQuery = $metaBuilder->get();
        $metaResult = $metaQuery->getResultArray();

        foreach ($metaResult as $metaRow) {
            $userId = $metaRow['user_id'];
            $users[$userId]['meta'][$metaRow['meta_key']] = $metaRow['meta_value'];
            if ($metaRow['meta_key'] == 'profile_image') {
                $users[$userId]['meta']['profile_image_path'] = $imagePath . $metaRow['meta_value'];
            }
            if ($metaRow['meta_key'] == 'cover_image') {
                $users[$userId]['meta']['cover_image_path'] = $imagePath . $metaRow['meta_value'];
            }
        }
    }

    $userData = array_values($users);

    return [
        'totalCount'    => $totalCount,
        'imagePath'     => $imagePath,
        'flagPath'      => $flagPath,
        'logoPath'      => $logoPath,
        'users'         => $userData
    ];
}


function getPlayersOnFrontend($whereClause = [], $metaQuery = [], $search = '', $orderBy = '', $order = '', $limit = 10, $offset = 0, $noLimit = false, $currentLang = null)
{
    $db = \Config\Database::connect();
    $currentLangCode = getLanguageCode($currentLang);
    // $auth = service('auth'); // Manually load the auth service
    // $userId = $auth->id();

    // pr($whereClause);
 
    $flagPath =  base_url() . 'uploads/logos/';
    $imagePath = base_url() . 'uploads/';

    $booster_package_id = '3, 4';
    // BOOSTER_PACKAGES

    // Start building the main query
    $builder = $db->table('users');
    $builder->select('users.*, 
                        user_roles.role_name_' . $currentLangCode . ' as role_name,
                        languages.language_' . $currentLangCode . ' as language,
                        domains.domain_name as domain_name,
                        domains.location_' . $currentLangCode . ' as user_location,
                        auth.secret as email,
                        us.status as subscription_status,
                        us.plan_period_start as plan_period_start,
                        us.plan_period_end as plan_period_end,
                        us.title as package_name,
                        
                        apu.permission as permission,

                        CASE
                            WHEN TIMESTAMPDIFF(SECOND, `users`.`last_active`, NOW()) < 60 THEN 
                                CONCAT(TIMESTAMPDIFF(SECOND, `users`.`last_active`, NOW()), " secs ago")
                            WHEN TIMESTAMPDIFF(MINUTE, `users`.`last_active`, NOW()) < 60 THEN 
                                CONCAT(TIMESTAMPDIFF(MINUTE, `users`.`last_active`, NOW()), " mins ago")
                            WHEN TIMESTAMPDIFF(HOUR, `users`.`last_active`, NOW()) < 24 THEN 
                                CONCAT(TIMESTAMPDIFF(HOUR, `users`.`last_active`, NOW()), " hours ago")
                            WHEN TIMESTAMPDIFF(DAY, `users`.`last_active`, NOW()) < 30 THEN 
                                CONCAT(TIMESTAMPDIFF(DAY, `users`.`last_active`, NOW()), " days ago")
                            WHEN TIMESTAMPDIFF(MONTH, `users`.`last_active`, NOW()) < 12 THEN 
                                CONCAT(TIMESTAMPDIFF(MONTH, `users`.`last_active`, NOW()), " months ago")
                            ELSE 
                                CONCAT(TIMESTAMPDIFF(YEAR, `users`.`last_active`, NOW()), " years ago")
                        END AS last_activity_time,

                        pp.position_id as position_id,

                        JSON_ARRAYAGG(
                            DISTINCT JSON_OBJECT(
                                "country_name", c.country_name, 
                                "flag_path", CONCAT("' . $flagPath . '", c.country_flag)
                            )
                        ) AS user_nationalities,

                        c4.country_name as birth_country_name,
                        c4.country_flag as birth_country_flag
                        
                    ');

    // Adding more select fields conditionally
    if (auth()->id()) {
        $builder->select('us.target_role as target_role');
    }

    if(isset($whereClause['role']) && $whereClause['role'] == 4){
        $builder->select('
                        cb2.club_name as current_club_name,
                        cb2.club_logo as current_club_logo,
                        c2.country_flag as current_club_country,

                        t.id as team_id,
                        t.team_type as team_type
                        

                    ');

                    // um2.meta_value as current_club_name,
                    //     um3.meta_value as current_club_logo,
                    //     c3.country_flag as current_club_country,
    }

    if(isset($whereClause['role']) && $whereClause['role'] == 2){
        $builder->select('
                        cb2.club_name as current_club_name,
                        cb2.club_logo as current_club_logo,
                        c2.country_flag as current_club_country
                    ');

                    // cb.club_name as pre_current_club_name,
                    // cb.club_logo as pre_current_club_logo,
                    // c2.country_flag as pre_current_club_country
    }

    //$builder->join('auth_identities', 'auth_identities.user_id = users.id', 'INNER');
    $builder->join('auth_identities auth', 'auth.user_id = users.id AND  auth.type = "email_password"', 'LEFT');
    $builder->join('user_roles', 'user_roles.id = users.role', 'INNER');
    $builder->join('languages', 'languages.id = users.lang', 'INNER');

    $builder->join('domains', 'domains.id = users.user_domain', 'INNER');
    $builder->join('user_nationalities un', 'un.user_id = users.id', 'LEFT');
    $builder->join('countries c', 'c.id = un.country_id', 'LEFT');

    // for positions
    $builder->join('player_positions pp', 'pp.user_id = users.id', 'LEFT');

    if(isset($whereClause['role']) && $whereClause['role'] == 4){
        // get current club details (registered and verified clubs)
        $builder->join('club_players cp', 'cp.player_id = users.id AND cp.status = "active"', 'LEFT');
        $builder->join('teams t', 't.id = cp.team_id', 'LEFT');
        $builder->join('clubs cb2', 'cb2.id = t.club_id', 'LEFT');
        $builder->join('league_clubs lc', 'cb2.id = lc.club_id', 'LEFT');
        $builder->join('leagues l', 'lc.league_id = l.id', 'LEFT');
        $builder->join('countries c2', 'c2.id = cb2.country_id', 'LEFT');

        // $builder->join('user_meta um2', 'um2.user_id = cb2.taken_by AND um2.meta_key = "club_name"', 'LEFT');
        // $builder->join('countries c3', 'c3.id = t.country_id', 'LEFT');
        // $builder->join('user_meta um3', 'um3.user_id = t.club_id AND um3.meta_key = "profile_image"', 'LEFT');

        // additoinal current club of player/talent (default clubs)
        // $builder->join('user_meta um5', 'um5.user_id = users.id AND um5.meta_key = "pre_club_id"', 'LEFT');
        // $builder->join('clubs cb', 'cb.id = um5.meta_value', 'LEFT');
        // $builder->join('countries c2', 'c2.id = cb.country_id', 'LEFT');
        
        
    }

    if(isset($whereClause['role']) && $whereClause['role'] == 2){
        // additoinal current club of player/talent (default clubs)
        // $builder->join('user_meta um5', 'um5.user_id = users.id AND um5.meta_key = "pre_club_id"', 'LEFT');
        // $builder->join('clubs cb', 'cb.id = um5.meta_value', 'LEFT');
        // $builder->join('countries c2', 'c2.id = cb.country_id', 'LEFT');

        $builder->join('clubs cb2', 'users.id = cb2.taken_by AND cb2.status = "active"', 'LEFT');
        $builder->join('league_clubs lc', 'cb2.id = lc.club_id', 'LEFT');
        $builder->join('leagues l', 'lc.league_id = l.id', 'LEFT');
        $builder->join('countries c2', 'c2.id = cb2.country_id', 'LEFT');
    }

    $builder->join('auth_permissions_users apu', 'apu.user_id = users.id', 'LEFT');

    // birth_country
    $builder->join('user_meta um6', 'um6.user_id = users.id AND um6.meta_key = "birth_country"', 'LEFT');
    $builder->join('countries c4', 'c4.id = um6.meta_value', 'LEFT');


    if (auth()->id() && !in_array(auth()->id(), ADMIN_ROLES)) {
        $targetRole = auth()->user()->role;

        $builder->join('(SELECT uss.id, uss.user_id, uss.status, uss.package_id, uss.plan_period_start, uss.plan_period_end, p.title, ba.target_role
                        FROM user_subscriptions uss
                        LEFT JOIN package_details pd ON pd.id = uss.package_id
                        LEFT JOIN packages p ON p.id = pd.package_id
                               

                        LEFT JOIN booster_audiences ba
                        ON ba.subscription_id = uss.stripe_subscription_id AND ba.target_role = ' . $targetRole . '

                        WHERE uss.package_id IN(' . $booster_package_id . ')
                        AND uss.status = "active"
                        

                    ) us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');

        // LEFT JOIN users u ON u.id = uss.user_id
        // AND (p.domain_id = '.$whereClause["user_domain"].' OR u.user_domain = '.$whereClause["user_domain"].')
    } else {
        // this join returning latest subscription info
        $builder->join('(SELECT uss.id, uss.user_id, uss.status, uss.package_id, uss.plan_period_start, uss.plan_period_end, p.title
                        FROM user_subscriptions uss
                        LEFT JOIN package_details pd ON pd.id = uss.package_id
                        LEFT JOIN packages p ON p.id = pd.package_id
                        WHERE uss.package_id IN(' . $booster_package_id . ')
                        AND uss.status = "active"
                        ) us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');
    }

    // $builder->join('packages', 'packages.id = us.package_id', 'LEFT');

    $builder->where('users.deleted_at', NULL);
    $builder->whereNotIn("users.role", [1, 5]);
    $builder->whereIn("users.status", [2]);

    if (auth()->id()) {
        $builder->whereNotIn("users.id", [auth()->id()]);
    }

    // if (auth()->id() &&  !in_array(auth()->id(), ADMIN_ROLES)) {
    //     $builder->whereIn("users.status", [2]);
    // } else {
    //     $builder->whereIn("users.status", [2]);
    // }

    // echo $key; die('dd');
    // echo '<pre>'; print_r($whereClause); die;
    if (isset($whereClause) && count($whereClause) > 0) {
        foreach ($whereClause as $key => $value) {
            if ($key == "user_domain") {
                continue;
            }

            if ($key == 'email') {
                $builder->like("auth.secret", $value);
            } elseif ($key == 'location') {
                $builder->where("domains.id", $value);
                // $builder->where("users.user_domain", $value);
                // continue;
            } elseif ($key == 'position') {
                $builder->whereIn("pp.position_id", $value);
            } elseif ($key == 'age') {
                $builder->whereIn('(
                    SELECT DATE_FORMAT(FROM_DAYS(DATEDIFF(now(),
                    (SELECT meta_value FROM user_meta umm WHERE umm.user_id = users.id AND umm.meta_key = "date_of_birth")
                    )), "%Y")+0 
                )', $value);
            } elseif ($key == 'league_id') {
                $league_id = $value;
                continue;
            } elseif ($key == 'club_id') {
                $club_id = $value;
                continue;
            } elseif ($key == 'team_id') {
                $team_id = $value;
                continue;
            } else {
                $builder->where("users.$key", $value);
            }
        }
    }

    // Handle meta query with multiple key-value pairs
    if (isset($metaQuery) && count($metaQuery) > 0) {
        // pr($metaQuery); //exit;
        foreach ($metaQuery as $meta) {
            $metaBuilder = $db->table('user_meta');
            $metaBuilder->select('user_id')
                ->where('meta_key', $meta['meta_key']);

            $metaValue = is_array($meta['meta_value']) ? $meta['meta_value'] : (is_numeric($meta['meta_value']) ? (int)$meta['meta_value'] : $meta['meta_value']);

            switch ($meta['operator']) {
                case "=":
                    $metaBuilder->where('meta_value', $metaValue);
                    break;
                case ">=":
                    $metaBuilder->where('meta_value >=', $metaValue);
                    break;
                case "<=":
                    $metaBuilder->where('meta_value <=', $metaValue);
                    break;
                case "IN":
                    $metaBuilder->whereIn('meta_value', $metaValue);
                    break;
                default:
                    $metaBuilder->like('meta_value', $metaValue);
                    break;
            }
            $metaSubquery = $metaBuilder->getCompiledSelect();
            $builder->where("users.id IN ($metaSubquery)");
        }
    }

    if (isset($search) && !empty($search)) {
        $builder->groupStart();
        $builder->orLike('users.username', $search);
        $builder->orLike('users.first_name', $search);
        $builder->orLike('users.last_name', $search);
        $builder->orLike('auth.secret', $search);
        $builder->groupEnd();
    }

    // Add custom condition for user_domain
    // show user on other domains id have active multi-country package
    if (isset($whereClause['user_domain'])) {

        $user_domain = $whereClause['user_domain'];

        $builder->groupStart();
        $builder->where('users.user_domain', $user_domain);
        $builder->orGroupStart()
            ->whereIn('users.id', function ($subQuery) use ($user_domain) {
                return $subQuery->select('DISTINCT(user_id)')
                    ->from('user_subscriptions')
                    ->whereIn('package_id', function ($subSubQuery) use ($user_domain) {
                        // return $subSubQuery->select('id')
                        //     ->from('packages')
                        //     ->where('domain_id', $user_domain);

                        // $countryPackages = implode(",", COUNTRY_PACKAGES);
                        return $subSubQuery->select('pd.id')
                            ->from('package_details pd')
                            ->join('packages p', 'p.id = pd.package_id', 'RIGHT')
                            ->where('p.domain_id', $user_domain);
                        // ->whereIn('pd.id', $countryPackages);

                        // SELECT pd.id, p.domain_id FROM `package_details` pd RIGHT JOIN packages p ON p.id = pd.package_id WHERE p.domain_id = 7;

                    })
                    ->where('status', "active")
                    ->where('CURRENT_DATE() <= plan_period_end');
            })
            ->groupEnd();
        $builder->groupEnd();
    }


    // team, club, league filter
    /* if (isset($whereClause['league_id']) || isset($whereClause['club_id']) || isset($whereClause['team_id'])) { 

        // talent
        if($whereClause['role'] == 4){

            $teamBuilder = $db->table('club_players cp')
                            ->select('DISTINCT(cp.player_id)')
                            ->join('teams t', 'cp.team_id = t.id', 'LEFT')
                            ->join('clubs c', 't.club_id = c.id', 'LEFT')
                            ->join('league_clubs lc', 'c.id = lc.club_id', 'LEFT')
                            ->join('leagues l', 'lc.league_id = l.id', 'LEFT');

            $teamBuilder->where('cp.status', 'active');

            // Apply `whereIn` only if values are provided
            if (!empty($whereClause['team_id'])) {
                $teamBuilder->whereIn('t.id', $whereClause['team_id']);
            }

            if (!empty($whereClause['club_id'])) {
                $teamBuilder->whereIn('c.id', $whereClause['club_id']);
            }

            if (!empty($whereClause['league_id'])) {
                $teamBuilder->whereIn('l.id', $whereClause['league_id']);
            }

            $subQuery = $teamBuilder->getCompiledSelect(); // Get subquery as a string

            $builder->groupStart();
            $builder->where("users.id IN ($subQuery)"); // Corrected
            $builder->groupEnd();
        }

        // club
        // if($whereClause['role'] == 2){
        //     $builder->join('user_meta um', 'users.id = um.user_id AND um.meta_key = "pre_club_id"', 'LEFT');
        //     $builder->join('clubs cc', 'users.id = cc.taken_by AND cc.status = "active"', 'LEFT');
        //     $builder->join('league_clubs lc', 'cc.id = lc.club_id', 'LEFT');
        //     $builder->join('leagues l', 'lc.league_id = l.id', 'LEFT');

        //     if (!empty($whereClause['club_id'])) {
        //         $builder->whereIn('c.id', $whereClause['club_id']);
        //     }

        //     if (!empty($whereClause['league_id'])) {
        //         $builder->whereIn('l.id', $whereClause['league_id']);
        //     }
        // }
    } */

    if (isset($whereClause['league_id']) || isset($whereClause['club_id']) || isset($whereClause['team_id'])) { 

        // talent
        if($whereClause['role'] == 4){

            // Apply `whereIn` only if values are provided
            if (!empty($whereClause['team_id'])) {
                $builder->whereIn('t.id', $whereClause['team_id']);
            }

            if (!empty($whereClause['club_id'])) {
                $builder->whereIn('c.id', $whereClause['club_id']);
            }

            if (!empty($whereClause['league_id'])) {
                $builder->whereIn('l.id', $whereClause['league_id']);
            } 
        }

        // club
        if($whereClause['role'] == 2){

            if (!empty($whereClause['club_id'])) {
                $builder->whereIn('c.id', $whereClause['club_id']);
            }

            if (!empty($whereClause['league_id'])) {
                $builder->whereIn('l.id', $whereClause['league_id']);
            }
        }
    }


    $builder->groupBy('users.id');

    // Count the total number of results
    //  $countBuilder  = $db->newQuery()->select('count(*) as total_count')->fromSubquery($builder, 'counter_table');
    //  $countQuery = $countBuilder->get();
    //  $totalCount = $countQuery->getRow()->total_count;

    // Count the total number of results
    $countBuilder = clone $builder;
    $countQuery = $countBuilder->get();
    $totalCount =  $countQuery->getNumRows();

    // Count the total number of results
    // $countBuilder = clone $builder;
    // $countBuilder->select('COUNT(*) as total_count');
    // $countQuery = $countBuilder->get();
    // $totalCount = $countQuery->getRow()->total_count;

    if (auth()->id()) {
        $targetRole = auth()->user()->role;

        $builder->orderBy("
            CASE 
                WHEN us.target_role = '" . $targetRole . "' THEN 1
                WHEN us.title = 'Booster' THEN 2
                ELSE 3
            END
        ");
    } else {
        $builder->orderBy("
            CASE 
                WHEN us.title = 'Booster' THEN 1
                WHEN us.title = 'Premium' THEN 2
                ELSE 3
            END
        ");
    }

    // Add sorting
    if (!empty($orderBy)) {
        $builder->orderBy($orderBy, $order);
    } else {
        $builder->orderBy('users.last_active', 'DESC');          // order by last activity
        // $builder->orderBy('users.id', 'DESC');
    }

    // Add pagination
    if ($noLimit != true) {
        $builder->limit($limit, $offset);
    }

    $query = $builder->get();
    $result = $query->getResultArray();
    // pr($result);

    // Process the results to merge metadata into user objects
    $users = [];

    // $flagPath =  base_url() . 'uploads/logos/';
    // $imagePath = base_url() . 'uploads/';

    foreach ($result as $row) {
        $userId = $row['id'];
        if (!isset($users[$userId])) {

            $users[$userId] = [
                'id'                        => $row['id'],
                'username'                  => $row['username'],
                'email'                     => $row['email'],
                'created_at'                => $row['created_at'],
                'updated_at'                => $row['updated_at'],
                'first_name'                => $row['first_name'],
                'last_name'                 => $row['last_name'],
                'role_name'                 => $row['role_name'],
                'language'                  => $row['language'],
                'newsletter'                => $row['newsletter'],
                'user_domain'               => $row['domain_name'],
                'user_location'             => $row['user_location'],
                'last_active'               => $row['last_active'],
                'status'                    => $row['status'],
                'subscription_status'       => $row['subscription_status'],
                'plan_period_start'         => $row['plan_period_start'],
                'plan_period_end'           => $row['plan_period_end'],
                'package_name'              => $row['package_name'],
                'last_activity_time'        => $row['last_activity_time'],
                'user_nationalities'        => $row['user_nationalities'],

                // 'team_type'                 => $row['team_type'] ?? '',
                // 'current_club_name'         => $row['current_club_name'] ?? '',
                // 'current_club_country'      => $row['current_club_country'] ?? '',
                // 'current_club_logo'         => $row['current_club_logo'] ?? '',
                // 'pre_current_club_name'     => $row['pre_current_club_name'] ?? '',
                // 'pre_current_club_logo'     => $row['pre_current_club_logo'] ?? '',
                // 'pre_current_club_country'  => $row['pre_current_club_country'] ?? '',
                'birth_country_name'        => $row['birth_country_name'],
                'birth_country_flag'        => $row['birth_country_flag'],

                // 'meta'                      => []
            ];

            if(!empty($row['current_club_name'])){
                $users[$userId]['current_club_name'] = $row['current_club_name'];
            }

            if(!empty($row['current_club_logo'])){
                $users[$userId]['current_club_logo'] = $row['current_club_logo'];
            }

            if(!empty($row['current_club_country'])){
                $users[$userId]['current_club_country'] = $row['current_club_country'];
            }

            if(!empty($row['team_type'])){
                $users[$userId]['team_type'] = $row['team_type'];
            }


            $users[$userId]['meta'] = [];


        }
    }

    // um3.meta_value as current_club_logo,
    // c3.country_flag as current_club_country,

    // cb.club_logo as pre_current_club_logo,
    //                     c2.country_flag as pre_current_club_country,

    $imagePath = base_url() . 'uploads/';
    $flagPath = base_url() . 'uploads/flags/';
    $logoPath = base_url() . 'uploads/logos/';

    // Get all meta data for each user
    $userIds = array_keys($users);
    if (!empty($userIds)) {
        $metaBuilder = $db->table('user_meta');
        $metaBuilder->whereIn('user_id', $userIds);
        $metaQuery = $metaBuilder->get();
        $metaResult = $metaQuery->getResultArray();

        foreach ($metaResult as $metaRow) {
            $userId = $metaRow['user_id'];
            $users[$userId]['meta'][$metaRow['meta_key']] = $metaRow['meta_value'];
            if ($metaRow['meta_key'] == 'profile_image') {
                $users[$userId]['meta']['profile_image_path'] = $imagePath . $metaRow['meta_value'];
            }
            if ($metaRow['meta_key'] == 'cover_image') {
                $users[$userId]['meta']['cover_image_path'] = $imagePath . $metaRow['meta_value'];
            }
        }
    }

    $userData = array_values($users);

    return [
        'totalCount'    => $totalCount,
        'imagePath'     => $imagePath,
        'flagPath'      => $flagPath,
        'logoPath'      => $logoPath,
        'users'         => $userData
    ];
}




function getPlayersOnFrontendHomePage($whereClause = [], $metaQuery = [], $search = '', $orderBy = '', $order = '', $limit = 10, $offset = 0, $noLimit = false, $currentLang = null)
{
    $db = \Config\Database::connect();
    $currentLangCode = getLanguageCode($currentLang);
    // $auth = service('auth'); // Manually load the auth service
    // $userId = $auth->id();

    // pr($whereClause);
 
    $flagPath =  base_url() . 'uploads/logos/';
    $imagePath = base_url() . 'uploads/';

    $booster_package_id = '3, 4';
    // BOOSTER_PACKAGES

    // Start building the main query
    $builder = $db->table('users');
    $builder->select('users.*, 
                        user_roles.role_name_' . $currentLangCode . ' as role_name,
                        languages.language_' . $currentLangCode . ' as language,
                        domains.domain_name as domain_name,
                        domains.location_' . $currentLangCode . ' as user_location,
                        auth.secret as email,
                        us.status as subscription_status,
                        us.plan_period_start as plan_period_start,
                        us.plan_period_end as plan_period_end,
                        us.title as package_name,

                        cb.club_name as pre_current_club_name,
                        cb.club_logo as pre_current_club_logo,
                        c2.country_flag as pre_current_club_country,
                        apu.permission as permission,

                        t.id as team_id,
                        t.team_type as team_type,
                        um2.meta_value as current_club_name,
                        um3.meta_value as current_club_logo,
                        c3.country_flag as current_club_country,
                        
                        CASE
                            WHEN TIMESTAMPDIFF(SECOND, `users`.`last_active`, NOW()) < 60 THEN 
                                CONCAT(TIMESTAMPDIFF(SECOND, `users`.`last_active`, NOW()), " secs ago")
                            WHEN TIMESTAMPDIFF(MINUTE, `users`.`last_active`, NOW()) < 60 THEN 
                                CONCAT(TIMESTAMPDIFF(MINUTE, `users`.`last_active`, NOW()), " mins ago")
                            WHEN TIMESTAMPDIFF(HOUR, `users`.`last_active`, NOW()) < 24 THEN 
                                CONCAT(TIMESTAMPDIFF(HOUR, `users`.`last_active`, NOW()), " hours ago")
                            WHEN TIMESTAMPDIFF(DAY, `users`.`last_active`, NOW()) < 30 THEN 
                                CONCAT(TIMESTAMPDIFF(DAY, `users`.`last_active`, NOW()), " days ago")
                            WHEN TIMESTAMPDIFF(MONTH, `users`.`last_active`, NOW()) < 12 THEN 
                                CONCAT(TIMESTAMPDIFF(MONTH, `users`.`last_active`, NOW()), " months ago")
                            ELSE 
                                CONCAT(TIMESTAMPDIFF(YEAR, `users`.`last_active`, NOW()), " years ago")
                        END AS last_activity_time,

                        pp.position_id as position_id,

                        JSON_ARRAYAGG(
                            DISTINCT JSON_OBJECT(
                                "country_name", c.country_name, 
                                "flag_path", CONCAT("' . $flagPath . '", c.country_flag)
                            )
                        ) AS user_nationalities,

                        c4.country_name as birth_country_name,
                        c4.country_flag as birth_country_flag
                        
                    ');

    // Adding more select fields conditionally
    if (auth()->id()) {
        $builder->select('us.target_role as target_role');
    }

    //$builder->join('auth_identities', 'auth_identities.user_id = users.id', 'INNER');
    $builder->join('auth_identities auth', 'auth.user_id = users.id AND  auth.type = "email_password"', 'LEFT');
    $builder->join('user_roles', 'user_roles.id = users.role', 'INNER');
    $builder->join('languages', 'languages.id = users.lang', 'INNER');

    $builder->join('domains', 'domains.id = users.user_domain', 'INNER');
    $builder->join('user_nationalities un', 'un.user_id = users.id', 'LEFT');
    $builder->join('countries c', 'c.id = un.country_id', 'LEFT');

    // for positions
    $builder->join('player_positions pp', 'pp.user_id = users.id', 'LEFT');

    // get current club details (registered and verified clubs)
    $builder->join('club_players cp', 'cp.player_id = users.id AND cp.status = "active"', 'LEFT');
    $builder->join('teams t', 't.id = cp.team_id', 'LEFT');
    $builder->join('clubs cb2', 'cb2.id = t.club_id', 'LEFT');
    $builder->join('user_meta um2', 'um2.user_id = cb2.taken_by AND um2.meta_key = "club_name"', 'LEFT');
    $builder->join('countries c3', 'c3.id = t.country_id', 'LEFT');
    $builder->join('user_meta um3', 'um3.user_id = t.club_id AND um3.meta_key = "profile_image"', 'LEFT');


    // additoinal current club of player/talent (default clubs)
    $builder->join('user_meta um5', 'um5.user_id = users.id AND um5.meta_key = "pre_club_id"', 'LEFT');
    $builder->join('clubs cb', 'cb.id = um5.meta_value', 'LEFT');
    $builder->join('countries c2', 'c2.id = cb.country_id', 'LEFT');
    $builder->join('auth_permissions_users apu', 'apu.user_id = users.id', 'LEFT');

    // birth_country
    $builder->join('user_meta um6', 'um6.user_id = users.id AND um6.meta_key = "birth_country"', 'LEFT');
    $builder->join('countries c4', 'c4.id = um6.meta_value', 'LEFT');

    // This join not returning latest info
    // $builder->join('(SELECT MAX(id) as max_id, user_id, status, package_id, plan_period_start, plan_period_end 
    //                  FROM user_subscriptions 
    //                  GROUP BY user_id
    //                 ) us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');




    /* if (auth()->id()) {
        $targetRole = auth()->user()->role;
        $builder->join('(SELECT uss.id, uss.user_id, uss.status, uss.package_id, uss.plan_period_start, uss.plan_period_end, ad.target_role
                    FROM user_subscriptions uss
                    INNER JOIN (
                        SELECT user_id, MAX(id) as max_id
                        FROM user_subscriptions
                        GROUP BY user_id
                    ) latest ON uss.id = latest.max_id

                    LEFT JOIN audiences ad
                    ON ad.subscription_id = uss.id AND ad.target_role = ' . $targetRole . ') us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');
    } else {
        // this join returning latest subscription info
        $builder->join('(SELECT uss.id, uss.user_id, uss.status, uss.package_id, uss.plan_period_start, uss.plan_period_end
                        FROM user_subscriptions uss
                        INNER JOIN (
                            SELECT user_id, MAX(id) as max_id
                            FROM user_subscriptions
                            GROUP BY user_id
                        ) latest ON uss.id = latest.max_id) us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');
    } */

    if (auth()->id() && !in_array(auth()->id(), ADMIN_ROLES)) {
        $targetRole = auth()->user()->role;

        $builder->join('(SELECT uss.id, uss.user_id, uss.status, uss.package_id, uss.plan_period_start, uss.plan_period_end, p.title, ba.target_role
                        FROM user_subscriptions uss
                        LEFT JOIN package_details pd ON pd.id = uss.package_id
                        LEFT JOIN packages p ON p.id = pd.package_id
                               

                        LEFT JOIN booster_audiences ba
                        ON ba.subscription_id = uss.stripe_subscription_id AND ba.target_role = ' . $targetRole . '

                        WHERE uss.package_id IN(' . $booster_package_id . ')
                        AND uss.status = "active"
                        

                    ) us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');

        // LEFT JOIN users u ON u.id = uss.user_id
        // AND (p.domain_id = '.$whereClause["user_domain"].' OR u.user_domain = '.$whereClause["user_domain"].')
    } else {
        // this join returning latest subscription info
        $builder->join('(SELECT uss.id, uss.user_id, uss.status, uss.package_id, uss.plan_period_start, uss.plan_period_end, p.title
                        FROM user_subscriptions uss
                        LEFT JOIN package_details pd ON pd.id = uss.package_id
                        LEFT JOIN packages p ON p.id = pd.package_id
                        WHERE uss.package_id IN(' . $booster_package_id . ')
                        AND uss.status = "active"
                        ) us', 'us.user_id = users.id AND us.plan_period_end >= CURDATE()', 'LEFT');
    }

    // $builder->join('packages', 'packages.id = us.package_id', 'LEFT');

    $builder->where('users.deleted_at', NULL);
    $builder->whereNotIn("users.role", [1, 5]);
    $builder->whereIn("users.status", [2]);

    if (auth()->id()) {
        $builder->whereNotIn("users.id", [auth()->id()]);
    }

    // if (auth()->id() &&  !in_array(auth()->id(), ADMIN_ROLES)) {
    //     $builder->whereIn("users.status", [2]);
    // } else {
    //     $builder->whereIn("users.status", [2]);
    // }

    // echo $key; die('dd');
    // echo '<pre>'; print_r($whereClause); die;
    if (isset($whereClause) && count($whereClause) > 0) {
        foreach ($whereClause as $key => $value) {
            if ($key == "user_domain") {
                continue;
            }

            if ($key == 'email') {
                $builder->like("auth_identities.secret", $value);
            } elseif ($key == 'location') {
                $builder->where("domains.id", $value);
                // $builder->where("users.user_domain", $value);
                // continue;
            } elseif ($key == 'position') {
                $builder->whereIn("pp.position_id", $value);
            } elseif ($key == 'age') {
                $builder->whereIn('(
                    SELECT DATE_FORMAT(FROM_DAYS(DATEDIFF(now(),
                    (SELECT meta_value FROM user_meta umm WHERE umm.user_id = users.id AND umm.meta_key = "date_of_birth")
                    )), "%Y")+0 
                )', $value);
            } elseif ($key == 'league_id') {
                $league_id = $value;
                continue;
            } elseif ($key == 'club_id') {
                $club_id = $value;
                continue;
            } elseif ($key == 'team_id') {
                $team_id = $value;
                continue;
            } else {
                $builder->where("users.$key", $value);
            }
        }
    }

    // Handle meta query with multiple key-value pairs
    if (isset($metaQuery) && count($metaQuery) > 0) {
        // pr($metaQuery); //exit;
        foreach ($metaQuery as $meta) {
            $metaBuilder = $db->table('user_meta');
            $metaBuilder->select('user_id')
                ->where('meta_key', $meta['meta_key']);

            $metaValue = is_array($meta['meta_value']) ? $meta['meta_value'] : (is_numeric($meta['meta_value']) ? (int)$meta['meta_value'] : $meta['meta_value']);

            switch ($meta['operator']) {
                case "=":
                    $metaBuilder->where('meta_value', $metaValue);
                    break;
                case ">=":
                    $metaBuilder->where('meta_value >=', $metaValue);
                    break;
                case "<=":
                    $metaBuilder->where('meta_value <=', $metaValue);
                    break;
                case "IN":
                    $metaBuilder->whereIn('meta_value', $metaValue);
                    break;
                default:
                    $metaBuilder->like('meta_value', $metaValue);
                    break;
            }
            $metaSubquery = $metaBuilder->getCompiledSelect();
            $builder->where("users.id IN ($metaSubquery)");
        }
    }

    if (isset($search) && !empty($search)) {
        $builder->groupStart();
        $builder->orLike('users.username', $search);
        $builder->orLike('users.first_name', $search);
        $builder->orLike('users.last_name', $search);
        $builder->orLike('auth.secret', $search);
        $builder->groupEnd();
    }

    // Add custom condition for user_domain
    // show user on other domains id have active multi-country package
    if (isset($whereClause['user_domain'])) {

        $user_domain = $whereClause['user_domain'];

        $builder->groupStart();
        $builder->where('users.user_domain', $user_domain);
        $builder->orGroupStart()
            ->whereIn('users.id', function ($subQuery) use ($user_domain) {
                return $subQuery->select('DISTINCT(user_id)')
                    ->from('user_subscriptions')
                    ->whereIn('package_id', function ($subSubQuery) use ($user_domain) {
                        // return $subSubQuery->select('id')
                        //     ->from('packages')
                        //     ->where('domain_id', $user_domain);

                        // $countryPackages = implode(",", COUNTRY_PACKAGES);
                        return $subSubQuery->select('pd.id')
                            ->from('package_details pd')
                            ->join('packages p', 'p.id = pd.package_id', 'RIGHT')
                            ->where('p.domain_id', $user_domain);
                        // ->whereIn('pd.id', $countryPackages);

                        // SELECT pd.id, p.domain_id FROM `package_details` pd RIGHT JOIN packages p ON p.id = pd.package_id WHERE p.domain_id = 7;

                    })
                    ->where('status', "active")
                    ->where('CURRENT_DATE() <= plan_period_end');
            })
            ->groupEnd();
        $builder->groupEnd();
    }


    // team, club, league filter
    /* if (isset($whereClause['league_id']) || isset($whereClause['club_id']) || isset($whereClause['team_id'])) { 

        // talent
        if($whereClause['role'] == 4){

            $teamBuilder = $db->table('club_players cp')
                            ->select('DISTINCT(cp.player_id)')
                            ->join('teams t', 'cp.team_id = t.id', 'LEFT')
                            ->join('clubs c', 't.club_id = c.id', 'LEFT')
                            ->join('league_clubs lc', 'c.id = lc.club_id', 'LEFT')
                            ->join('leagues l', 'lc.league_id = l.id', 'LEFT');

            $teamBuilder->whereIn('cp.status', 'active');

            // Apply `whereIn` only if values are provided
            if (!empty($whereClause['team_id'])) {
                $teamBuilder->whereIn('t.id', $whereClause['team_id']);
            }

            if (!empty($whereClause['club_id'])) {
                $teamBuilder->whereIn('c.id', $whereClause['club_id']);
            }

            if (!empty($whereClause['league_id'])) {
                $teamBuilder->whereIn('l.id', $whereClause['league_id']);
            }

            $subQuery = $teamBuilder->getCompiledSelect(); // Get subquery as a string

            $builder->groupStart();
            $builder->where("users.id IN ($subQuery)"); // Corrected
            $builder->groupEnd();
        }
    } */



    $builder->groupBy('users.id');

    // Count the total number of results
    //  $countBuilder  = $db->newQuery()->select('count(*) as total_count')->fromSubquery($builder, 'counter_table');
    //  $countQuery = $countBuilder->get();
    //  $totalCount = $countQuery->getRow()->total_count;

    // Count the total number of results
    $countBuilder = clone $builder;
    $countQuery = $countBuilder->get();
    $totalCount =  $countQuery->getNumRows();

    // Count the total number of results
    // $countBuilder = clone $builder;
    // $countBuilder->select('COUNT(*) as total_count');
    // $countQuery = $countBuilder->get();
    // $totalCount = $countQuery->getRow()->total_count;

    if (auth()->id()) {
        $targetRole = auth()->user()->role;

        $builder->orderBy("
            CASE 
                WHEN us.target_role = '" . $targetRole . "' THEN 1
                WHEN us.title = 'Booster' THEN 2
                ELSE 3
            END
        ");
    } else {
        $builder->orderBy("
            CASE 
                WHEN us.title = 'Booster' THEN 1
                WHEN us.title = 'Premium' THEN 2
                ELSE 3
            END
        ");
    }

    // Add sorting
    if (!empty($orderBy)) {
        $builder->orderBy($orderBy, $order);
    } else {
        $builder->orderBy('users.last_active', 'DESC');          // order by last activity
        // $builder->orderBy('users.id', 'DESC');
    }

    // Add pagination
    if ($noLimit != true) {
        $builder->limit($limit, $offset);
    }

    $query = $builder->get();
    // echo '>>>>>>>>>>>>>>>>>> getLastQuery >>> ' . $db->getLastQuery(); //exit;

    $result = $query->getResultArray();
    // pr($result);

    // Process the results to merge metadata into user objects
    $users = [];

    // $flagPath =  base_url() . 'uploads/logos/';
    // $imagePath = base_url() . 'uploads/';

    foreach ($result as $row) {
        $userId = $row['id'];
        if (!isset($users[$userId])) {
            $users[$userId] = [
                'id'                        => $row['id'],
                'username'                  => $row['username'],
                'email'                     => $row['email'],
                'created_at'                => $row['created_at'],
                'updated_at'                => $row['updated_at'],
                'first_name'                => $row['first_name'],
                'last_name'                 => $row['last_name'],
                'role_name'                 => $row['role_name'],
                'language'                  => $row['language'],
                'newsletter'                => $row['newsletter'],
                'user_domain'               => $row['domain_name'],
                'user_location'             => $row['user_location'],
                'last_active'               => $row['last_active'],
                'status'                    => $row['status'],
                'subscription_status'       => $row['subscription_status'],
                'plan_period_start'         => $row['plan_period_start'],
                'plan_period_end'           => $row['plan_period_end'],
                'package_name'              => $row['package_name'],
                'last_activity_time'        => $row['last_activity_time'],
                'user_nationalities'        => $row['user_nationalities'],

                'team_type'                 => $row['team_type'],
                'current_club_name'         => $row['current_club_name'],
                'current_club_country'      => $row['current_club_country'],
                'current_club_logo'         => $row['current_club_logo'],
                'pre_current_club_name'     => $row['pre_current_club_name'],
                'pre_current_club_logo'     => $row['pre_current_club_logo'],
                'pre_current_club_country'  => $row['pre_current_club_country'],
                'birth_country_name'        => $row['birth_country_name'],
                'birth_country_flag'        => $row['birth_country_flag'],

                'meta'                      => []
            ];
        }
    }

    // um3.meta_value as current_club_logo,
    // c3.country_flag as current_club_country,

    // cb.club_logo as pre_current_club_logo,
    //                     c2.country_flag as pre_current_club_country,

    $imagePath = base_url() . 'uploads/';
    $flagPath = base_url() . 'uploads/flags/';
    $logoPath = base_url() . 'uploads/logos/';

    // Get all meta data for each user
    $userIds = array_keys($users);
    if (!empty($userIds)) {
        $metaBuilder = $db->table('user_meta');
        $metaBuilder->whereIn('user_id', $userIds);
        $metaQuery = $metaBuilder->get();
        $metaResult = $metaQuery->getResultArray();

        foreach ($metaResult as $metaRow) {
            $userId = $metaRow['user_id'];
            $users[$userId]['meta'][$metaRow['meta_key']] = $metaRow['meta_value'];
            if ($metaRow['meta_key'] == 'profile_image') {
                $users[$userId]['meta']['profile_image_path'] = $imagePath . $metaRow['meta_value'];
            }
            if ($metaRow['meta_key'] == 'cover_image') {
                $users[$userId]['meta']['cover_image_path'] = $imagePath . $metaRow['meta_value'];
            }
        }
    }

    $userData = array_values($users);

    return [
        'totalCount'    => $totalCount,
        'imagePath'     => $imagePath,
        'flagPath'      => $flagPath,
        'logoPath'      => $logoPath,
        'users'         => $userData
    ];
}


function createActivityLog($data = [])
{
    $db = \Config\Database::connect();

    $activityModel = new ActivityModel();
    // pr($data);

    $activityModel->save($data);
    // echo '>>>>>>>>> createActivityLog  getLastQuery >>>>>>' .  $db->getLastQuery();
}


function compareStrings($value1, $value2)
{
    return strcmp($value1, $value2);
}

function getQueryString($url = null)
{

    $url =  isset($_SERVER['HTTPS']) &&
        $_SERVER['HTTPS'] === 'on' ? "https://" : "http://";
    $url .= $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    $uri = new \CodeIgniter\HTTP\URI($url);

    $queryString =  $uri->getQuery();
    parse_str($queryString, $params);
    return  $params;
}


function getFavorites($userId, $search = '', $limit = 0, $offset = 0, $whereClause = [], $currentLangCode = 'en', $countOnly = false)
{
    $db = \Config\Database::connect();
    $favoriteModel = new FavoriteModel();

    $builder = $db->table('favorites');

    $imagePath = base_url() . 'uploads/';
    $flagPath =  base_url() . 'uploads/logos/';

    $builder->select('favorites.*, 
                       u.first_name, 
                       u.last_name, 
                       u.role, 
                       u.status as user_status, 
                       u.created_at as user_created_at, 
                       ur.role_name_' . $currentLangCode . ' as role_name, 
                       d.location_' . $currentLangCode . ' as location, 
                       um2.meta_value as profile_image,
                       CONCAT("' . $imagePath . '", um2.meta_value) AS profile_image_path,

                       (SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(    
                               "country_name", c.country_name, 
                               "flag_path", CONCAT("' . $flagPath . '", c.country_flag)
                           )
                       )
                       FROM user_nationalities un 
                       LEFT JOIN countries c ON c.id = un.country_id 
                       WHERE un.user_id = favorites.user_id) AS user_nationalities,

                       t.team_type as team_type,
                       um3.meta_value as current_club_name,
                       CONCAT("' . $imagePath . '", um4.meta_value) as club_logo_path,

                       l.league_name as league_name,
                        l.league_logo as league_logo,
                        CONCAT("' . $flagPath . '", l.league_logo) as league_logo_path,
                        
                        c1.country_name as int_player_country,
                        CONCAT("' . $flagPath . '", c1.country_flag) as int_player_country_logo_path,

                        (SELECT JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    "position_id", pp.position_id ,
                                    "main_position", pp.is_main, 
                                    "position_name", p.position_' . $currentLangCode . '
                                )
                            )
                            FROM player_positions pp
                            LEFT JOIN positions p ON p.id = pp.position_id
                            WHERE pp.user_id = favorites.favorite_id
                        ) As positions,

                        (SELECT 
                            JSON_OBJECTAGG(
                                    umm.meta_key, umm.meta_value 
                            )
                            FROM user_meta umm 
                            WHERE umm.user_id = favorites.favorite_id
                        ) AS meta

                   ');
    $builder->join('users u', 'u.id = favorites.favorite_id', 'INNER');
    $builder->join('user_roles ur', 'ur.id = u.role', 'INNER');
    $builder->join('domains d', 'd.id = u.user_domain', 'INNER');
    $builder->join('user_meta um2', 'um2.user_id = favorites.favorite_id AND um2.meta_key = "profile_image"', 'LEFT');

    // to get club details
    $builder->join('club_players cp', 'cp.player_id = favorites.favorite_id AND cp.status = "active"', 'LEFT');
    $builder->join('teams t', 't.id = cp.team_id', 'LEFT');
    $builder->join('user_meta um3', 'um3.user_id = t.club_id AND um3.meta_key = "club_name"', 'LEFT');
    $builder->join('user_meta um4', 'um4.user_id = t.club_id AND um4.meta_key = "profile_image"', 'LEFT');

    // to get club's league
    $builder->join('league_clubs lc', 'lc.club_id = t.club_id', 'LEFT');
    $builder->join('leagues l', 'l.id = lc.league_id', 'LEFT');

    $builder->join('user_meta um5', 'um5.user_id = favorites.favorite_id AND um5.meta_key = "international_player"', 'LEFT');
    $builder->join('countries c1', 'c1.id = um5.meta_value', 'LEFT');
    $builder->where('favorites.user_id', $userId);
    $builder->where('u.status', 2);


    // Build the query with the same conditions
    if (isset($whereClause) && count($whereClause) > 0) {
        foreach ($whereClause as $key => $value) {
            if ($key == 'email') {
                $builder->like("auth.secret", $value);
            } elseif ($key == 'location') {
                $builder->like("d.id", $value);
            } else {
                $builder->where("u.$key", $value);
            }
        }
    }

    // Apply search filter if $search is not empty
    if (!empty($search)) {
        $builder->groupStart(); // Start a group for orLike
        $builder->orLike('u.first_name', $search);
        $builder->orLike('u.last_name', $search);
        $builder->orLike('ur.role_name', $search);
        $builder->orLike('d.location', $search);
        $builder->groupEnd(); // End the group
    }

    // Count the total number of results
    $countBuilder = clone $builder;
    $countBuilder->select('COUNT(*) as total_count');
    $countQuery = $countBuilder->get();
    $totalCount = $countQuery->getRow()->total_count;

    $builder->orderBy('favorites.id', 'DESC');
    $builder->limit($limit, $offset);

    $query = $builder->get();
    $results = $query->getResultArray();

    $data = [
        'totalCount' => $totalCount,
        'favorites' => $results
    ];

    // echo '>>>>>>>>>>>>>>> getLastQuery >>>>> ' . $db->getLastQuery();
    return $data;
}


function syncMailchimp($data)
{
    $apiKey = getenv('mailchimp.api.key');
    $listId = getenv('mailchimp.list.id');

    $memberId = md5(strtolower($data['email']));
    $dataCenter = substr($apiKey, strpos($apiKey, '-') + 1);
    $url = 'https://' . $dataCenter . '.api.mailchimp.com/3.0/lists/' . $listId . '/members/' . $memberId;

    $json = json_encode([
        'email_address' => $data['email'],
        'status'        => $data['status'], // "subscribed","unsubscribed","cleaned","pending"
        'merge_fields'  => [
            'FNAME'     => $data['firstname'],
            'LNAME'     => $data['lastname']
        ]
    ]);

    $ch = curl_init($url);

    curl_setopt($ch, CURLOPT_USERPWD, 'user:' . $apiKey);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $json);

    $result = curl_exec($ch);
    //pr($result);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return $httpCode;
}


function getMonthName($month_num)
{
    if ($month_num) {
        $month_name = date("M", mktime(0, 0, 0, $month_num, 10));
        return $month_name;
    }
}

function removeImageBG($data)
{

    $res = [];

    // API request to upload and process image
    $api_key = getenv('picwish.api.key');   // Replace with your actual API key
    $url = 'https://techhk.aoscdn.com/api/tasks/visual/segmentation';

    // Initialize cURL session for processing
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => $url,
        CURLOPT_HTTPHEADER => array(
            "X-API-KEY: $api_key",
            "Content-Type: multipart/form-data"
        ),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_POSTFIELDS => array(
            'sync'          => 0,
            'image_file'    => new CURLFILE($data->getTempName()),
            // 'crop'          => 1,
            // 'width'         => 248,
            // 'height'        => 252
        )
    ));

    // Execute cURL request for processing
    $response = curl_exec($curl);
    if ($response === false) {
        //echo "cURL Error: " . curl_error($curl);
        $res['status'] = "failed";
        $res['result'] = curl_error($curl);
        return $res;
    } else {
        $result = json_decode($response, true);
        if (!isset($result["status"]) || $result["status"] != 200) {
            // Request failed, log the details or handle error
            // var_dump($result); // Output the error response for debugging
            // die("Post request failed");
            $res['status'] = "failed";
            $res['result'] = $result;
            return $res;
        }

        $task_id = $result["data"]["task_id"];
        curl_close($curl);

        // Polling for task completion
        $max_polling_attempts = 30;
        $polling_interval = 1; // in seconds
        $task_url = "https://techhk.aoscdn.com/api/tasks/visual/segmentation/$task_id";
        $image_url = '';

        for ($i = 0; $i < $max_polling_attempts; $i++) {
            if ($i > 0) {
                sleep($polling_interval);
            }

            // Initiate new cURL session for polling
            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => $task_url,
                CURLOPT_HTTPHEADER => array(
                    "X-API-KEY: $api_key"
                ),
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_SSL_VERIFYPEER => false
            ));

            // Execute polling request
            $response = curl_exec($curl);
            if ($response === false) {
                //echo "cURL Error: " . curl_error($curl);
                $res['status'] = "failed";
                curl_close($curl);
                continue; // Retry polling on error
            }

            $result = json_decode($response, true);
            if (!isset($result["status"]) || $result["status"] != 200) {
                // Task exception, log the error
                //var_dump($result); // Output the error response for debugging

                $res['status'] = "failed";
                $res['result'] = $result;
                curl_close($curl);
                continue; // Retry polling on error
            }

            // Check task state
            if ($result["data"]["state"] == 1) {
                // Task completed successfully
                $image_url = $result["data"]["image"];

                $processedImageContent = file_get_contents($image_url);
                $fileName = 'profile_' . time() . '_' . rand(11111, 99999) . ".png";

                if ($processedImageContent !== false) {
                    file_put_contents(WRITEPATH . 'uploads/' . $fileName, $processedImageContent);

                    $res['status'] = "success";
                    $res['fileName'] = $fileName;
                    $res['result'] = "file saved successfully";
                } else {
                    //echo "Failed to save image.";
                    $res['status'] = "failed";
                    $res['result'] = "Failed to save file";
                }
                return $res;
                break;
            } elseif ($result["data"]["state"] < 0) {
                // Task failed, log the details
                //var_dump($result); // Output the error response for debugging
                $res['status'] = "failed";
                $res['result'] = $result;
                return $res;

                break;
            } else {
                // Task still processing, continue polling
                if ($i == $max_polling_attempts - 1) {
                    $error =  "Task processing took longer than expected. Please contact support.";
                    $res['status'] = "failed";
                    $res['result'] = $error;
                    return $res;
                }
            }
            // Close cURL session
            curl_close($curl);
        }
    }
}


function getInvoicePdfContent($subscriptionID = null, $langID = 1)
{
    $db = \Config\Database::connect();

    $langInfo = getLanguageByID($langID);

    if ($langInfo) {
        $lang   = $langInfo->slug;
        $locale = $langInfo->locale;
    }
    $language = \Config\Services::language();
    $language->setLocale($locale);  // Set language dynamically

    // echo ' >>>>>>>>>>>>>>> getLocale >>>>> ' . $language->getLocale($locale). ' >>>>> ' . lang('InvoicePDF.total') ; exit;

    $imagePath = base_url() . 'public/assets/images/';

    $userModel              = new UserModel();
    $userSubscriptionModel  = new UserSubscriptionModel();
    $packageModel           = new PackageModel();
    $packageDetailModel     = new PackageDetailModel();
    $couponModel            = new CouponModel();

    $subscriptionData       =  $userSubscriptionModel
        ->select('user_subscriptions.*, 
                                            pm.type, 
                                            pm.brand, 
                                            pm.last4, 
                                            um.meta_value as user_address, 
                                            u.username,
                                            u.first_name,
                                            u.last_name,
                                            u.user_domain as user_domain,
                                            p.title_' . $lang . ' as package_name, 
                                            pd.interval_' . $lang . ' as interval, 
                                            pp.price, 
                                            pp.currency
                                        ')
        ->join('users u', 'u.id = user_subscriptions.user_id', 'INNER')
        ->join('domains d', 'd.id = u.user_domain', 'INNER')
        ->join('package_details pd', 'pd.id = user_subscriptions.package_id', 'INNER')
        ->join('package_prices pp', 'pp.currency = d.currency AND pp.package_detail_id = user_subscriptions.package_id', 'INNER')
        ->join('packages p', 'p.id = pd.package_id', 'INNER')
        ->join('payment_methods pm', 'pm.stripe_payment_method_id = user_subscriptions.payment_method_id', 'LEFT')
        ->join('user_meta um', 'um.user_id = user_subscriptions.user_id AND user_meta WHERE meta_key = "address"', 'LEFT')
        ->where('user_subscriptions.id', $subscriptionID)
        ->first();

    $getLastQuery = $db->getLastQuery(); //exit;
    // echo '>>>>>>>>>>>> getLastQuery >>> ' . $db->getLastQuery(); exit;

    if ($subscriptionData) {

        $invoice_status             = $subscriptionData['invoice_status'];

        $package_id                 = $subscriptionData['package_id'];
        $plan_amount                = $subscriptionData['plan_amount'];
        $plan_amount_currency       = strtoupper($subscriptionData['plan_amount_currency']);
        $amount_paid                = $subscriptionData['amount_paid'];
        $invoice_number             = $subscriptionData['invoice_number'];
        $user_id                    = $subscriptionData['user_id'];
        $stripe_plan_id             = $subscriptionData['stripe_plan_id'];
        $coupon_used                = $subscriptionData['coupon_used'];
        // $created_at                 = date('F d, Y', strtotime($subscriptionData['created_at']));
        $created_at                 = formatDateLocale($subscriptionData['created_at'], $locale);


        $type                       = $subscriptionData['type'];
        $brand                      = $subscriptionData['brand'];
        $last4                      = $subscriptionData['last4'];
        $user_address               = $subscriptionData['user_address'];
        $username                   = $subscriptionData['username'];
        $first_name                 = $subscriptionData['first_name'];
        $last_name                  = $subscriptionData['last_name'];

        $package_name               = $subscriptionData['package_name'];
        $interval                   = ucfirst($subscriptionData['interval']);
        $price                      = $subscriptionData['price'];
        $currency                   = strtoupper($subscriptionData['currency']);
        $user_domain                = $subscriptionData['user_domain'];



        // $vat = round($amount_paid * 0.081, 2);               // vat = 8.1
        // $total = $amount_paid - $vat;

        // calculate Coupon
        if ($coupon_used) {
            $coupon_data = $couponModel->where('coupon_code', $coupon_used)->first();
            $discount       = $coupon_data['discount'];
            $discount_type  = $coupon_data['discount_type'];

            if ($discount_type == 'percent_off') {
                $discount_given = ($plan_amount * $discount) / 100;
            } else {
                $discount_given =  $discount;
            }
        }

        $footerInfo = getEmailFooter($langID, $user_domain);

        $footerEmail = $footerPhone = $footerWebsite = '';
        if ($footerInfo) {
            $footerEmail    = $footerInfo['email'];
            $footerPhone    = $footerInfo['phone'];
            $footerWebsite  = $footerInfo['website'];
        }

        // generate PDF content
        $content = '';

        $headerHtml = '
            <div width="100%" border="0" cellspacing="0" cellpadding="0">
                <div style="width:650px; min-width:650px; padding:0; margin:0 auto; font-weight:normal;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="header">
                        <tr>
                            <td class="pd_left_0">
                                <strong>Succer You Sports AG</strong><br />Ida-Sträuli-Strasse 95<br />CH-8404 Winterthur<br />Switzerland
                            </td>
                            <td align="right" class="pd_right_0">
                                <img src="' . $imagePath . 'invoice-logo.png" class="logo_img" style="width: 160px;vertical-align: top;">
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        ';

        $footerHtml = '
            <table width="100%" border="0" cellspacing="0" cellpadding="0" class="footer_table">
                <tr>
                    <td colspan="2" style="text-align: left;padding-bottom: 0;"><strong>Succer You Sports AG &#124;</strong> Ida-Stäuli-Strasse 95 &#124; CH-8404 Winterthur &#124; Switzerland </td>
                </tr>
                <tr>
                    <td style="text-align: left;"><strong>' . lang('InvoicePDF.email') . ': </strong> <a href="mailto:' . BILLING_EMAIL . '" class="clr_black">' . BILLING_EMAIL . '</a>   &#124; <strong>' . lang('InvoicePDF.website') . ': </strong> <a href="https://' . $footerWebsite . '/" class="clr_black">www.' . $footerWebsite . '</a></td>
                </tr>
            </table>
        ';

        $content .= '
                <!DOCTYPE html>
                <html lang="en">
                <head>
                <title>Invoice- Soccer You</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta name="robots" content="noindex,nofollow,noarchive" />
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
                <style type="text/css">
                body { padding:0 !important; margin:0 !important; display:block !important; min-width:100% !important; width:100% !important; -webkit-text-size-adjust:none }
                * {box-sizing: border-box;}
                body {font-family: "roboto";font-size: 14px; line-height: 1.35;}
                table {border-collapse: collapse;border:0;font-family: "roboto";}
                table td, table th {vertical-align: top;padding: 10px;line-height: 1.35;}
                img.logo_img {
                    width: 160px;
                    vertical-align: top;
                }
                table.invoice_table, table.price_table {
                    margin-top: 40px;
                }
                .border_bottom, table.price_table th, table.price_table td {
                    border-bottom: 1px solid #000;
                }
                table th:first-child, table td:first-child {
                    padding-left: 0;
                }
                table th:last-child, table td:last-child {
                    padding-right: 0;
                }
                table.footer_table td {
                    font-size: 12px;
                }
                table.footer_table td a {
                    color: #000 !important;
                    text-decoration: none;
                }
                table .pd_left_0 { padding-left: 0; }
                table .pd_right_0 { padding-right: 0; }
                .clr_black {
                    color : #000;
                }
                </style>
                </head>
                <body class="body" style="padding:0 !important; margin:0 !important; display:block !important; min-width:100% !important; width:100% !important;-webkit-text-size-adjust:none">
                    <div width="100%" border="0" cellspacing="0" cellpadding="0">
                        <div style="width:650px; min-width:650px; padding:0; margin:0 auto; font-weight:normal;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" class="invoice_table">
                                <tr>
                                    <td colspan="2" class="pd_left_0">' . $first_name . ' ' . $last_name . '<br />' . $user_address . '</td>
                                </tr>
                            </table>
                            
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" class="invoice_table">
                                <tr>
                                    <th align="left" class="border_bottom pd_left_0">' . lang('InvoicePDF.title') . ' - ' . $invoice_number . '</th>
                                </tr>
                                <tr>
                                    <th align="left" class="border_bottom pd_left_0">' . lang('InvoicePDF.subscription') . ': ' . $package_name . '</th>
                                </tr>
                                <tr>
                                    <td style="padding: 0;" class="border_bottom">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" class="invoice_inner">
                                            <tr>
                                                <td class="pd_left_0" width="100px">' . lang('InvoicePDF.date') . ':</td>
                                                <td>' . $created_at . '</td>
                                                <td width="120px">' . lang('InvoicePDF.yourContact') . ': </td>
                                                <td>Soccer You Sports AG</td>
                                            </tr>
                                            <tr>

                                                ' . ($user_domain == 1 ?
            '<td style="padding-top: 0;" class="pd_left_0">' . lang('InvoicePDF.vatNumber') . '</td>
                                                    <td style="padding-top: 0;">' . lang('InvoicePDF.vatNumberCHE') . '</td>'
            :
            "<td></td>
                                                    <td></td>"
        ) . '
                                                <td style="padding-top: 0;">' . lang('InvoicePDF.username') . ': </td>
                                                <td style="padding-top: 0;">' . $username . '</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" class="price_table">
                                <tr>
                                    <td colspan="4" style="padding-bottom: 30px;border-bottom: 0;" class="pd_left_0">' . lang('InvoicePDF.dear') . ' ' . $first_name . '<br />' . lang('InvoicePDF.message') . '</td>
                                </tr>
                                <tr>
                                    <th align="left" class="pd_left_0">' . lang('InvoicePDF.pos') . '</th>
                                    <th align="left">' . lang('InvoicePDF.description') . '</th>
                                    <th>' . lang('InvoicePDF.unitPrice') . '</th>
                                    <th align="right" class="pd_right_0">' . lang('InvoicePDF.priceIn') . ' ' . $currency . '</th>
                                </tr>
                                <tr>
                                    <td class="pd_left_0">1</td>
                                    <td>' . $package_name . ' ' . $interval . '</td>
                                    <td align="center">' . $price . ' ' . $currency . '</td>
                                    <td align="right" class="pd_right_0">' . $price . ' ' . $currency . '</td>
                                </tr>';

        if ($user_domain == 1) {
            $vat = round($plan_amount * 0.081, 2);               // vat = 8.1
            $total = $plan_amount - $vat;
            $content .= '<tr>
                                                    <td>&nbsp;</td>
                                                    <td colspan="2"><strong>' . lang('InvoicePDF.total') . '</strong><br />' . lang('InvoicePDF.includingTax') . '</td>
                                                    <td align="right" class="pd_right_0"><strong>' . $total . ' ' . $currency . '</strong><br />+' . $vat . ' ' . $currency . '</td>
                                                </tr>';
        } else {
            $content .= '<tr>
                                                    <td>&nbsp;</td>
                                                    <td colspan="2"><strong>' . lang('InvoicePDF.total') . ' </strong></td>
                                                    <td align="right" class="pd_right_0"><strong>' . $amount_paid . ' ' . $currency . '</strong></td>
                                                </tr>';
        }

        $content .= ($coupon_used != null ?
            '<tr>
                                        <td>&nbsp;</td>
                                        <td colspan="2">Coupon Applied: ' . $coupon_used . '</td>
                                        <td align="right" class="pd_right_0">-' . $discount_given . ' ' . $currency . '</td>
                                    </tr>'
            : ''
        )
            . '

                                                                    ' .
            ($subscriptionData['proration_amount'] != NULL ?
                '<tr>
                                        <td>&nbsp;</td>
                                        <td colspan="2">' . $subscriptionData['proration_description'] . '</td>
                                        <td align="right" class="pd_right_0">' . $subscriptionData['proration_amount'] . ' ' . $currency . '</td>
                                    </tr>'
                : ''
            )
            . ' 

                                                    ' .
            ($user_domain == 1 ?
                '<tr>
                                        <td>&nbsp;</td>
                                        <td><strong>' . lang('InvoicePDF.amountIncluding') . '</strong></td>
                                        <td colspan="1">' . lang('InvoicePDF.paidThrough') . ': 
                                            ' .
                (!empty($brand) ? '<img src="' . $imagePath . '' . $brand . '.png" style="width: 20px; margin-right: 5px;">' : '')
                . '
                                            <span style="float: right;">' . $type . ' •••• ' . $last4 . '<br /><small>' . date('d/m/Y H:i A', strtotime($subscriptionData['created_at'])) . '</small></span>
                                        </td>
                                        <td align="right" class="pd_right_0"><strong>' . $amount_paid . ' ' . $currency . '</strong></td>
                                    </tr>' : ''
            ) . '
                                <tr>
                                    <td colspan="4" style="padding-top: 60px;padding-bottom: 80px;border-bottom: 0;" class="pd_left_0">' . lang('InvoicePDF.regards') . '<br /><strong>Succer You Sports AG</strong></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </body>
            </html>
        ';

        // return $content;
        return $pdfData = ['headerHtml' => $headerHtml, 'content' => $content, 'footerHtml' => $footerHtml];
    } else {
        log_message('debug', " ERROR getInvoicePdfContent: subscription not found { $subscriptionID } LastQuery >>  {$getLastQuery}");
    }
}

// function generatePDF($content=[]){

//     $mpdf = new \Mpdf\Mpdf();
//     $html = 'This is Sample PDF';
//     $mpdf->WriteHTML($html);
//     //$this->response->setHeader('Content-Type', 'application/pdf');
//     $mpdf->Output( WRITEPATH . 'uploads/documents/soccer-pdf.pdf','F'); // opens in browser

// }


function getUserRoleByID($userID, $key = null)
{
    $db = \Config\Database::connect();

    $builder = $db->table('users')
        ->select('users.*, ur.role_name')
        ->join('user_roles ur', 'ur.id = users.role', 'INNER')
        ->where('users.id', $userID);

    $query = $builder->get();
    $row = $query->getRow();

    if ($key == "id") {
        return $row->role;
    } else {
        return $row->role_name;
    }
}

function getUserByID($userID)
{
    $db = \Config\Database::connect();

    $builder = $db->table('users')
        ->select('users.*, auth.secret as email')
        // ->join('(SELECT user_id, secret FROM auth_identities WHERE type = "email_password") auth', 'auth.user_id = users.id', 'LEFT')
        ->join('auth_identities auth', 'auth.user_id = users.id AND type = "email_password"', 'LEFT')
        ->where('users.id', $userID);

    $query  = $builder->get();
    $user   = $query->getRow();

    return $user;
}


function getUserMeta($userID = null, $metaKey = null)
{
    $db = \Config\Database::connect();

    $builder = $db->table('user_meta um')
        ->select('um.meta_key, um.meta_value')
        ->where('um.user_id', $userID);

    if ($metaKey != null) {
        $builder->where('um.meta_key', $metaKey);
    }

    $query  = $builder->get();
    
    if ($metaKey != null) {
        $userMeta   = $query->getRow();
        if($userMeta){
            return $userMeta->meta_value;
        }
    } else {
        $userMeta   = $query->getResultArray();
        if($userMeta){
            return $userMeta;
        }
    }
}



function getUserCurrency($user_id = null)
{
    // $domainModel = new DomainModel();
    $db = \Config\Database::connect();

    $builder = $db->table('users')
        ->select('users.id, d.currency')
        ->join('domains d', 'd.id = users.user_domain', 'INNER')
        ->where('users.id', $user_id);

    $query = $builder->get();
    $row = $query->getRow();
    $currency = 'CHF';
    if ($row) {
        $currency = $row->currency;
    }
    return $currency;
}

function getDomainCurrency($domain_id = null)
{
    $db = \Config\Database::connect();

    $builder = $db->table('domains')
        ->where('id', $domain_id);

    $query = $builder->get();
    $row = $query->getRow();
    $currency = 'CHF';
    if ($row) {
        $currency = $row->currency;
    }
    return $currency;
}

function getDomainInfo($domain_id = null)
{
    $db = \Config\Database::connect();

    $builder = $db->table('domains')
        ->where('id', $domain_id);

    $query = $builder->get();
    $row = $query->getRow();
    return $row;
}

function getDomainByDomain($domain_name = null)
{
    $db = \Config\Database::connect();

    $builder = $db->table('domains')
        ->where('domain_name', $domain_name);

    $query = $builder->get();
    $row = $query->getRow();
    return $row;
}

/* function getlanguageInfo($lang_id = null)
{
    $db = \Config\Database::connect();

    $builder = $db->table('languages')
        ->where('id', $lang_id);

    $query = $builder->get();
    $row = $query->getRow();
    return $row;
} */


function getRoleNameByID($roleID = null)
{
    $db = \Config\Database::connect();

    $builder = $db->table('user_roles')->where('id', $roleID);

    $query = $builder->get();
    $row = $query->getRow();

    if ($row) {
        return $row->role_name;
    }
}

function getLanguageByID($langID = null)
{
    $db = \Config\Database::connect();

    $builder = $db->table('languages')->where('id', $langID);

    $query = $builder->get();
    $row = $query->getRow();

    if ($row) {
        return $row;
    }
}

function getTeamNameByID($team_id = null)
{
    $db = \Config\Database::connect();
    // $lang_id = $lang_id ?? DEFAULT_LANGUAGE;
    $builder = $db->table('teams t')
        ->select('t.team_type, c.club_name')
        ->join('clubs c', 'c.id = t.club_id', 'LEFT')
        ->where('t.id', $team_id)->get();

    $teamInfo = $builder->getRow();
    if ($teamInfo) {
        return $teamInfo->club_name . ' ' . $teamInfo->team_type;
    }
}

function getClubDetailByUserID($user_id = null)
{
    $db = \Config\Database::connect();
    $builder = $db->table('club_players cp')
        ->select('cp.*, u.id as club_user_id,  u.first_name as club_firstname, u.last_name as club_lastname, u.lang as lang, u.user_domain as user_domain, auth.secret as club_email')
        ->join('teams t', 't.id = cp.team_id', 'LEFT')
        ->join('clubs c', 'c.id = t.club_id', 'LEFT')
        ->join('users u', 'u.id = c.taken_by', 'LEFT')
        ->join('auth_identities auth', 'auth.user_id = u.id AND auth.type = "email_password"', 'LEFT')
        ->where('cp.player_id', $user_id)
        ->where('cp.status', 'active')
        ->get();

    $clubInfo = $builder->getRow();
    if ($clubInfo) {
        return $clubInfo;
    }
}

function getScoutDetailByUserID($user_id = null)
{
    $db = \Config\Database::connect();
    $builder = $db->table('scout_players sp')
        ->select('sp.*, u.id as club_user_id,  u.first_name as scout_firstname, u.last_name as scout_lastname, u.lang as lang, u.user_domain as user_domain, auth.secret as scout_email')
        ->join('users u', 'u.id = sp.scout_id', 'LEFT')
        ->join('auth_identities auth', 'auth.user_id = u.id AND auth.type = "email_password"', 'LEFT')
        ->where('sp.player_id', $user_id)
        ->where('sp.status', 'active')
        ->where('sp.is_accepted', 'accepted')
        ->get();

    $scoutInfo = $builder->getRow();
    if ($scoutInfo) {
        return $scoutInfo;
    }
}

// pre-defined club owner detail
function getClubOwnerDetail($clubID = null)             // clubID = id column from clubs table
{
    $db = \Config\Database::connect();

    $builder = $db->table('clubs c')
        ->select('c.*, u.first_name, u.last_name, u.lang, u.user_domain, auth.secret as email')
        ->join('users u', 'u.id = c.taken_by', 'LEFT')
        ->join('auth_identities auth', 'auth.user_id = c.taken_by AND type = "email_password"', 'LEFT')
        ->where('c.taken_by', $clubID);

    $getLastQuery = $db->getLastQuery();

    log_message('debug', " >>>>>>>>>>>>>>> getClubOwnerDetail >>>>>>>>>>>>> $getLastQuery ");


    $query  = $builder->get();
    $clubInfo   = $query->getRow();
    return $clubInfo;
}






function getFavoritesProfile($userId, $search = '', $limit = 0, $offset = 0, $countOnly = false) {}

function cropImage($imageDetails = array())
{
    // if (isset($imageDetails['imagePath']) && !empty($imageDetails['imagePath'])) {
    //     $imagePath = $imageDetails['imagePath'];
    // } else {
    //     $imagePath = 'https://api.socceryou.ch/public/screenshots/2549.png';
    // }
    // // echo $imagePath; die;
    // if (isset($imageDetails['contentType']) && $imageDetails['contentType'] == 'image/jpeg') {
    //     $image = imagecreatefromjpeg($imagePath); // Use imagecreatefrompng() for PNG images
    // } else if (isset($imageDetails['contentType']) && $imageDetails['contentType'] == 'image/png') {
    //     $image = imagecreatefrompng($imagePath); // Use imagecreatefromjpeg() for JPEG images
    // }

    // if (!$image) {
    //     die("Failed to load image.");
    // }
    // // Define the crop dimensions (x, y, width, height)
    // if (isset($imageDetails['x']) && !empty($imageDetails['x'])) { // Starting x-coordinate
    //     $x = $imageDetails['x'];
    // } else {
    //     $x = 5;
    // }

    // if (isset($imageDetails['y']) && !empty($imageDetails['y'])) { // Starting y-coordinate
    //     $y = $imageDetails['y'];
    // } else {
    //     $y = 5;
    // }

    // if (isset($imageDetails['width']) && !empty($imageDetails['width'])) { // Width of the cropped area
    //     $width = $imageDetails['width'];
    // } else {
    //     $width = 550;
    // }

    // if (isset($imageDetails['height']) && !empty($imageDetails['height'])) { // Height of the cropped area
    //     $height = $imageDetails['height'];
    // } else {
    //     $height = 600;
    // }
    // // Get original image dimensions
    // $imageWidth = imagesx($image);
    // $imageHeight = imagesy($image);
    // // Adjust the crop dimensions if they exceed the original image size
    // if ($x + $width > $imageWidth) {
    //     $width = $imageWidth - $x; // Adjust width to fit
    // }
    // if ($y + $height > $imageHeight) {
    //     $height = $imageHeight - $y; // Adjust height to fit
    // }
    // $croppedImage = imagecreatetruecolor($width, $height);
    // imagecopy($croppedImage, $image, 0, 0, $x, $y, $width, $height);

    // if (isset($imageDetails['croppedImagePath']) && !empty($imageDetails['croppedImagePath'])) {
    //     $croppedImagePath = $imageDetails['croppedImagePath'];
    // } else {
    //     $croppedImagePath = 'public/screenshots/cropped_image_' . date('y_m_d_h_i_s') . '.png';
    // }
    // imagepng($croppedImage, $croppedImagePath); // Use imagejpeg() for JPEG format
    // imagedestroy($image);
    // imagedestroy($croppedImage);
    if (isset($imageDetails['imagePath']) && !empty($imageDetails['imagePath'])) {
        $imagePath = $imageDetails['imagePath'];
    } else {
        $imagePath = 'https://api.socceryou.ch/public/screenshots/2549.png';
    }

    if (isset($imageDetails['contentType']) && $imageDetails['contentType'] == 'image/jpeg') {
        $image = imagecreatefromjpeg($imagePath);
    } else if (isset($imageDetails['contentType']) && $imageDetails['contentType'] == 'image/png') {
        $image = imagecreatefrompng($imagePath);
    }

    if (!$image) {
        die("Failed to load image.");
    }

    // Define the crop dimensions (x, y, width, height)
    if (isset($imageDetails['x']) && !empty($imageDetails['x'])) {
        $x = $imageDetails['x'];
    } else {
        $x = 5;
    }

    if (isset($imageDetails['y']) && !empty($imageDetails['y'])) {
        $y = $imageDetails['y'];
    } else {
        $y = 5;
    }

    if (isset($imageDetails['width']) && !empty($imageDetails['width'])) {
        $width = $imageDetails['width'];
    } else {
        $width = 550;
    }

    if (isset($imageDetails['height']) && !empty($imageDetails['height'])) {
        $height = $imageDetails['height'];
    } else {
        $height = 600;
    }

    // Specify how much to crop from the top
    $cropFromTop = -5; // Change this value to crop more or less from the top

    // Adjust the starting y-coordinate
    $y += $cropFromTop;

    // Get original image dimensions
    $imageWidth = imagesx($image);
    $imageHeight = imagesy($image);

    // Adjust the crop dimensions if they exceed the original image size
    if ($x + $width > $imageWidth) {
        $width = $imageWidth - $x; // Adjust width to fit
    }
    if ($y + $height > $imageHeight) {
        $height = $imageHeight - $y; // Adjust height to fit
    }

    $croppedImage = imagecreatetruecolor($width, $height);
    imagecopy($croppedImage, $image, 0, 0, $x, $y, $width, $height);

    if (isset($imageDetails['croppedImagePath']) && !empty($imageDetails['croppedImagePath'])) {
        $croppedImagePath = $imageDetails['croppedImagePath'];
    } else {
        $croppedImagePath = 'public/screenshots/cropped_image_' . date('y_m_d_h_i_s') . '.png';
    }

    imagepng($croppedImage, $croppedImagePath); // Use imagejpeg() for JPEG format
    imagedestroy($image);
    imagedestroy($croppedImage);

    // echo '<img src="' . $croppedImagePath . '" alt="Croped">';
    // die;
    if (isset($imageDetails['remove_bg1']) && $imageDetails['remove_bg1'] == 'remove_background') {
        $image_file = $croppedImagePath;
        // echo $image_file; die;
        $api_key = 'wx3dt7c48ylgca49c'; // Replace with your actual API key
        $url = 'https://techhk.aoscdn.com/api/tasks/visual/segmentation';

        // Initialize cURL session for processing
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_HTTPHEADER => array(
                "X-API-KEY: $api_key",
                "Content-Type: multipart/form-data"
            ),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_POSTFIELDS => array(
                'sync' => 0,
                'image_file' => new CURLFile($image_file),
                'size' => '333*226' // Adjust size as needed
            )
        ));

        // Execute cURL request for processing
        $response = curl_exec($curl);
        if ($response === false) {
            // echo "cURL Error: " . curl_error($curl)
        } else {
            $result = json_decode($response, true);
            if (!isset($result["status"]) || $result["status"] != 200) {
                // Request failed, log the details or handle error
                var_dump($result); // Output the error response for debugging
                die("Post request failed");
            }

            $task_id = $result["data"]["task_id"];
            curl_close($curl);

            // Polling for task completion
            $max_polling_attempts = 30;
            $polling_interval = 1; // in seconds
            $task_url = "https://techhk.aoscdn.com/api/tasks/visual/segmentation/$task_id";
            $image_url = '';

            for ($i = 0; $i < $max_polling_attempts; $i++) {
                if ($i > 0) {
                    sleep($polling_interval);
                }

                // Initiate new cURL session for polling
                $curl = curl_init();
                curl_setopt_array($curl, array(
                    CURLOPT_URL => $task_url,
                    CURLOPT_HTTPHEADER => array(
                        "X-API-KEY: $api_key"
                    ),
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_SSL_VERIFYPEER => false
                ));

                // Execute polling request
                $response = curl_exec($curl);
                if ($response === false) {
                    echo "cURL Error: " . curl_error($curl);
                    curl_close($curl);
                    continue; // Retry polling on error
                }

                $result = json_decode($response, true);
                if (!isset($result["status"]) || $result["status"] != 200) {
                    // Task exception, log the error
                    var_dump($result); // Output the error response for debugging
                    curl_close($curl);
                    continue; // Retry polling on error
                }

                // Check task state
                if ($result["data"]["state"] == 1) {
                    // Task completed successfully
                    $image_url = $result["data"]["image"];

                    $processedImageContent = file_get_contents($image_url);
                    if ($processedImageContent !== false) {
                        // Save the processed image to the same path and name
                        $savePath = 'public/screenshots/crop_' . rand() . '.png'; // Path to save the image
                        file_put_contents($savePath, $processedImageContent);
                        return base_url() . $savePath;
                        // echo '<img src="' . base_url() . $savePath . '" alt="BG Remover">';
                        // die;
                    }
                } elseif ($result["data"]["state"] < 0) {
                    // Task failed, log the details
                    var_dump($result); // Output the error response for debugging
                    break;
                } else {
                    // Task still processing, continue polling
                    if ($i == $max_polling_attempts - 1) {
                        // echo "Task processing took longer than expected. Please contact support.";
                    }
                }
                // Close cURL session
                curl_close($curl);
            }
        }
    }
    if (isset($imageDetails['return']) && $imageDetails['return'] == 'crop_img_url') { // Height of the cropped area
        return base_url() . $croppedImagePath;
    } else {
        return false;
    }
}

function calculateAge($dob)
{
    // List of date formats to try
    $formats = ['Y-m-d', 'd-m-Y', 'm-d-Y', 'Y/m/d', 'd/m/Y', 'm/d/Y'];

    // Try creating DateTime object from each format
    foreach ($formats as $format) {
        $date = DateTime::createFromFormat($format, $dob);

        if ($date !== false) {
            // If a valid date is found, calculate the age
            $currentDate = new DateTime();
            $ageInterval = $currentDate->diff($date);
            return $ageInterval->y;  // return the age in years
        }
    }

    // If none of the formats worked, return an error message
    return "-"; // nothing to return
}

// In app/Helpers/auth_helper.php
if (!function_exists('hasAccess')) {
    function hasAccess($user, $permissions = null)
    {
        // $permissions = $user->getPermissions();
        // echo "User has the following permissions: ";
        // print_r($permissions); exit;

        // if ($user->inGroup('scout-representator')){
        //     echo '>>>>>>>>>> yes >>>>>>>>>>';
        // } else {
        //     echo '>>>>>>>>>> no >>>>>>>>>>';
        // }

        // Basic groups that don't require extra permissions
        $basicGroups = ['player', 'club', 'scout'];
        foreach ($basicGroups as $group) {
            if ($user->inGroup($group)) {
                return true;
            }
        }

        // Check superadmin group with specific permission
        if ($user->inGroup('superadmin') && $user->can('admin.access')) {
            return true;
        }

        // Representator groups and permissions
        $representatorGroups = ['superadmin-representator', 'scout-representator', 'club-representator'];
        $requiredPermissions = ['admin.access', 'admin.edit', 'transfer.ownership', 'editor'];

        foreach ($representatorGroups as $group) {
            if ($user->inGroup($group) && $user->can($permissions)) {
                // if ($user->inGroup($group) && $user->canAny($requiredPermissions)) {
                return true;
            }
        }
        return false;
    }
}


if (!function_exists('isValidCoupon')) {
    function isValidCoupon($coupon_code = null)
    {
        $db = \Config\Database::connect();
        $couponModel     = new CouponModel();
        $currentDate = date('Y-m-d');

        // $flag = true;

        $isCouponExist =  $couponModel->where('coupon_code', $coupon_code)
            ->where('is_deleted', NULL)
            ->where('status', 2)        // status 2 = published
            ->first();

        if (!$isCouponExist) {
            $res = [
                'message' => lang('App.couponNotExist'),
                'isValid' => false,
            ];
            // $flag = false;
            return $res;
        }

        if ($isCouponExist) {

            if (strcmp($isCouponExist['coupon_code'], $coupon_code) != 0) {
                $res = [
                    'message' => lang('App.invalidCouponApplied'),
                    'isValid' => false,
                ];
                // $flag = false;
                return $res;
            }

            // check if under provided valid dates
            if ($isCouponExist['valid_from'] && (strtotime($currentDate) < strtotime($isCouponExist['valid_from']))) {
                $res = [
                    'message' => lang('App.couponNotAvailable'),
                    'isValid' => false,
                ];
                // $flag = false;
                return $res;
            }

            if (($isCouponExist['no_validity'] != 1) && (strtotime($currentDate) > strtotime($isCouponExist['valid_to']))) {
                $res = [
                    'message' => lang('App.couponNoMoreValid'),
                    'isValid' => false,
                ];
                // $flag = false;
                return $res;
            }

            // check limit
            if (($isCouponExist['is_limit'] == 1)) {
                $limit = $isCouponExist['limit'];

                $userSubscriptionController = new UserSubscriptionController();
                $coupon_used =  $userSubscriptionController->getCouponAppliedCount($coupon_code);

                // $limit = 2;
                if ($coupon_used >= $limit) {
                    $res = [
                        'message' => lang('App.couponLimitExceeded'),
                        'isValid' => false,
                    ];
                    // $flag = false;
                    return $res;
                }
            }

            // limit coupon once per user            
            if (($isCouponExist['limit_per_user'] == 1)) {
                $userSubscriptionController = new UserSubscriptionController();
                $coupon_used =  $userSubscriptionController->getCouponAppliedCount($coupon_code, auth()->id());
                if ($coupon_used > 0) {
                    $res = [
                        'message' => lang('App.couponApplyOnce'),
                        'isValid' => false,
                    ];
                    // $flag = false;
                    return $res;
                }
            }
        }

        // echo '>>>>>>>>>>>>>>>>>>> flag >>>>> '. $flag;

        // if($flag == true){
        //     $res = [
        //         'message' => 'All errors are validated',
        //         'isValid' => true,
        //     ];
        //     return $res;
        // }
        $res = [
            'message' => lang('App.couponValid'),
            'isValid' => true,
        ];
        return $res;
    }
}

if (!function_exists('sendEmailWithAttachment')) {
    function sendEmailWithAttachment($data = [])
    {
        if ($data) {
            $email = \Config\Services::email();

            // Set From, To, CC, and BCC
            $email->setFrom($data['fromEmail'], $data['fromName']);
            $email->setTo($data['toEmail']);

            if (isset($data['ccEmail']) && !empty($data['ccEmail'])) {
                $email->setCC($data['ccEmail']);
            }

            if (isset($data['bccEmail']) && !empty($data['bccEmail'])) {
                $email->setBCC($data['bccEmail']);
            }

            // Set Subject and Message
            $email->setSubject($data['subject']);
            $email->setMessage($data['message']);

            // Attach CSV file if available
            if (isset($data['attachmentPath']) && !empty($data['attachmentPath'])) {
                // Make sure the file exists
                if (file_exists($data['attachmentPath'])) {
                    $email->attach($data['attachmentPath']);
                } else {
                    // Handle the case where the file does not exist
                    return false; // You can log this error or return a custom error message.
                }
            }

            // Send the email
            $res = $email->send();
            // Uncomment to debug if necessary
            // $error = $email->printDebugger();
            // return $error;
            return $res;
        }

        return false; // Return false if no data is passed
    }
}

if (!function_exists('pdfImageExists')) {
    function pdfImageExists($url)
    {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_NOBODY, true);  // We only need to check the headers, not the body
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);  // Follow redirects if any
        curl_setopt($ch, CURLOPT_TIMEOUT, 10); // Timeout in case the server is slow

        $response = curl_exec($ch);

        // Check if the response is valid and whether the status code is 200
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // Return true if status code is 200 (OK), false otherwise
        return $statusCode == 200;
    }
}

if (!function_exists('formatDate')) {
    function formatDate($date = null, $location = null)
    {

        $formatedDate = date('d.m.Y', strtotime($date));
        if (!is_null($location)) {
            if ($location == 5) {           // 5 = england
                $formatedDate = date('d.m.Y', strtotime($date));
            }
        }
        return $formatedDate;
    }
}

if (!function_exists('formatDateLocale')) {
    function formatDateLocale($date = null, $locale = null)
    {

        $formatter = new \IntlDateFormatter(
            $locale,
            \IntlDateFormatter::LONG,
            \IntlDateFormatter::NONE
        );

        $dateTime = new DateTime($date);
        return $formatter->format($dateTime);
    }
}

function getEmailDisclaimer($langID = null)
{

    $disclaimer = '';
    if ($langID == 1) {
        // english
        $disclaimer = 'This message is intended exclusively for the recipient(s) listed and may contain confidential or legally protected information. Third parties who are not addressees or whose address is listed in error are requested to inform us by reply e-mail and to delete the e-mail and any attachments without further use. The transmission of messages by e-mail can be insecure and error-prone. It can also be intercepted or monitored by third parties.';
    } else if ($langID == 3) {
        // Italian
        $disclaimer = 'Questo messaggio è destinato esclusivamente ai destinatari indicati e può contenere informazioni riservate o legalmente protette. I terzi che non sono destinatari o il cui indirizzo è indicato per errore sono pregati di informarci tramite e-mail di risposta e di cancellare l\'e-mail e gli eventuali allegati senza utilizzarli ulteriormente. La trasmissione di messaggi via e-mail può essere insicura e soggetta a errori. Inoltre, può essere intercettata o monitorata da terzi.';
    } else if ($langID == 4) {
        // French
        $disclaimer = 'Ce message est exclusivement destiné au(x) destinataire(s) indiqué(s) et peut contenir des informations confidentielles ou protégées par la loi. Les tiers qui ne sont pas destinataires ou dont l\'adresse est mentionnée par erreur sont priés de nous en informer par un courriel de réponse et de supprimer le courriel et ses éventuelles pièces jointes sans les utiliser. La transmission de messages par e-mail peut être peu sûre et comporter des erreurs. Elle peut en outre être interceptée ou surveillée par des tiers.';
    } else if ($langID == 5) {
        // Spanish
        $disclaimer = 'Este mensaje está destinado exclusivamente al destinatario o destinatarios indicados y puede contener información confidencial o protegida legalmente. Se ruega a los terceros que no sean los destinatarios o cuya dirección figure por error que nos lo comuniquen por correo electrónico de respuesta y que eliminen el correo electrónico y cualquier documento adjunto sin más uso. La transmisión de mensajes por correo electrónico puede ser insegura y propensa a errores. También puede ser interceptada o controlada por terceros.';
    } else if ($langID == 6) {
        // Portuguese
        $disclaimer = 'Esta mensagem destina-se exclusivamente ao(s) destinatário(s) indicado(s) e pode conter informações confidenciais ou legalmente protegidas. Solicita-se a terceiros que não sejam destinatários ou cujo endereço conste da lista por erro que nos informem por correio eletrónico de resposta e que apaguem a mensagem de correio eletrónico e os anexos sem qualquer utilização posterior. A transmissão de mensagens por correio eletrónico pode ser insegura e sujeita a erros. Pode também ser interceptada ou monitorizada por terceiros.';
    } else if ($langID == 7) {
        // Danish
        $disclaimer = 'Denne meddelelse er udelukkende beregnet til de(n) angivne modtager(e) og kan indeholde fortrolige eller juridisk beskyttede oplysninger. Tredjeparter, der ikke er adressater, eller hvis adresse er angivet ved en fejl, bedes informere os via svar-e-mail og slette e-mailen og eventuelle vedhæftede filer uden yderligere brug. Overførsel af meddelelser via e-mail kan være usikker og fejlbehæftet. Den kan også opsnappes eller overvåges af tredjeparter';
    } else if ($langID == 8) {
        // Swedish
        $disclaimer = 'Detta meddelande är endast avsett för den eller de mottagare som anges och kan innehålla konfidentiell eller juridiskt skyddad information. Tredje part som inte är adressat eller vars adress är felaktigt angiven ombeds att informera oss via svarsmail och att radera mailet och eventuella bilagor utan vidare användning. Överföring av meddelanden via e-post kan vara osäker och felbenägen. Den kan också fångas upp eller övervakas av tredje part.';
    } else {
        $disclaimer = 'Diese Nachricht ist ausschliesslich für den oder die angeführten Empfänger bestimmt und kann vertrauliche oder rechtlich geschützte Informationen beinhalten. Drittpersonen, welche nicht Adressaten sind oder deren Adresse versehentlich aufgeführt ist, werden gebeten, uns per Antwortmail zu informieren und das Mail samt allfälligen Anhängen ohne weitere Verwendung zu löschen. Die Nachrichtenübermittlung per E-Mail kann unsicher und fehlerbehaftet sein. Sie kann überdies von Dritten abgefangen oder überwacht werden.';
    }

    return $disclaimer;
}


function getEmailFooter__($langID = null)
{

    $footer = [];



    if ($langID == 1) {
        $footer['greeting'] = 'Successful greetings';
        $footer['greetingName'] = 'SoccerYou';
        $footer['company'] = 'Succer You Sports AG';
        $footer['address'] = 'Ida-Sträuli-Strasse 95 I CH-8404 Winterthur I Schweiz';
        $footer['emailText'] = 'E-Mail';
        $footer['email'] = 'info@socceryou.ch';
        $footer['websiteText'] = 'Website';
        $footer['website'] = 'www.socceryou.ch';
    } else if ($langID == 2) {
        $footer['greeting'] = 'Erfolgreiche Grüsse';
        $footer['greetingName'] = 'SoccerYou';
        $footer['company'] = 'Succer You Sports AG';
        $footer['address'] = 'Ida-Sträuli-Strasse 95 I CH-8404 Winterthur I Schweiz';
        $footer['emailText'] = 'E-Mail';
        $footer['email'] = 'info@socceryou.ch';
        $footer['websiteText'] = 'Website';
        $footer['website'] = 'www.socceryou.ch';
    } else if ($langID == 3) {
        $footer['greeting'] = 'Saluti di successo';
        $footer['greetingName'] = 'SoccerYou';
        $footer['company'] = 'Succer You Sports AG';
        $footer['address'] = 'Ida-Sträuli-Strasse 95 I CH-8404 Winterthur I Schweiz';
        $footer['emailText'] = 'E-Mail';
        $footer['email'] = 'info@socceryou.ch';
        $footer['websiteText'] = 'Website';
        $footer['website'] = 'www.socceryou.ch';
    } else if ($langID == 4) {
        $footer['greeting'] = 'Salutations fructueuses';
        $footer['greetingName'] = 'SoccerYou';
        $footer['company'] = 'Succer You Sports AG';
        $footer['address'] = 'Ida-Sträuli-Strasse 95 I CH-8404 Winterthur I Schweiz';
        $footer['emailText'] = 'E-Mail';
        $footer['email'] = 'info@socceryou.ch';
        $footer['websiteText'] = 'Website';
        $footer['website'] = 'www.socceryou.ch';
    } else if ($langID == 5) {
        $footer['greeting'] = 'Saludos cordiales';
        $footer['greetingName'] = 'SOCCERYOU';
        $footer['company'] = 'Succer You Sports AG';
        $footer['address'] = 'Ida-Sträuli-Strasse 95 I CH-8404 Winterthur I Schweiz';
        $footer['emailText'] = 'E-Mail';
        $footer['email'] = 'info@socceryou.ch';
        $footer['websiteText'] = 'Website';
        $footer['website'] = 'www.socceryou.ch';
    } else if ($langID == 6) {
        $footer['greeting'] = 'Bem-vindo ao SoccerYou!';
        $footer['greetingName'] = 'SOCCERYOU';
        $footer['company'] = 'Succer You Sports AG';
        $footer['address'] = 'Ida-Sträuli-Strasse 95 I CH-8404 Winterthur I Schweiz';
        $footer['emailText'] = 'E-Mail';
        $footer['email'] = 'info@socceryou.ch';
        $footer['websiteText'] = 'Website';
        $footer['website'] = 'www.socceryou.ch';
    } else if ($langID == 7) {
        $footer['greeting'] = 'Succesfulde hilsner';
        $footer['greetingName'] = 'SoccerYou';
        $footer['company'] = 'Succer You Sports AG';
        $footer['address'] = 'Ida-Sträuli-Strasse 95 I CH-8404 Winterthur I Schweiz';
        $footer['emailText'] = 'E-Mail';
        $footer['email'] = 'info@socceryou.ch';
        $footer['websiteText'] = 'Website';
        $footer['website'] = 'www.socceryou.ch';
    } else if ($langID == 8) {
        $footer['greeting'] = 'Framgångsrika hälsningar';
        $footer['greetingName'] = 'SoccerYou';
        $footer['company'] = 'Succer You Sports AG';
        $footer['address'] = 'Ida-Sträuli-Strasse 95 I CH-8404 Winterthur I Schweiz';
        $footer['emailText'] = 'E-Mail';
        $footer['email'] = 'info@socceryou.ch';
        $footer['websiteText'] = 'Website';
        $footer['website'] = 'www.socceryou.ch';
    } else {
        $footer['greeting'] = 'Erfolgreiche Grüsse';
        $footer['greetingName'] = 'SoccerYou';
        $footer['company'] = 'Succer You Sports AG';
        $footer['address'] = 'Ida-Sträuli-Strasse 95 I CH-8404 Winterthur I Schweiz';
        $footer['emailText'] = 'E-Mail';
        $footer['email'] = 'info@socceryou.ch';
        $footer['websiteText'] = 'Website';
        $footer['website'] = 'www.socceryou.ch';
    }

    return $footer;
}

function getEmailFooter($langID = null, $domainId = null)
{

    $language = \Config\Services::language();
    $language->setLocale(getLanguageCode($langID, true));  // Set language dynamically

    $footer = [];

    $footer['greeting']         = lang('Email.greeting');
    $footer['greetingName']     = lang('Email.greetingName');
    $footer['company']          = lang('Email.company');
    $footer['address']          = 'Ida-Sträuli-Strasse 95 I CH-8404 Winterthur I Schweiz';
    $footer['emailText']        = lang('Email.emailText');
    $footer['email']            = 'info@socceryou.ch';
    $footer['websiteText']      = lang('Email.websiteText');
    $footer['website']          = 'socceryou.ch';
    $footer['phone']            = '+41 52 224 77 89';

    if ($domainId) {
        $domainInfo = getDomainInfo($domainId);
        if ($domainInfo) {
            $footer['email']        = $domainInfo->domain_email;
            $footer['address']      = $domainInfo->domain_address;
            $footer['website']      = $domainInfo->domain_name;
            $footer['phone']        = $domainInfo->domain_phone;
        }
    }

    return $footer;
}

/* function getDomainInfo($domain_id = null)
{
    $db = \Config\Database::connect();

    $builder = $db->table('domains')
        ->where('id', $domain_id);

    $query = $builder->get();
    $row = $query->getRow();
    return $row;
} */


function getCountryCode($place_of_birth)
{
    $countryModel = new CountryModel();

    // Fetch country_name and country_code from countries table
    $countries = $countryModel->select('country_name, country_code, country_flag')->findAll();
    $country_codes = [];
    if (!empty($countries)) {
        foreach ($countries as $country_name => $country_code) {
            $country_codes[$country_code['country_name']] = $country_code['country_code'];
        }
    }
    $parts = explode(',', $place_of_birth);
    $country = trim(end($parts));  // Get the last part after the last comma

    if (array_key_exists($country, $country_codes)) {
        if (strlen($country_codes[$country]) === 3) {
            $country_codes[$country] = substr($country_codes[$country], 0, 2);  // Remove the last character
        }
        return $country_codes[$country];
    }

    return '';

    // $imagePath = base_url() . 'uploads/';
    // return $imagePath;
}


if (!function_exists('getPackageInfo')) {
    function getPackageInfo($packageId = null, $lang = null)
    {

        $db = \Config\Database::connect();
        if (!is_null($lang)) {

            $langCode = getLanguageCode($lang);
            $builder = $db->table('package_details pd')
                ->select('pd.id, pd.package_id, pd.interval, pd.stripe_plan_id, pd.status, pd.description_' . $langCode . ' as description, pd.interval_' . $langCode . ' as package_interval, p.title_' . $langCode . ' as package_name')
                ->join('packages p', 'p.id = pd.package_id', 'INNER')
                ->where('pd.id', $packageId);
        } else {
            $builder = $db->table('package_details pd')
                ->select('pd.*, p.title as package_name')
                ->join('packages p', 'p.id = pd.package_id', 'INNER')
                ->where('pd.id', $packageId);
        }

        $query = $builder->get();
        $row = $query->getRow();

        return $row;
    }
}

if (!function_exists('currentUserLang')) {
    function currentUserLang($userId)
    {
        $db = \Config\Database::connect();
        $builder2 = $db->table('users');
        $builder2->select('users.lang, languages.*')
            ->join('languages', 'users.lang = languages.id')
            ->where('users.id', $userId);
        $query = $builder2->get();
        $result = $query->getRow();
        return $result;
    }
}

if (!function_exists('replace_special_chars')) {
    function replace_special_chars($input_string)
    {
        $cleaned_string = iconv('UTF-8', 'ASCII//TRANSLIT', $input_string);

        $cleaned_string = preg_replace('/[^a-zA-Z0-9_]/', '', $cleaned_string);

        return $cleaned_string;
    }
}


if (!function_exists('getDBCurrentTime')) {
    function getDBCurrentTime()
    {
        $db = \Config\Database::connect();
        $currentTime = $db->query('SELECT CURRENT_TIMESTAMP() as "CURRENT_TIMESTAMP"')->getRow()->CURRENT_TIMESTAMP;
        return $currentTime;
    }
}

if (!function_exists('getEmailTemplate')) {
    function getEmailTemplate($emailType = null, $language = null, $email_for = null)
    {

        $db = \Config\Database::connect();
        $emailTemplateModel = new EmailTemplateModel();
        $getEmailTemplate = $emailTemplateModel->where('type', $emailType)
            ->where('language', $language)
            ->whereIn('email_for', $email_for)
            ->where('status', 'active')
            ->first();

        if ($getEmailTemplate) {
            return $getEmailTemplate;
        }
    }
}


if (!function_exists('getPageInUserLanguage')) {
    function getPageInUserLanguage($location = null, $language = null, $pageName = null)
    {

        $db = \Config\Database::connect();
        $builder = $db->table('domains')
            ->where('id', $location);
        $query = $builder->get();
        $result = $query->getRow();

        if ($result) {
            if ($pageName != null) {
                // $languageCode = getLanguageCode($language);
                // $pageLink = 'https://'.$result->domain_name .'/'. $pageName .'/'. $languageCode;
                $pageLink = 'https://' . $result->domain_name . '/' . $pageName;
                return $pageLink;
            } else {
                return 'https://' . $result->domain_name;
            }
        }
    }
}
function userCurrentLang($user_id)
{

    $db = \Config\Database::connect();
    $lang_id = $lang_id ?? DEFAULT_LANGUAGE;

    $builder = $db->table('users')
        ->join('languages', 'users.lang = languages.id')  // Join users table with languages table
        ->where('users.id', $user_id)  // Specify the user id to filter the user
        ->get();

    $language = $builder->getRow();

    if ($language) {
        return $language->slug;  // Return the language slug from the languages table
    } else {
        return 'en';  // Return default language if not found
    }
}


/* if (!function_exists('timeAgo')) {
    function timeAgo($timestamp = null, $lang_id = null)
    {
        // echo ' ..... $timestamp ... ' . $timestamp; //exit;
        $timeDifference = time() - strtotime($timestamp);
        // echo ' ..... $timeDifference ... ' . $timeDifference; //exit;

        $language = \Config\Services::language();
        $language->setLocale(getLanguageCode($lang_id));

        if ($timeDifference < 60) {
            return lang('Time.ago.seconds', [$timeDifference]);
        } elseif ($timeDifference < 3600) {
            return lang('Time.ago.minutes', [floor($timeDifference / 60)]);
        } elseif ($timeDifference < 86400) {
            return lang('Time.ago.hours', [floor($timeDifference / 3600)]);
        } elseif ($timeDifference < 2592000) {
            return lang('Time.ago.days', [floor($timeDifference / 86400)]);
        } elseif ($timeDifference < 31536000) {
            return lang('Time.ago.months', [floor($timeDifference / 2592000)]);
        } else {
            return lang('Time.ago.years', [floor($timeDifference / 31536000)]);
        }
    }
} */


function getActivityLogs($detailArr)
{
    if (isset($detailArr) && !empty($detailArr['activity_event'])) {
        $db = \Config\Database::connect();
        $activityEventModel = new ActivityEventModel();
        return $activityEventModel->getActivityEvents($detailArr['activity_event']);
    }
}

function replacePlaceholders($message, $replacements = [])
{
    foreach ($replacements as $placeholder => $value) {
        $message = str_replace('' . strtoupper($placeholder) . '', '' . $value . '', $message);
    }
    return $message;
}

function logActivity($activityEvent, $replacements = [], $additionalData = [])
{
    if (empty($activityEvent)) {
        return false;
    }

    $db = \Config\Database::connect();
    $activityEventModel = new \App\Models\ActivityEventModel();
    if (isset($additionalData['user_id']) && !empty($additionalData['user_id']) && $additionalData['user_id'] == 1 && $activityEvent == 'userUpdatedProfileDetailAdmin') {
        //  admin update his profile
        $activityEvent = 'userUpdatedProfileDetail';
    }
    $activityMsgArr = $activityEventModel->getActivityEvents($activityEvent);


    if (!$activityMsgArr) {
        return false;
    }
    // if(in_array(['membershipPurchased','membershipRenewed','membershipCancelled','membershipUpgraded','membershipDowngraded'],$activityEvent)){
    // userUpdatedProfileDetailAdmin
    // }
    $languages = ACTIVITY_LANG_SLUGS;
    $activity_data = [
        'user_id'          => auth()->id(),
        'activity_type_id' => $additionalData['activity_type_id'] ?? 0, // Dynamically assign ID
        'ip'               => service('request')->getIPAddress(),
    ];
    if (isset($additionalData['user_id']) && !empty($additionalData['user_id'])) {
        $activity_data['user_id'] = $additionalData['user_id'];
    }
    foreach ($languages as $lang) {
        if (!empty($activityMsgArr['user_message_' . $lang])) {
            $msg = $activityMsgArr['user_message_' . $lang];
            $activity_data['activity_' . $lang] = replacePlaceholders($msg, $replacements);
        }

        if (!empty($activityMsgArr['admin_message_' . $lang])) {
            $msg = $activityMsgArr['admin_message_' . $lang];
            $activity_data['admin_activity_' . $lang] = replacePlaceholders($msg, $replacements);
        }
    }
    // Message update on admin login
    if (auth()->id() == 1 && $activityEvent == 'userLoggedIn') {
        $activity_data['admin_activity_en'] = $activity_data['activity_en'];
        $activity_data['admin_activity_de'] = $activity_data['activity_de'];
    }
    $activity_data['activity'] = $activityEvent;
    $activity_data = array_merge($activity_data, $additionalData);
    // echo '<pre>'; print_r($activity_data); die;
    createActivityLog($activity_data);

    return true;
}


function bytesToMB($bytes)
{
    return round($bytes / (1024 * 1024)) . ' MB'; // 1 MB = 1024 * 1024 bytes
}

function getRepresentatorRoleBySlug($role_slug = null)
{
    $db = \Config\Database::connect();

    $builder = $db->table('representator_roles')
        ->where('role_slug', $role_slug)
        ->get();

    $roleInfo = $builder->getRow();

    if ($roleInfo) {
        return $roleInfo;  // Return the language slug from the languages table
    }
}
