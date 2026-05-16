import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import { Plus, Users, CheckSquare } from "lucide-react";
import "./Projects.css";

export const Projects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await api.get("/projects");
      return res.data;
    },
  });

  const createProject = useMutation({
    mutationFn: async (newProject: { title: string; description: string }) => {
      const res = await api.post("/projects", newProject);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate({ title, description });
  };

  if (isLoading) {
    return (
      <div className="flex-center" style={{ height: "100%" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <div className="page-header-row">
        <h1 className="page-header" style={{ margin: 0 }}>Projects</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {projects?.length === 0 ? (
        <div className="empty-state card glass-panel">
          <FolderKanban size={48} className="text-muted" style={{ marginBottom: "1rem" }} />
          <h3>No projects yet</h3>
          <p className="text-muted">Create your first project to get started.</p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ marginTop: "1rem" }}>
            Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects?.map((project: any) => (
            <Link to={`/projects/${project.id}`} key={project.id} className="project-card card">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-desc">{project.description || "No description provided."}</p>
              
              <div className="project-meta">
                <div className="meta-item">
                  <CheckSquare size={16} />
                  <span>{project._count.tasks} Tasks</span>
                </div>
                <div className="meta-item">
                  <Users size={16} />
                  <span>{project._count.members} Members</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h2 style={{ marginBottom: "1.5rem" }}>Create New Project</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>Project Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Website Redesign"
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label>Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the project"
                  rows={3}
                ></textarea>
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createProject.isPending}>
                  {createProject.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Also import FolderKanban inside the component
import { FolderKanban } from "lucide-react";
