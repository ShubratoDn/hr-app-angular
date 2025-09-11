import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  form: FormGroup;
  submitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  backendErrors: Record<string, string> | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      division: ['', [Validators.required, Validators.maxLength(100)]],
      building: ['', [Validators.required, Validators.maxLength(100)]],
      title: ['', [Validators.required, Validators.maxLength(100)]],
      room: ['', [Validators.required, Validators.maxLength(20)]]
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.successMessage = null;
    this.errorMessage = null;
    this.backendErrors = null;
    const payload = this.form.value;
    this.http.post('http://localhost:1234/api/employees', payload).subscribe({
      next: () => {
        this.successMessage = 'Employee created successfully.';
        this.form.reset();
        this.submitting = false;
      },
      error: (err) => {
        // Try to read structured error from backend { message, errors }
        const body = err?.error || {};
        this.errorMessage = body.message || 'Failed to create employee.';
        if (body.errors && typeof body.errors === 'object') {
          this.backendErrors = body.errors as Record<string, string>;
          // Attach server errors to controls to show under inputs
          Object.entries(this.backendErrors).forEach(([key, message]) => {
            const ctrl = this.form.get(key);
            if (ctrl) {
              ctrl.setErrors({ ...(ctrl.errors || {}), server: message });
            }
          });
        }
        this.submitting = false;
      }
    });
  }
}


