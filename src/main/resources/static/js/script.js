const addButton = document.getElementById("addButton");
const taskForm = document.getElementById("taskForm");
const registerButton = document.getElementById("registerButton");
const sortSelect = document.getElementById("sortSelect");

const taskName = document.getElementById("taskName");
const deadline = document.getElementById("deadline");
const taskList = document.getElementById("taskList");
const notificationMessage =
    document.getElementById("notificationMessage");

const notificationDays =
    document.getElementById("notificationDays");
const saveNotificationButton =
    document.getElementById("saveNotificationButton");

let editingTaskId = null;


function getTodayString() {
    const now = new Date();

    return [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");
}


function getNotificationDays() {
    const savedDays = localStorage.getItem("notificationDays");

    return savedDays === null ? 7 : Number(savedDays);
}


function updateNotificationMessage() {
    const days = getNotificationDays();

    notificationMessage.textContent =
        `締切日の${days}日前に、未完了のタスクを通知します。`;
}


notificationDays.value = getNotificationDays();


saveNotificationButton.addEventListener("click", function () {
    const days = Number(notificationDays.value);

    if (
        notificationDays.value === "" ||
        !Number.isInteger(days) ||
        days < 1 ||
        days > 365
    ) {
        alert("1～365の整数を入力してください");
        return;
    }

    localStorage.setItem("notificationDays", days);

    updateNotificationMessage();
    loadTasks();

    alert("通知設定を保存しました");
});


addButton.addEventListener("click", function () {
    editingTaskId = null;

    taskName.value = "";
    deadline.value = "";
    registerButton.textContent = "登録";

    taskForm.hidden = false;
    addButton.hidden = true;
});


registerButton.addEventListener("click", async function () {
    const data = {
        taskName: taskName.value.trim(),
        deadline: deadline.value
    };

    if (data.taskName === "" || data.deadline === "") {
        alert("タスク名と締切日を入力してください");
        return;
    }

    if (data.deadline < getTodayString()) {
        alert("タスクの登録に失敗しました");
        return;
    }

    const isEditing = editingTaskId !== null;

    const url = isEditing
        ? `/api/tasks/${editingTaskId}`
        : "/api/tasks";

    const method = isEditing ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("保存に失敗しました");
        }

        alert(
            isEditing
                ? "タスクを更新しました"
                : "タスクを登録しました"
        );

        taskName.value = "";
        deadline.value = "";
        taskForm.hidden = true;
        addButton.hidden = false;
        registerButton.textContent = "登録";
        editingTaskId = null;

        await loadTasks();

    } catch (error) {
        console.error(error);

        alert(
            isEditing
                ? "タスクの更新に失敗しました"
                : "タスクの登録に失敗しました"
        );
    }
});


async function deleteTask(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("削除に失敗しました");
        }

        if (editingTaskId === taskId) {
            editingTaskId = null;
            taskName.value = "";
            deadline.value = "";
            taskForm.hidden = true;
            addButton.hidden = false;
            registerButton.textContent = "登録";
        }

        await loadTasks();

    } catch (error) {
        console.error(error);
        alert("タスクの削除に失敗しました");
    }
}


async function updateCompleted(taskId, completed, checkbox) {
    checkbox.disabled = true;

    try {
        const response = await fetch(
            `/api/tasks/${taskId}/completed`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    completed: completed ? 1 : 0
                })
            }
        );

        if (!response.ok) {
            throw new Error("完了状態の更新に失敗しました");
        }

        await loadTasks();

    } catch (error) {
        console.error(error);

        checkbox.checked = !completed;
        alert("完了状態の更新に失敗しました");

    } finally {
        checkbox.disabled = false;
    }
}


function checkDeadlineNotifications(tasks) {
    const todayString = getTodayString();
    const today = new Date(todayString + "T00:00:00");

    const days = getNotificationDays();

    const notifications = tasks.filter(function (task) {
        if (Number(task.completed) !== 0) {
            return false;
        }

        const deadlineDate = new Date(
            task.deadline + "T00:00:00"
        );

        const notificationStart = new Date(deadlineDate);

        notificationStart.setDate(
            notificationStart.getDate() - days
        );

        return today >= notificationStart
            && today <= deadlineDate;
    });

    updateNotificationMessage();

    if (notifications.length === 0) {
        return;
    }

    const messages = notifications.map(function (task) {
        return `・${task.taskName}（締切日：${task.deadline}）`;
    });

    notificationMessage.textContent =
        `【締切のお知らせ】\n` +
        `締切日が${days}日以内の未完了タスクがあります。\n` +
        messages.join("\n");
}


function sortTasks(tasks) {
    const sortType = sortSelect.value;

    if (sortType === "deadline") {
        tasks.sort(function (a, b) {
            return a.deadline.localeCompare(b.deadline);
        });
    }

    else if (sortType === "incomplete") {
        tasks.sort(function (a, b) {
            return Number(a.completed) - Number(b.completed);
        });
    }

    else if (sortType === "created") {
        tasks.sort(function (a, b) {
            return b.taskId - a.taskId;
        });
    }

    return tasks;
}


sortSelect.addEventListener("change", function () {
    loadTasks();
});


async function loadTasks() {
    try {
        const response = await fetch("/api/tasks");

        if (!response.ok) {
            throw new Error("一覧の取得に失敗しました");
        }

        const tasks = await response.json();

        checkDeadlineNotifications(tasks);

        sortTasks(tasks);

        taskList.replaceChildren();

        tasks.forEach(function (task) {
            const taskElement = document.createElement("div");
            taskElement.className = "task";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = Number(task.completed) === 1;

            checkbox.setAttribute(
                "aria-label",
                `${task.taskName}を完了にする`
            );

            checkbox.addEventListener("change", function () {
                updateCompleted(
                    task.taskId,
                    checkbox.checked,
                    checkbox
                );
            });

            const info = document.createElement("div");
            info.className = "task-info";

            const name = document.createElement("h3");
            name.textContent = task.taskName;

            const date = document.createElement("p");
            date.textContent = `締切日：${task.deadline}`;

            info.appendChild(name);
            info.appendChild(date);

            const editButton = document.createElement("button");
            editButton.textContent = "編集";
            editButton.className = "edit-button";

            editButton.addEventListener("click", function () {
                editingTaskId = task.taskId;

                taskName.value = task.taskName;
                deadline.value = task.deadline;

                registerButton.textContent = "更新";
                taskForm.hidden = false;
                addButton.hidden = true;

                taskName.focus();
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "削除";
            deleteButton.className = "delete-button";

            deleteButton.addEventListener("click", function () {
                deleteTask(task.taskId);
            });

            const actions = document.createElement("div");
            actions.className = "task-actions";

            actions.appendChild(editButton);
            actions.appendChild(deleteButton);

            taskElement.appendChild(checkbox);
            taskElement.appendChild(info);
            taskElement.appendChild(actions);

            taskList.appendChild(taskElement);
        });

    } catch (error) {
        console.error(error);
        alert("タスク一覧の取得に失敗しました");
    }
}


updateNotificationMessage();

loadTasks();


let lastCheckedDate = getTodayString();

setInterval(function () {
    const currentDate = getTodayString();

    if (currentDate !== lastCheckedDate){
        lastCheckedDate = currentDate;
        loadTasks();
    }
}, 1000);
