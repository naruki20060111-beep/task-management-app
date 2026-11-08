package com.example.taskmanagement;

public class Task {

    private int taskId;
    private String taskName;
    private String deadline;
    private int completed;
    private String createdAt;

    public Task(String taskName, String deadline) {
        this.taskName = taskName;
        this.deadline = deadline;
        this.completed = 0;
    }

    public Task(int taskId, String taskName, String deadline,
                int completed, String createdAt) {

        this.taskId = taskId;
        this.taskName = taskName;
        this.deadline = deadline;
        this.completed = completed;
        this.createdAt = createdAt;
    }

    public int getTaskId() {
        return taskId;
    }

    public String getTaskName() {
        return taskName;
    }

    public String getDeadline() {
        return deadline;
    }

    public int getCompleted() {
        return completed;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}