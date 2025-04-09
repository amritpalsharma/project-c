<?php

namespace App\Controllers\Api;

use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use App\Models\BlogModel;

class BlogController extends ResourceController
{
    public function initController(\CodeIgniter\HTTP\RequestInterface $request, \CodeIgniter\HTTP\ResponseInterface $response, \Psr\Log\LoggerInterface $logger)
    {
        // Do Not Edit This Line
        parent::initController($request, $response, $logger);
        $this->db = \Config\Database::connect();
        $this->blogModel = new BlogModel();
    }

    // Add Blog
    public function addBlogOld($lang = null)
    {
        echo '<pre>';
        print_r($this->request->getVar());
        die;
        $currentLang = $lang ?? DEFAULT_LANGUAGE;
        $this->request->setLocale(getLanguageCode($currentLang, true));
        if (hasAccess(auth()->user(), ADMIN_ACCESS) || hasAccess(auth()->user(), TRANSFER_OWNERSHIP)) {

            $rules = [
                'title'     => 'required|max_length[500]',
                'language'  => 'required'
            ];

            $validationRule = [];
            $errors = [];
            if ($this->request->getFile('featured_image')) {
                $validationRule = [
                    'featured_image' => [
                        'label' => 'Upload Featured Image',
                        'rules' => [
                            'ext_in[featured_image,jpg,jpeg,png]',
                            'max_size[featured_image,2000]',
                        ],
                        'errors' => [
                            'ext_in'   => lang('App.ext_in', ['file' => 'jpg, jpeg, png']),
                            'max_size'  => lang('App.max_size', ['size' => '2000']),
                        ],
                    ],
                ];
            }

            if (! $this->validate($rules)) {
                $errors[] = $this->validator->getErrors();
            }
            if ($validationRule && !$this->validate($validationRule)) {
                $errors[] = $this->validator->getErrors();
            }

            if (count($errors) != 0) {
                $errors = $this->validator->getErrors();

                $response = [
                    "status"    => false,
                    "message"   => lang('App.provideValidData'),
                    "data"      => ['errors' => $errors]
                ];
            } else {
                $save_data = [
                    'user_id' => auth()->id(),
                    'title'  => $this->request->getVar("title"),
                    'meta_title'        => $this->request->getVar("meta_title"),
                    'meta_description'  => $this->request->getVar("meta_description"),
                    'content'       => $this->request->getVar("content"),
                    'language'      => $this->request->getVar("language"),
                    'status'        => $this->request->getVar("status"),
                    'slug'        => $this->request->getVar("slug"),
                ];
                if (isset($save_data['slug']) && !empty($save_data['slug'])) {
                    $existArr = $this->blogModel
                        ->select('blogs.*, l.language')
                        ->join('languages l', 'l.id = blogs.language')
                        ->where('blogs.slug', $save_data['slug'])
                        // ->where('blogs.id', $slug)
                        ->first();
                    if (isset($existArr) && !empty($existArr['slug'])) {
                        $slugExistError = lang('App.slugExist', ['slugName' => $existArr['slug']]);
                        $response = [
                            "status"    => false,
                            "message"   => lang('App.provideValidData'),
                            // "data"      => ['errors' => $slugExistError]
                            "errors"      => ['slug' => $slugExistError]
                        ];
                        return $this->respondCreated($response);
                    }
                }
                if ($featured_image = $this->request->getFile('featured_image')) {
                    if (! $featured_image->hasMoved()) {
                        $filepath = WRITEPATH . 'uploads/' . $featured_image->store('');
                        $ext = $featured_image->getClientExtension();
                        $save_data['featured_image'] = $featured_image->getName();
                    }
                }
                $uploadedFiles = $this->request->getFiles('attachments');
                if (!empty($uploadedFiles['attachments'])) {
                    $attachments = $uploadedFiles['attachments'];
                    $attchments_arr = [];
                    foreach ($attachments as $attachment) {
                        if (! $attachment->hasMoved()) {
                            $filepath = WRITEPATH . 'uploads/' . $attachment->store('');
                            $ext = $attachment->getClientExtension();
                            $attchment_name = $attachment->getName();
                            $attchments_arr[] = ['file_name' => $attchment_name, 'file_type' => $ext];
                        }
                    }
                    if (!empty($attchments_arr)) {
                        $save_data['attachments'] = serialize($attchments_arr);
                    }
                }
                // save data
                if ($this->blogModel->save($save_data)) {
                    $lastInsertedID = $this->blogModel->getInsertID();
                    // create Activity log
                    $activityEvent = 'addBlog';
                    $replacements = [
                        '{BLOG_ID}' => '{BLOG_ID_' . $lastInsertedID . '}',
                    ];
                    $additionalData = ['activity_type_id' => 1]; // created
                    logActivity($activityEvent, $replacements, $additionalData);

                    $response = [
                        "status"    => true,
                        "message"   => lang('App.blogAdded'),
                        "data"      => []
                    ];
                } else {
                    $response = [
                        "status"    => false,
                        "message"   => lang('App.blogAddFailed'),
                        "data"      => []
                    ];
                }
            }
        } else {
            $response = [
                "status"    => false,
                "message"   => lang('App.permissionDenied'),
                "data"      => []
            ];
        }
        return $this->respondCreated($response);
    }

    public function addBlog($lang = null)
    {
        $currentLang = $lang ?? DEFAULT_LANGUAGE;
        $this->request->setLocale(getLanguageCode($currentLang, true));
        if (hasAccess(auth()->user(), ADMIN_ACCESS) || hasAccess(auth()->user(), TRANSFER_OWNERSHIP)) {

            $blog_id = 1;
            $blog['created_by'] = 1;
            $blog['is_active'] = 1;
            // $blog['created_at'] = date('y-m-d h:i:s');;
            // $blog['updated_at'] = date('y-m-d h:i:s');
            $newBlog = $this->blogModel->createBlog($blog);
            if (isset($newBlog) && !empty($newBlog)) {
                $blog_id = $newBlog;
            }
            // createBlog
            $imagesArr = [];
            $uploadedImages = $this->request->getFiles();
            // echo '<pre>'; print_r($uploadedImages); die;
            if (isset($uploadedImages['image']) && !empty($uploadedImages['image'])) {
                // die('Here');
                foreach ($uploadedImages['image'] as $lang => $file) {
                    // echo '<pre>'; print_r($uploadedImages['image'][$lang]); die(' 1545');
                    if (isset($uploadedImages['image'][$lang]) && !empty($uploadedImages['image'][$lang])) {
                        $file = $uploadedImages['image'][$lang];
                        if ($file->isValid() && !$file->hasMoved()) {
                            $filepath = WRITEPATH . 'uploads/' . $file->store('');
                            $ext = $file->getClientExtension();
                            $newName = $file->getName();
                            $imagesArr[$lang] = $newName;
                        }
                    }
                }
            }
            // echo '<pre>'; print_r($imagesArr); die;
            $contentArr = $this->request->getVar('content');
            $titleArr = $this->request->getVar('title');
            $metaTitleArr = $this->request->getVar('meta_title');
            $metaDescriptionArr = $this->request->getVar('meta_description');
            if (isset($contentArr) && !empty($contentArr)) {
                foreach ($contentArr as $langKey => $content) {
                    $dataArr['blog_id'] = $blog_id;
                    $dataArr['slug'] = $this->request->getVar('slug');
                    $dataArr['language_code'] = $langKey;
                    $dataArr['content'] = $content;
                    if (isset($titleArr[$langKey])) {
                        $dataArr['title'] = $titleArr[$langKey];
                    }
                    if (isset($metaTitleArr[$langKey])) {
                        $dataArr['meta_title'] = $metaTitleArr[$langKey];
                    }
                    if (isset($metaDescriptionArr[$langKey])) {
                        $dataArr['meta_description'] = $metaDescriptionArr[$langKey];
                    }
                    // $dataArr['meta_title'] = $metaTitleArr[$langKey];
                    // $dataArr['meta_description'] = $metaDescriptionArr[$langKey];
                    if (isset($imagesArr[$langKey]) && !empty($imagesArr[$langKey])) {
                        $dataArr['featured_image'] = $imagesArr[$langKey];
                    }
                    // echo '<pre>'; print_r($dataArr); die;
                    $this->blogModel->saveTranslation($dataArr);
                }
                $response = [
                    "status"    => true,
                    "message"   => lang('App.blogAdded'),
                    "data"      => []
                ];
            } else {
                $response = [
                    "status"    => false,
                    "message"   => lang('App.blogAddFailed'),
                    "data"      => []
                ];
            }
            return $this->respondCreated($response);
        }
    }

    // Edit Blog
    public function editBlogOld($id = null, $lang = null)
    {
        $currentLang = $lang ?? DEFAULT_LANGUAGE;
        $this->request->setLocale(getLanguageCode($currentLang, true));

        if (hasAccess(auth()->user(), ADMIN_ACCESS) || hasAccess(auth()->user(), TRANSFER_OWNERSHIP) || hasAccess(auth()->user(), EDITOR_ACCESS)) {

            $rules = [
                'title'     => 'required|max_length[500]',
                'language'  => 'required'
            ];

            $validationRule = [];
            $errors = [];
            if ($this->request->getFile('featured_image')) {
                $validationRule = [
                    'featured_image' => [
                        'label' => 'Upload Featured Image',
                        'rules' => [
                            'ext_in[featured_image,jpg,jpeg,png]',
                            'max_size[featured_image,2000]',
                        ],
                        'errors' => [
                            'ext_in'   => lang('App.ext_in', ['file' => 'jpg, jpeg, png']),
                            'max_size'  => lang('App.max_size', ['size' => '2000']),
                        ],
                    ],
                ];
            }

            if (! $this->validate($rules)) {
                $errors[] = $this->validator->getErrors();
            }
            if ($validationRule && !$this->validate($validationRule)) {
                $errors[] = $this->validator->getErrors();
            }

            if (count($errors) != 0) {
                $errors = $this->validator->getErrors();

                $response = [
                    "status"    => false,
                    "message"   => lang('App.provideValidData'),
                    "data"      => ['errors' => $errors]
                ];
            } else {
                $save_data = [
                    'id'            => $id,
                    'title'         => $this->request->getVar("title"),
                    'content'       => $this->request->getVar("content"),
                    'language'      => $this->request->getVar("language"),
                    'status'        => $this->request->getVar("status"),
                    'slug'        => $this->request->getVar("slug"),
                ];

                if ($featured_image = $this->request->getFile('featured_image')) {
                    $isExist = $this->blogModel->where('id', $id)->first();
                    if ($isExist) {
                        if (!empty($isExist['featured_image']) && file_exists(WRITEPATH . 'uploads/' . $isExist['featured_image'])) {
                            unlink(WRITEPATH . 'uploads/' . $isExist['featured_image']);
                        }
                    }

                    if (! $featured_image->hasMoved()) {
                        $filepath = WRITEPATH . 'uploads/' . $featured_image->store('');
                        $save_data['featured_image'] = $featured_image->getName();
                    }
                }
                $uploadedFiles = $this->request->getFiles('attachments');
                if (!empty($uploadedFiles['attachments'])) {
                    $attachments = $uploadedFiles['attachments'];
                    $attchments_arr = [];
                    foreach ($attachments as $attachment) {
                        if (! $attachment->hasMoved()) {
                            $filepath = WRITEPATH . 'uploads/' . $attachment->store('');
                            $ext = $attachment->getClientExtension();
                            $attchment_name = $attachment->getName();
                            $attchments_arr[] = ['file_name' => $attchment_name, 'file_type' => $ext];
                        }
                    }
                    if (!empty($attchments_arr)) {
                        $save_data['attachments'] = serialize($attchments_arr);
                    }
                }
                // save data
                if ($this->blogModel->save($save_data)) {
                    // create Activity log    
                    $activityEvent = 'updateBlog';
                    $replacements = [
                        // 'BLOG_ID' => 'BLOG_ID_'.$id,
                        '{BLOG_ID}' => '{BLOG_ID_' . $id . '}',
                    ];
                    $additionalData = ['activity_type_id' => 2]; // updated
                    logActivity($activityEvent, $replacements, $additionalData);

                    $response = [
                        "status"    => true,
                        "message"   => lang('App.blogUpdated'),
                        "data"      => []
                    ];
                } else {
                    $response = [
                        "status"    => false,
                        "message"   => lang('App.blogUpdateFailed'),
                        "data"      => []
                    ];
                }
            }
        } else {
            $response = [
                "status"    => false,
                "message"   => lang('App.permissionDenied'),
                "data"      => []
            ];
        }
        return $this->respondCreated($response);
    }

    public function editBlog($id = null, $lang = null)
    {
        $currentLang = $lang ?? DEFAULT_LANGUAGE;
        $this->request->setLocale(getLanguageCode($currentLang, true));
        if (hasAccess(auth()->user(), ADMIN_ACCESS) || hasAccess(auth()->user(), TRANSFER_OWNERSHIP)) {

            $blog_id = $id;
            // createBlog
            $imagesArr = [];
            $uploadedImages = $this->request->getFiles();
            // echo '<pre>'; print_r($uploadedImages); die;
            if (isset($uploadedImages['image']) && !empty($uploadedImages['image'])) {
                // die('Here');
                foreach ($uploadedImages['image'] as $lang => $file) {
                    // echo '<pre>'; print_r($uploadedImages['image'][$lang]); die(' 1545');
                    if (isset($uploadedImages['image'][$lang]) && !empty($uploadedImages['image'][$lang])) {
                        $file = $uploadedImages['image'][$lang];
                        if ($file->isValid() && !$file->hasMoved()) {
                            $filepath = WRITEPATH . 'uploads/' . $file->store('');
                            $ext = $file->getClientExtension();
                            $newName = $file->getName();
                            $imagesArr[$lang] = $newName;
                        }
                    }
                }
            }
            // echo '<pre>'; print_r($imagesArr); die;
            $contentArr = $this->request->getVar('content');
            $titleArr = $this->request->getVar('title');
            $metaTitleArr = $this->request->getVar('meta_title');
            $metaDescriptionArr = $this->request->getVar('meta_description');
            if (isset($contentArr) && !empty($contentArr)) {
                foreach ($contentArr as $langKey => $content) {
                    $dataArr['blog_id'] = $blog_id;
                    $dataArr['language_code'] = $langKey;
                    $dataArr['content'] = $content;
                    if (isset($titleArr[$langKey])) {
                        $dataArr['title'] = $titleArr[$langKey];
                    }
                    if (isset($metaTitleArr[$langKey])) {
                        $dataArr['meta_title'] = $metaTitleArr[$langKey];
                    }
                    if (isset($metaDescriptionArr[$langKey])) {
                        $dataArr['meta_description'] = $metaDescriptionArr[$langKey];
                    }
                    // $dataArr['meta_title'] = $metaTitleArr[$langKey];
                    // $dataArr['meta_description'] = $metaDescriptionArr[$langKey];
                    if (isset($imagesArr[$langKey]) && !empty($imagesArr[$langKey])) {
                        $dataArr['featured_image'] = $imagesArr[$langKey];
                    }
                    // echo '<pre>'; print_r($dataArr); die;
                    $this->blogModel->saveTranslation($dataArr);
                }
                $response = [
                    "status"    => true,
                    "message"   => lang('App.blogAdded'),
                    "data"      => []
                ];
            } else {
                $response = [
                    "status"    => false,
                    "message"   => lang('App.blogAddFailed'),
                    "data"      => []
                ];
            }
            return $this->respondCreated($response);
        }
    }

    // get list of blogs
    public function getBlogs($lang = null)
    {

        $currentLang = $lang ?? DEFAULT_LANGUAGE;
        $this->request->setLocale(getLanguageCode($currentLang, true));
        $currentLangCode = getLanguageCode($currentLang);

        $url  = $this->request->getServer('REQUEST_URI');
        $params = getQueryString($url);
        $imagePath = base_url() . 'uploads/';

        // $blogs = $this->blogModel
        //             ->select('
        //                 blogs.*, 
        //                 l.language_'.$currentLangCode.' as language, 
        //                 CONCAT("'.$imagePath.'", blogs.featured_image ) AS featured_image_path
        //             ')
        //             ->join('languages l', 'l.id = blogs.language');

        // if ($params && !empty($params['search'])) {

        //     $blogs->groupStart()
        //             ->like('blogs.title', $params['search'])
        //             ->orGroupStart()
        //                 ->orLike('blogs.content', $params['search'])
        //             ->groupEnd()
        //         ->groupEnd();
        // }

        // if ($params && !empty($params['lang_id'])) {
        //     $blogs->where('blogs.language', $params['lang_id']);
        // }
        // if ($params && !empty($params['status'])) {
        //     $blogs->where('blogs.status', $params['status']);
        // }

        // $blogs = $blogs->orderBy('id', 'DESC')
        //                 ->findAll();

        $builder = $this->blogModel
            ->setLanguage($currentLangCode)
            ->select("
        blogs.*, 
        blog_translations.title, 
        blog_translations.slug,
        blog_translations.meta_title,
        blog_translations.meta_description,
        blog_translations.content,
        blog_translations.featured_image,
        blog_translations.attachments,
        CONCAT('$imagePath', blog_translations.featured_image) AS featured_image_path
    ");

        if (!empty($params['lang_id'])) {
            $builder->where('blog_translations.language_code', $params['lang_id']);
        }

        if (!empty($params['status'])) {
            $builder->where('blogs.status', $params['status']);
        }

        $blogs = $builder
            ->orderBy('blogs.id', 'DESC')
            ->findAll();

        // echo ' >>>>>>>>>>>>>>>>>>>> getLastQuery >>>>>> '. $this->db->getLastQuery();    

        if ($blogs) {
            $response = [
                "status"    => true,
                "message"   => lang('App.dataFound'),
                "data"      => ['blogs' => $blogs]
            ];
        } else {
            $response = [
                "status"    => false,
                "message"   => lang('App.noDataFound'),
                "data"      => []
            ];
        }
        return $this->respondCreated($response);
    }

    // get single blog
    // public function getBlog($slug = null){

    //     $currentLang = $this->request->getVar("lang") ?? DEFAULT_LANGUAGE;
    //     $this->request->setLocale(getLanguageCode($currentLang));
    //     $imagePath = base_url() . 'uploads/';

    //     $blog = $this->blogModel
    //                 ->select('blogs.*, l.language, CONCAT("'.$imagePath.'", blogs.featured_image ) AS featured_image_path')
    //                 ->join('languages l', 'l.id = blogs.language')
    //                 ->where('blogs.slug', $slug)
    //                 // ->where('blogs.id', $slug)
    //                 ->first();  

    //     if($blog){
    //         $response = [
    //             "status"    => true,
    //             "message"   => lang('App.dataFound'),
    //             "data"      => ['blog' => $blog]
    //         ];
    //     } else {
    //         $response = [
    //             "status"    => false,
    //             "message"   => lang('App.noDataFound'),
    //             "data"      => []
    //         ];
    //     }
    //     return $this->respondCreated($response);
    // }


    public function getBlogOld($lang = null)
    {

        $currentLang = $lang ?? DEFAULT_LANGUAGE;
        // $this->request->setLocale(getLanguageCode($currentLang));
        $this->request->setLocale(getLanguageCode($currentLang, true));

        $url  = $this->request->getServer('REQUEST_URI');
        $params = getQueryString($url);
        $imagePath = base_url() . 'uploads/';
        $id = '';
        $slug = '';
        if ($params && !empty($params['id'])) {
            $id = $params['id'];
        }
        if ($params && !empty($params['slug'])) {
            $slug = $params['slug'];
        }

        $currentLang = $this->request->getVar('lang') ?? DEFAULT_LANGUAGE;
        // $this->request->setLocale(getLanguageCode($currentLang));
        $this->request->setLocale(getLanguageCode($currentLang, true));

        // Ensure at least one parameter (id or slug) is provided
        if (empty($id) && empty($slug)) {
            return $this->respondCreated([
                "status" => false,
                "message" => "Either 'id' or 'slug' must be provided.",
                "data" => []
            ]);
        }

        $imagePath = base_url() . 'uploads/';

        // Build the query dynamically based on provided parameters
        $this->blogModel
            ->select('blogs.*, l.language,l.id as lang_id, CONCAT("' . $imagePath . '", blogs.featured_image) AS featured_image_path')
            ->join('languages l', 'l.id = blogs.language');

        if (!empty($id) && !empty($slug)) {
            // If both id and slug are provided, match both
            $this->blogModel->where('blogs.id', $id)->where('blogs.slug', $slug);
        } elseif (!empty($id)) {
            // If only id is provided
            $this->blogModel->where('blogs.id', $id);
        } elseif (!empty($slug)) {
            // If only slug is provided
            $this->blogModel->where('blogs.slug', $slug);
        }

        $blog = $this->blogModel->first();
        if (isset($blog) && !empty($blog['attachments'])) {
            $blog['attachments'] = unserialize($blog['attachments']);
        }

        // Prepare the response
        if ($blog) {
            $response = [
                "status" => true,
                "message" => lang('App.dataFound'),
                "data" => ['blog' => $blog]
            ];
        } else {
            $response = [
                "status" => false,
                "message" => lang('App.noDataFound'),
                "data" => []
            ];
        }

        return $this->respondCreated($response);
    }

    public function getBlog($lang = null)
    {

        $currentLang = $lang ?? DEFAULT_LANGUAGE;
        // $this->request->setLocale(getLanguageCode($currentLang));
        $this->request->setLocale(getLanguageCode($currentLang, true));

        $url  = $this->request->getServer('REQUEST_URI');
        $params = getQueryString($url);
        $imagePath = base_url() . 'uploads/';
        $id = '';
        $slug = '';
        if ($params && !empty($params['id'])) {
            $id = $params['id'];
        }
        if ($params && !empty($params['slug'])) {
            $slug = $params['slug'];
        }

        $currentLang = $this->request->getVar('lang') ?? DEFAULT_LANGUAGE;
        // $this->request->setLocale(getLanguageCode($currentLang));
        $this->request->setLocale(getLanguageCode($currentLang, true));

        // Ensure at least one parameter (id or slug) is provided
        if (empty($id) && empty($slug)) {
            return $this->respondCreated([
                "status" => false,
                "message" => "Either 'id' or 'slug' must be provided.",
                "data" => []
            ]);
        }

        $imagePath = base_url() . 'uploads/';

        $blogs = $this->blogModel->getFullBlogById($id);
        $blogsArr = [];
        if (isset($blogs) && !empty($blogs)) {
            foreach ($blogs as $key => $blog) {
                $filedSlug = $blog['language_code'];
                $blogsArr['title'][$filedSlug] = $blog['title'];
                $blogsArr['slug'] = $blog['slug'];
                $blogsArr['id'] = $blog['id'];
                $blogsArr['featured_image'][$filedSlug] = $blog['featured_image'];
                $blogsArr['meta_title'][$filedSlug] = $blog['meta_title'];
                $blogsArr['meta_description'][$filedSlug] = $blog['meta_description'];
                $blogsArr['content'][$filedSlug] = $blog['content'];
            }
        }
        // Prepare the response
        if ($blogsArr) {
            $response = [
                "status" => true,
                "message" => lang('App.dataFound'),
                "data" => ['blog' => $blogsArr]
            ];
        } else {
            $response = [
                "status" => false,
                "message" => lang('App.noDataFound'),
                "data" => []
            ];
        }

        return $this->respondCreated($response);
    }


    // Delete blogs
    public function deleteBlog($lang = null)
    {

        $currentLang = $lang ?? DEFAULT_LANGUAGE;
        // $this->request->setLocale(getLanguageCode($currentLang));
        $this->request->setLocale(getLanguageCode($currentLang, true));

        if (hasAccess(auth()->user(), ADMIN_ACCESS) || hasAccess(auth()->user(), TRANSFER_OWNERSHIP)) {

            $id = $this->request->getVar("id");
            if (!empty($id)) {

                if (is_array($id) && count($id) > 0) {
                    // $this->deleteMultiple($id);
                }
                $blogs = $this->blogModel->getFullBlogById($id);
                // echo '<pre>'; print_r($blogs); die;
                if ($blogs && count($blogs) > 0) {
                    $del_res = false;
                    // echo '<pre>'; print_r($blogs); die;
                    foreach ($blogs as $blog) {
                        if ($blog['featured_image'] && file_exists(WRITEPATH . 'uploads/' . $blog['featured_image'])) {
                            unlink(WRITEPATH . 'uploads/' . $blog['featured_image']);
                        }
                        // $del_res = $this->blogModel->delete($blog['id']);
                        $del_res = $this->blogModel->deleteBlog($blog['id']);
                        // echo '<pre>'; print_r($del_res); die;
                        // create Activity log
                        $activityEvent = 'deleteBlog';
                        $replacements = [
                            '{BLOG_ID}' => '{BLOG_ID_' . $blog['id'] . '}',
                            // 'BLOG_ID' => 'BLOG_ID_'.$blog['id'],
                        ];
                        $additionalData = ['activity_type_id' => 3]; // deleted
                        logActivity($activityEvent, $replacements, $additionalData);
                    }

                    if ($del_res == true) {
                        $response = [
                            "status"    => true,
                            "message"   => lang('App.blogDeleted'),
                            "data"      => []
                        ];
                    } else {
                        $response = [
                            "status"    => false,
                            "message"   => lang('App.blogDeleteFailed'),
                            "data"      => []
                        ];
                    }
                } else {
                    $response = [
                        "status"    => false,
                        "message"   => lang('App.noDataFound'),
                        "data"      => ['blog_data' => []]
                    ];
                }
            } else {
                $response = [
                    "status"    => false,
                    "message"   => lang('App.provideDeleteData'),
                    "data"      => []
                ];
            }
        } else {
            $response = [
                "status"    => false,
                "message"   => lang('App.permissionDenied'),
                "data"      => []
            ];
        }

        return $this->respondCreated($response);
    }

    public function deleteMultiple($ids)
    {

        foreach ($ids as $id) {
            $blogs = $this->blogModel->getFullBlogById($id);
            // echo '<pre>'; print_r($blogs); die;

            if ($blogs && count($blogs) > 0 && !empty($blogs)) {
                $del_res = false;
                echo '<pre>';
                print_r($blogs);
                die(756);
                foreach ($blogs as $blog) {
                    if ($blog['featured_image'] && file_exists(WRITEPATH . 'uploads/' . $blog['featured_image'])) {
                        unlink(WRITEPATH . 'uploads/' . $blog['featured_image']);
                    }
                    // $del_res = $this->blogModel->delete($blog['id']);
                    $del_res = $this->blogModel->deleteBlog($blog['id']);
                    // echo '<pre>'; print_r($del_res); die;
                    // create Activity log
                    $activityEvent = 'deleteBlog';
                    $replacements = [
                        '{BLOG_ID}' => '{BLOG_ID_' . $blog['id'] . '}',
                        // 'BLOG_ID' => 'BLOG_ID_'.$blog['id'],
                    ];
                    $additionalData = ['activity_type_id' => 3]; // deleted
                    logActivity($activityEvent, $replacements, $additionalData);
                }

                if ($del_res == true) {
                    $response = [
                        "status"    => true,
                        "message"   => lang('App.blogDeleted'),
                        "data"      => []
                    ];
                } else {
                    $response = [
                        "status"    => false,
                        "message"   => lang('App.blogDeleteFailed'),
                        "data"      => []
                    ];
                }
            } else {
                $response = [
                    "status"    => false,
                    "message"   => lang('App.noDataFound'),
                    "data"      => ['blog_data' => []]
                ];
            }
        }
        return $this->respondCreated($response);
        die;
    }

    // Publish blogs
    public function publishBlog($lang = null)
    {

        $currentLang = $lang ?? DEFAULT_LANGUAGE;
        // $this->request->setLocale(getLanguageCode($currentLang));
        $this->request->setLocale(getLanguageCode($currentLang, true));

        if (hasAccess(auth()->user(), ADMIN_ACCESS) || hasAccess(auth()->user(), TRANSFER_OWNERSHIP)) {

            $id = $this->request->getVar("id");
            if (!empty($id) && count($id) > 0) {

                // if ($this->blogModel
                //     ->whereIn('id', $id)
                //     ->set(['status' => 2])   //  2 = Published
                //     ->update()
                // ) {
                if ($this->blogModel->updateIsActive($id, '1')) {
                    // create Activity log
                    if (is_array($id) && isset($id[0])) {
                        $id = $id['0'];
                    }
                    $activityEvent = 'publishBlog';
                    $replacements = [
                        '{BLOG_ID}' => '{BLOG_ID_' . $id . '}',
                    ];
                    $additionalData = ['activity_type_id' => 2]; // updated
                    logActivity($activityEvent, $replacements, $additionalData);

                    $response = [
                        "status"    => true,
                        "message"   => lang('App.blogPublished'),
                        "data"      => []
                    ];
                } else {
                    $response = [
                        "status"    => false,
                        "message"   => lang('App.blogPublishFailed'),
                        "data"      => []
                    ];
                }
            } else {
                $response = [
                    "status"    => false,
                    "message"   => lang('App.provideValidData'),
                    "data"      => []
                ];
            }
        } else {
            $response = [
                "status"    => false,
                "message"   => lang('App.permissionDenied'),
                "data"      => []
            ];
        }

        return $this->respondCreated($response);
    }

    // Draft blogs
    public function draftBlog($lang = null)
    {

        $currentLang = $lang ?? DEFAULT_LANGUAGE;
        // $this->request->setLocale(getLanguageCode($currentLang));
        $this->request->setLocale(getLanguageCode($currentLang, true));

        if (hasAccess(auth()->user(), ADMIN_ACCESS) || hasAccess(auth()->user(), TRANSFER_OWNERSHIP)) {

            $id = $this->request->getVar("id");
            if (!empty($id) && count($id) > 0) {

                // if ($this->blogModel
                //     ->whereIn('id', $id)
                //     ->set(['status' => 1])   //  1 = Draft
                //     ->update()
                // ) {
                if ($this->blogModel->updateIsActive($id, '0')) {
                    // create Activity log
                    if (is_array($id) && isset($id[0])) {
                        $id = $id['0'];
                    }
                    $activityEvent = 'draftBlog';
                    $replacements = [
                        // 'BLOG_ID' => 'BLOG_ID_'.$id,
                        '{BLOG_ID}' => '{BLOG_ID_' . $id . '}',
                    ];
                    $additionalData = ['activity_type_id' => 2]; // updated
                    logActivity($activityEvent, $replacements, $additionalData);
                    $response = [
                        "status"    => true,
                        "message"   => lang('App.blogDraft'),
                        "data"      => []
                    ];
                } else {
                    $response = [
                        "status"    => false,
                        "message"   => lang('App.blogDraftFailed'),
                        "data"      => []
                    ];
                }
            } else {
                $response = [
                    "status"    => false,
                    "message"   => lang('App.provideValidData'),
                    "data"      => []
                ];
            }
        } else {
            $response = [
                "status"    => false,
                "message"   => lang('App.permissionDenied'),
                "data"      => []
            ];
        }

        return $this->respondCreated($response);
    }
}
