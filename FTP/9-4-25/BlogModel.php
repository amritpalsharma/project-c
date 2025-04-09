<?php

namespace App\Models;

use CodeIgniter\Model;

class BlogModel extends Model
{
    protected $table      = 'blogs';
    protected $primaryKey = 'id';
    // protected $allowedFields = ['created_by', 'is_active', 'created_at', 'updated_at'];
    protected $allowedFields = [
        'blog_id',
        'language_code',
        'title',
        'slug',
        'meta_title',
        'meta_description',
        'content',
        'featured_image',
        'attachments',
        'is_active',
        'created_by'
    ];
    protected $useTimestamps = true;

    // Auto join blog_translations
    protected $returnType     = 'array';

    protected $language = 'en'; // default language, can override via method

    protected $createdField  = 'created_at'; // Field name for created time
    protected $updatedField  = 'updated_at'; // Field name for updated time


    public function setLanguage(string $lang)
    {
        $this->language = $lang;
        return $this;
    }

    protected function initialize()
    {
        $this->builder()->select('blogs.*, blog_translations.title, blog_translations.slug, blog_translations.meta_title, blog_translations.meta_description, blog_translations.content, blog_translations.featured_image, blog_translations.attachments');
        $this->builder()->join('blog_translations', 'blogs.id = blog_translations.blog_id', 'left');
        $this->builder()->where('blog_translations.language_code', $this->language);
    }

    // Optional helper method
    public function getBlogWithTranslation($id)
    {
        return $this->setLanguage($this->language)->where('blogs.id', $id)->first();
    }

    public function createBlog(array $data): ?int
    {
        if ($this->insert($data)) {
            return $this->getInsertID(); // Return the inserted blog ID
        }

        return null;
    }

    public function saveTranslation(array $data): bool
    {
        $db = \Config\Database::connect();
        // return $this->save($data); // It will insert or update if primary key is given
        return $db->table('blog_translations')->insert($data); // It will insert or update if primary key is given
    }

    public function deleteBlog($blogId)
    {
        $db = \Config\Database::connect();
        $db->table('blog_translations')->where('blog_id', $blogId)->delete();

        // Then delete from blogs
        return $db->table('blogs')->where('id', $blogId)->delete();
    }

    public function getFullBlogById($id)
    {
        $db = \Config\Database::connect();

        // Main blog table
        $builder = $db->table('blogs');
        $builder->select('blogs.*, blog_translations.language_code, blog_translations.featured_image as featured_image, blog_translations.title, blog_translations.slug, blog_translations.meta_title, blog_translations.meta_description, blog_translations.content');
        $builder->join('blog_translations', 'blog_translations.blog_id = blogs.id');
        if (is_array($id) && count($id) > 1) {
            $builder->whereIn('blogs.id', $id);
        } else {
            $builder->where('blogs.id', $id);
            // echo 'NotArray';
        }
        // die;

        $query = $builder->get();
        return $query->getResultArray(); // You can use getRowArray() if expecting only one lang
    }


    public function getSliderNews($language, $limit = 5)
    {
        // return $this->select('blogs.*, blog_translations.title, blog_translations.slug, blog_translations.language')
        //     ->join('blog_translations', 'blog_translations.blog_id = blogs.id')
        //     ->where('blogs.is_active', '1')
        //     ->where('blog_translations.language_code', $language)
        //     ->orderBy('blogs.id', 'DESC')
        //     ->findAll($limit, 0);
        return $this->select('blogs.*, bt.title, bt.slug, bt.language_code')
            ->join('blog_translations as bt', 'bt.blog_id = blogs.id')
            ->where('blogs.is_active', '1')
            ->where('bt.language_code', $language)
            ->orderBy('blogs.id', 'DESC')
            ->findAll($limit, 0);
    }

    public function getLatestNews($langId)
    {
        $limit = 6;
        $offset = 3;
        $db = \Config\Database::connect();
        // return $this->select('blogs.*, bt.title, bt.slug, bt.language_code')
        return $this->select('blogs.*, bt.title, bt.slug, bt.language_code, bt.featured_image')
            ->join('blog_translations as bt', 'bt.blog_id = blogs.id')
            ->where('blogs.is_active', '1')
            ->where('bt.language_code', $langId)
            ->orderBy('blogs.id', 'DESC')
            ->findAll($limit, $offset);

        // echo $this->db->getLastQuery(); die(' dsfds');
    }

    public function getSingleNews($slug, $langCode)
    {
        return $this->select('blogs.*, bt.title, bt.slug, bt.language, bt.content, bt.meta_title, bt.meta_description,  bt.featured_image')
            ->join('blog_translations as bt', 'bt.blog_id = blogs.id')
            ->where('blogs.is_active', '1')
            ->where('bt.slug', $slug)
            ->where('bt.language_code', $langCode)
            ->first();
    }

    public function updateIsActive($blogId, $status)
    {
        $db = \Config\Database::connect();
        if (is_array($blogId) && count($blogId) > 1) {
            foreach ($blogId as $key => $id) {


                $db->table('blogs')
                    ->where('id', $id)
                    ->update(['is_active' => $status]);
            }
            return true;
        } else {
           return $db->table('blogs')
            ->where('id', $blogId)
            ->update(['is_active' => $status]);
        }
    }
}
