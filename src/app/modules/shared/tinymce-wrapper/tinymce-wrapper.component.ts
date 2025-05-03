import {
  Component,
  forwardRef,
  Input,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

declare var tinymce: any;

@Component({
  selector: 'app-tinymce-wrapper',
  template: `<textarea #editorElem [id]="elementId"></textarea>`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TinymceWrapperComponent),
      multi: true
    }
  ]
})
export class TinymceWrapperComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  // @ViewChild('editorElem') editorElem: ElementRef;
  @ViewChild('editorElem') editorElem!: ElementRef;
  @Input() elementId = 'tiny-' + Math.floor(Math.random() * 1000000);

  editor: any;
  value = '';

  onChange = (value: string) => {};
  onTouched = () => {};

  ngAfterViewInit(): void {
    tinymce.init({
      target: this.editorElem.nativeElement,
      menubar: false,
      height: 300,
      plugins: 'lists link image code',
      toolbar: 'undo redo | bold italic | bullist numlist | code',
      setup: (editor: any) => {
        this.editor = editor;

        editor.on('init', () => {
          editor.setContent(this.value || '');
        });

        editor.on('change keyup', () => {
          const content = editor.getContent();
          this.value = content;
          this.onChange(content);
        });
      }
    });
  }

  writeValue(value: string): void {
    this.value = value;
    if (this.editor) {
      this.editor.setContent(this.value || '');
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  ngOnDestroy(): void {
    if (this.editor) {
      tinymce.remove(this.editor);
    }
  }
}
