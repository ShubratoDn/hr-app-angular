import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ApiService, EmployeeDto } from '../core/api.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  form: FormGroup;
  results: EmployeeDto[] = [];
  loading = false;
  error: string | null = null;
  readonly allFields = ['all', 'id', 'firstname', 'lastname', 'title', 'division', 'building', 'room'];
  private selected = new Set<string>();
  editingId: number | null = null;
  editBuffer: Partial<EmployeeDto> = {};

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

  startEdit(e: EmployeeDto) {
    this.editingId = e.id ?? null;
    this.editBuffer = { ...e };
  }

  cancelEdit() {
    this.editingId = null;
    this.editBuffer = {};
  }

  saveEdit(e: EmployeeDto) {
    if (!e.id) return;
    this.loading = true;
    const payload: EmployeeDto = {
      id: e.id,
      firstName: this.editBuffer.firstName ?? e.firstName,
      lastName: this.editBuffer.lastName ?? e.lastName,
      title: this.editBuffer.title ?? e.title,
      division: this.editBuffer.division ?? e.division,
      building: this.editBuffer.building ?? e.building,
      room: this.editBuffer.room ?? e.room
    };
    this.api.updateEmployee(e.id, payload).subscribe({
      next: (updated) => {
        const idx = this.results.findIndex(r => r.id === e.id);
        if (idx > -1) this.results[idx] = updated;
        this.editingId = null;
        this.editBuffer = {};
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Update failed';
        this.loading = false;
      }
    });
  }

  deleteEmployee(e: EmployeeDto) {
    if (!e.id) return;
    // Optional confirmation; could be replaced by a nicer modal later
    if (!confirm(`Delete ${e.firstName} ${e.lastName}?`)) return;
    this.loading = true;
    this.api.deleteEmployee(e.id).subscribe({
      next: () => {
        this.results = this.results.filter(r => r.id !== e.id);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Delete failed';
        this.loading = false;
      }
    });
  }
}


