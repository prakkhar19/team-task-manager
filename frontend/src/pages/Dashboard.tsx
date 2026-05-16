import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/axios";
import { CheckCircle, Clock, AlertCircle, BarChart2 } from "lucide-react";
import "./Dashboard.css";

export const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get("/dashboard");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex-center" style={{ height: "100%" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">Failed to load dashboard data.</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="page-header">Dashboard Overview</h1>

      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
            <BarChart2 size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Tasks</p>
            <h2 className="stat-value">{data.totalTasks}</h2>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Completed</p>
            <h2 className="stat-value">{data.tasksByStatus["Done"] || 0}</h2>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">In Progress</p>
            <h2 className="stat-value">{data.tasksByStatus["In Progress"] || 0}</h2>
          </div>
        </div>

        <div className="stat-card card" style={{ borderColor: data.overdueTasks.length > 0 ? "rgba(239, 68, 68, 0.4)" : "" }}>
          <div className="stat-icon" style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#f87171" }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Overdue Tasks</p>
            <h2 className="stat-value" style={{ color: data.overdueTasks.length > 0 ? "#f87171" : "" }}>
              {data.overdueTasks.length}
            </h2>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-section card">
          <h3>Projects Summary</h3>
          <div className="projects-list">
            {data.projectSummary.length === 0 ? (
              <p className="text-muted">No projects found.</p>
            ) : (
              data.projectSummary.map((project: any) => (
                <div key={project.id} className="project-progress-item">
                  <div className="project-info">
                    <span className="project-title">{project.title}</span>
                    <span className="project-percentage">{project.completionPercentage}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${project.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="content-section card">
          <h3>Overdue Tasks</h3>
          <div className="tasks-list">
            {data.overdueTasks.length === 0 ? (
              <p className="text-muted">No overdue tasks! Great job.</p>
            ) : (
              data.overdueTasks.map((task: any) => (
                <div key={task.id} className="task-item overdue">
                  <div className="task-header">
                    <span className="task-title">{task.title}</span>
                    <span className="badge badge-todo">{task.status}</span>
                  </div>
                  <p className="task-due">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
        
        {data.tasksByUser && (
          <div className="content-section card" style={{ gridColumn: "1 / -1" }}>
            <h3>Team Workload (Admin View)</h3>
            <div className="workload-grid">
              {Object.entries(data.tasksByUser).map(([name, count]) => (
                <div key={name} className="workload-item glass-panel">
                  <span className="workload-name">{name}</span>
                  <span className="workload-count">{count as React.ReactNode} tasks</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
