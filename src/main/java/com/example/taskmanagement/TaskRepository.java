package com.example.taskmanagement;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class TaskRepository {

    private static final String DB_URL = "jdbc:sqlite:data/tasks.db";

    public void save(Task task) {
        String sql = """
                INSERT INTO tasks
                (task_name, deadline, completed, created_at)
                VALUES (?, ?, ?, datetime('now', 'localtime'))
                """;

        try (
            Connection connection =
                DriverManager.getConnection(DB_URL);
            PreparedStatement statement =
                connection.prepareStatement(sql)
        ) {
            statement.setString(1, task.getTaskName());
            statement.setString(2, task.getDeadline());
            statement.setInt(3, task.getCompleted());

            statement.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<Task> findAll() {
        List<Task> tasks = new ArrayList<>();

        String sql = """
                SELECT task_id, task_name, deadline,
                       completed, created_at
                FROM tasks
                ORDER BY task_id
                """;

        try (
            Connection connection =
                DriverManager.getConnection(DB_URL);
            PreparedStatement statement =
                connection.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery()
        ) {
            while (resultSet.next()) {
                Task task = new Task(
                    resultSet.getInt("task_id"),
                    resultSet.getString("task_name"),
                    resultSet.getString("deadline"),
                    resultSet.getInt("completed"),
                    resultSet.getString("created_at")
                );

                tasks.add(task);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return tasks;
    }

    public void update(int taskId, Task task) {
        String sql = """
                UPDATE tasks
                SET task_name = ?, deadline = ?
                WHERE task_id = ?
                """;

        try (
            Connection connection =
                DriverManager.getConnection(DB_URL);
            PreparedStatement statement =
                connection.prepareStatement(sql)
        ) {
            statement.setString(1, task.getTaskName());
            statement.setString(2, task.getDeadline());
            statement.setInt(3, taskId);

            statement.executeUpdate();

        } catch (Exception e) {
            throw new RuntimeException(
                "タスクの更新に失敗しました", e
            );
        }
    }

    public void updateCompleted(int taskId, int completed) {
        String sql = """
                UPDATE tasks
                SET completed = ?
                WHERE task_id = ?
                """;

        try (
            Connection connection =
                DriverManager.getConnection(DB_URL);
            PreparedStatement statement =
                connection.prepareStatement(sql)
        ) {
            statement.setInt(1, completed);
            statement.setInt(2, taskId);

            statement.executeUpdate();

        } catch (Exception e) {
            throw new RuntimeException(
                "タスクの完了状態の更新に失敗しました", e
            );
        }
    }

    public void delete(int taskId) {
        String sql = "DELETE FROM tasks WHERE task_id = ?";

        try (
            Connection connection =
                DriverManager.getConnection(DB_URL);
            PreparedStatement statement =
                connection.prepareStatement(sql)
        ) {
            statement.setInt(1, taskId);
            statement.executeUpdate();

        } catch (Exception e) {
            throw new RuntimeException(
                "タスクの削除に失敗しました", e
            );
        }
    }
}
