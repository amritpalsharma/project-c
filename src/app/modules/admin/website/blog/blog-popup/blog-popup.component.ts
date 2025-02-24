import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import {
  MatDialogRef,MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { environment } from '../../../../../../environments/environment';
import { BlogService } from '../../../../../services/blog.service';
// import { TemplateService } from '../../../../../services/template.service';

@Component({
  selector: 'app-blog-popup',
  templateUrl: './blog-popup.component.html',
  styleUrl: './blog-popup.component.scss'
})
export class BlogPopupComponent  implements OnInit, OnDestroy  {
  // id = 0;
  editor!: Editor;
  title:string = "";
  selectedRole:any = 0;
  selectedLang:any = 1;
  selectedLocation:any = 1;
  roles:any = [];
  langs:any = [];
  locations:any = [];
  blogIdToEdit: any = '';
  featured_image:any = "";
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['ordered_list', 'bullet_list'],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  colorPresets :any = environment.colors;


  content: string = '';
  isLoading:boolean = false
  error:boolean = false
  errorMsg:any = {}
  slug: string = "";
  meta_description: string = "";
  meta_title: string = "";


  constructor(    
    public dialogRef: MatDialogRef<BlogPopupComponent>, private blogApi: BlogService,
    @Inject(MAT_DIALOG_DATA) public blog: any
  ) {
    if(blog){
      this.getBlog(blog.id)
    }

    let envRoles:any = environment.roles;
    
    this.roles = envRoles;
    this.langs = environment.langs;
    this.locations = environment.domains;
  }

  ngOnInit(): void {
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  close(): void {
   console.log(this.editor);
    this.dialogRef.close({
    });
  }
  
  remove(): void {
    this.dialogRef.close({
      action:'remove'
    });
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      let FileToUpload = input.files[0];
      this.featured_image = FileToUpload;
    }
  }

  validateForm(){

    this.error = false;
    this.errorMsg = {};
    
    if(this.title == ""){
      this.error = true;
      this.errorMsg.title = "Title is required";
    }
    if(this.content == "" || this.content == "<p></p>"){
      this.error = true;
      this.errorMsg.content = "Content is required";
    }
    if(this.slug == ""){
      this.error = true;
      this.errorMsg.slug = "Slug is required";
    }
    if(this.slug.includes(' ')){
      this.error = true;
      this.errorMsg.slug = "Slug is Invalid";
    }

    if(this.meta_title == ""){
      this.error = true;
      this.errorMsg.meta_title = "Meta title is required";
    }
    if(this.meta_description == ""){
      this.error = true;
      this.errorMsg.meta_description = "Meta description is required";
    }
    return this.error;
  }

  
  async getBlog(id:any): Promise<void> {
    this.isLoading = true;

    try {
      this.isLoading = true;
      this.blogApi.getBlogById(id).subscribe((response)=>{
      if (response && response.status && response.data && response.data.blog) {
        
        this.blog = response.data.blog;
        // console.log(this.template)
        this.blogIdToEdit = this.blog.id;
        this.title = this.blog.title;
        this.content = this.blog.content;
        this.selectedLang = Number(this.blog.lang_id);
        this.meta_title = this.blog.meta_title;
        this.meta_description = this.blog.meta_description;
        this.slug = this.blog.slug;
        this.isLoading = false;
      } else {
        this.blog = [];
        this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
      });     
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  createBlog():any{

    let validForm:any = this.validateForm();
    if(validForm){
      return false;
    }
   
    let params:any = {}
    params.title = this.title;
    params.content = this.content;
    params.language = this.selectedLang;
    params.featured_image = this.featured_image;
    params.slug = this.slug;
    params.meta_title = this.meta_title;
    params.meta_description = this.meta_description;
    params.status  = 1; // 1 for active, 2 for inactive    
    
    this.blogApi.addBlog(params).subscribe((response)=>{
      if (response && response.status) {
        this.dialogRef.close({
          action: 'blogAdded'
        });
      } else {
        // this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
    });         
  }

  updateBlog():any{

    let validForm:any = this.validateForm();
    if(validForm){
      return false;
    }

    let params:any = {}
    params.title = this.title;
    params.content = this.content;
    params.language = this.selectedLang;
    params.featured_image = this.featured_image;
    params.slug = this.slug;
    params.meta_title = this.meta_title;
    params.meta_description = this.meta_description;
    params.status  = 1; // 1 for active, 2 for inactive    
    
    this.blogApi.updateBlog(this.blogIdToEdit, params).subscribe((response)=>{
      if (response && response.status) {
        this.dialogRef.close({
          action: 'templateUpdated'
        });
      } else {
        // this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
    });         
  }

}
