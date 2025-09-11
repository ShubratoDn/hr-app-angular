import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmployeeDto {
  id?: number;
  firstName: string;
  lastName: string;
  title: string;
  division: string;
  building: string;
  room: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  importedCount?: number;
  employees?: T;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:1234/api';

  constructor(private http: HttpClient) {}

  // Employees
  createEmployee(payload: EmployeeDto): Observable<EmployeeDto> {
    return this.http.post<EmployeeDto>(`${this.baseUrl}/employees`, payload);
  }

  updateEmployee(id: number, payload: EmployeeDto): Observable<EmployeeDto> {
    return this.http.put<EmployeeDto>(`${this.baseUrl}/employees/${id}`, payload);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/employees/${id}`);
  }

  searchEmployees(name: string, fields: string[] = []): Observable<EmployeeDto[]> {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (fields && fields.length) {
      // backend accepts repeated field params or comma-separated
      params = params.set('field', fields.join(','));
    }
    return this.http.get<EmployeeDto[]>(`${this.baseUrl}/employees/search`, { params });
  }

  // XML Import
  importEmployeesXml(file: File): Observable<ApiResponse<EmployeeDto[]>> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ApiResponse<EmployeeDto[]>>(`${this.baseUrl}/import/xml`, form);
  }
}


