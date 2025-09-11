import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ApiService, EmployeeDto } from '../core/api.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  form: FormGroup;
  results: EmployeeDto[] = [];
  loading = false;
  error: string | null = null;
  readonly allFields = ['firstname', 'lastname', 'title', 'division', 'building', 'room'];
  private selected = new Set<string>();

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.form = this.fb.group({
      query: [''],
      fields: [[]] // multi-select later; for now array of strings
    });
  }

  ngOnInit() {
    this.form.get('query')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.onSearch());
  }

  onSearch() {
    const q: string = this.form.value.query || '';
    const fields: string[] = Array.from(this.selected);
    this.loading = true;
    this.error = null;
    this.results = [];
    this.api.searchEmployees(q, fields).subscribe({
      next: (res) => { this.results = res || []; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Search failed'; this.loading = false; }
    });
  }

  toggleField(field: string) {
    if (this.selected.has(field)) this.selected.delete(field); else this.selected.add(field);
    this.form.patchValue({ fields: Array.from(this.selected) }, { emitEvent: false });
    this.onSearch();
  }

  isActive(field: string) {
    return this.selected.has(field);
  }
}


