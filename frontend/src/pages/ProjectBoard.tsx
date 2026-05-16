import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  useDroppable,
  type DragEndEvent 
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Plus, ArrowLeft, Trash2, Edit2 } from "lucide-react";
import "./ProjectBoard.css";

// Basic Task component for Sortable
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableTask = ({ task, onEdit, onDelete, isAdmin }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="board-task card">
      <div className="task-top">
        <span className={`priority-dot priority-${task.priority.toLowerCase()}`}></span>
        {isAdmin && (
          <div className="task-actions" onPointerDown={(e) => e.stopPropagation()}>
            <button className="icon-btn text-muted" onClick={() => onEdit(task)}><Edit2 size={14} /></button>
            <button className="icon-btn text-danger" onClick={() => onDelete(task.id)}><Trash2 size={14} /></button>
          </div>
        )}
      </div>
      <h4 className="board-task-title">{task.title}</h4>
      {task.dueDate && (
        <div className={`board-task-due ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
          {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}
      <div className="board-task-footer">
        {task.assignee ? (
          <div className="assignee-avatar" title={task.assignee.name}>
            {task.assignee.name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="unassigned">Unassigned</div>
        )}
      </div>
    </div>
  );
};

const BoardColumn = ({ status, tasks, isAdmin, onEdit, onDelete }: any) => {
  const { setNodeRef } = useDroppable({ id: status });
  
  return (
    <div className="board-column">
      <div className="column-header">
        <h3>{status}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className="column-content" style={{ minHeight: "200px" }}>
        <SortableContext items={tasks.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task: any) => (
            <SortableTask 
              key={task.id} 
              task={task} 
              isAdmin={isAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export const ProjectBoard = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  
  // Task Form State
  const [taskForm, setTaskForm] = useState({ id: "", title: "", description: "", priority: "Medium", dueDate: "", assignedTo: "" });

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}`);
      return res.data;
    },
  });

  const { data: tasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ["projectTasks", projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/tasks`);
      return res.data;
    },
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const res = await api.put(`/projects/${projectId}/tasks/${taskId}`, { status });
      return res.data;
    },
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["projectTasks", projectId] });
      const previousTasks = queryClient.getQueryData(["projectTasks", projectId]);
      
      queryClient.setQueryData(["projectTasks", projectId], (old: any) => {
        return old?.map((t: any) => t.id === taskId ? { ...t, status } : t);
      });
      
      return { previousTasks };
    },
    onError: (_err, _newTodo, context: any) => {
      queryClient.setQueryData(["projectTasks", projectId], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTasks", projectId] });
    },
  });

  const saveTask = useMutation({
    mutationFn: async (taskData: any) => {
      if (taskData.id) {
        return await api.put(`/projects/${projectId}/tasks/${taskData.id}`, taskData);
      } else {
        return await api.post(`/projects/${projectId}/tasks`, taskData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTasks", projectId] });
      setIsTaskModalOpen(false);
      setTaskForm({ id: "", title: "", description: "", priority: "Medium", dueDate: "", assignedTo: "" });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTasks", projectId] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks?.find((t: any) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropping on a column
    if (["To Do", "In Progress", "Done"].includes(overId)) {
      if (activeTask.status !== overId) {
        updateTaskStatus.mutate({ taskId: activeId, status: overId });
      }
      return;
    }

    // Check if dropping on another task to change status to that task's status
    const overTask = tasks?.find((t: any) => t.id === overId);
    if (overTask && activeTask.status !== overTask.status) {
      updateTaskStatus.mutate({ taskId: activeId, status: overTask.status });
    }
  };

  if (isProjectLoading || isTasksLoading) {
    return <div className="flex-center" style={{ height: "100%" }}><div className="spinner"></div></div>;
  }

  const isAdmin = project?.members.some((m: any) => m.userId === user?.id && m.role === "Admin");
  
  const columns = ["To Do", "In Progress", "Done"];

  return (
    <div className="board-container">
      <div className="board-header">
        <div>
          <Link to="/projects" className="back-link"><ArrowLeft size={16} /> Back to Projects</Link>
          <h1 style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>{project?.title}</h1>
          <p className="text-muted">{project?.description}</p>
        </div>
        <div className="board-actions">
          <div className="members-avatars">
            {project?.members.map((m: any) => (
              <div key={m.id} className="avatar small" title={`${m.user.name} (${m.role})`}>
                {m.user.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          {isAdmin && (
            <>
              {/* <button className="btn btn-secondary" onClick={() => setIsMemberModalOpen(true)}>
                <Users size={16} /> Members
              </button> */}
              <button className="btn btn-primary" onClick={() => {
                setTaskForm({ id: "", title: "", description: "", priority: "Medium", dueDate: "", assignedTo: "" });
                setIsTaskModalOpen(true);
              }}>
                <Plus size={16} /> Add Task
              </button>
            </>
          )}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="board-columns">
          {columns.map(status => {
            const columnTasks = tasks?.filter((t: any) => t.status === status) || [];
            
            return (
              <BoardColumn 
                key={status}
                status={status}
                tasks={columnTasks}
                isAdmin={isAdmin}
                onEdit={(t: any) => {
                  setTaskForm({
                    id: t.id,
                    title: t.title,
                    description: t.description || "",
                    priority: t.priority,
                    dueDate: t.dueDate ? t.dueDate.split('T')[0] : "",
                    assignedTo: t.assignedTo || ""
                  });
                  setIsTaskModalOpen(true);
                }}
                onDelete={(id: string) => {
                  if (confirm("Delete this task?")) deleteTask.mutate(id);
                }}
              />
            );
          })}
        </div>
      </DndContext>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h2 style={{ marginBottom: "1.5rem" }}>{taskForm.id ? "Edit Task" : "New Task"}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const payload: any = { ...taskForm };
              if (!payload.assignedTo) payload.assignedTo = null;
              if (!payload.dueDate) delete payload.dueDate;
              saveTask.mutate(payload);
            }}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>Title</label>
                <input required type="text" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
              </div>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>Description</label>
                <textarea rows={3} value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label>Assign To</label>
                <select value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})}>
                  <option value="">Unassigned</option>
                  {project?.members.map((m: any) => (
                    <option key={m.userId} value={m.userId}>{m.user.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsTaskModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saveTask.isPending}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
