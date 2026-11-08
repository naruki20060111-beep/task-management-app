package com.example.taskmanagement;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository = new TaskRepository();

    @PostMapping
    public void registerTask(@RequestBody TaskRequest request) {

        Task task = new Task(
            request.getTaskName(),
            request.getDeadline()
        );

        taskRepository.save(task);
    }

    @GetMapping
    public List<Task> getTasks() {
        return taskRepository.findAll();
    }

    @PutMapping("/{id}")
    public void updateTask(
            @PathVariable int id,
            @RequestBody TaskRequest request) {

        Task task = new Task(
            request.getTaskName(),
            request.getDeadline()
        );

        taskRepository.update(id, task);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable int id) {
        taskRepository.delete(id);
    }

    @PatchMapping("/{id}/completed")
    public void updateCompleted(
            @PathVariable int id,
            @RequestBody CompletedRequest request) {

        taskRepository.updateCompleted(
            id,
            request.getCompleted()
        );
    }
}
