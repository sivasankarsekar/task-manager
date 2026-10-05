import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from './services/task.service';
import { Task } from './models/task.model';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);

  protected readonly tasks = signal<Task[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly loading = signal(false);

  protected readonly taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => this.tasks.set(tasks),
      error: () => this.errorMessage.set('Failed to load tasks from server.'),
    });
  }

  submit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { title, description } = this.taskForm.getRawValue();
    this.taskService
      .createTask({ title: title!, description: description || undefined })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.successMessage.set('Task created successfully!');
          this.taskForm.reset();
          this.loadTasks();
        },
        error: (err) => {
          this.loading.set(false);
          if (err.status === 400 && err.error?.title) {
            this.errorMessage.set(err.error.title);
          } else {
            this.errorMessage.set('Failed to create task. Please try again.');
          }
        },
      });
  }
}
