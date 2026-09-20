import { Project, ProjectFormData } from '../types';

const LOCAL_STORAGE_KEY = 'cineflow_projects_cache';

// Helper to get cached projects from localStorage
function getLocalCache(): Project[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Helper to update localStorage cache
function setLocalCache(projects: Project[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('[ProjectsApi] Failed to write localStorage cache', e);
  }
}

export const projectsApi = {
  // 1. Fetch all projects
  async getAll(): Promise<Project[]> {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setLocalCache(json.data);
          return json.data;
        }
      }
    } catch (err) {
      console.warn('[ProjectsApi] Fetch failed, using local cache fallback', err);
    }

    // Fallback to localStorage cache
    return getLocalCache();
  },

  // 2. Fetch single project by ID
  async getById(id: string): Promise<Project | null> {
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(id)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('[ProjectsApi] Fetch by ID failed, trying local cache', err);
    }

    const cached = getLocalCache();
    return cached.find(p => p.id === id) || null;
  },

  // 3. Create a new project
  async create(data: ProjectFormData): Promise<Project> {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        const errorMsg = json.errors?.map((e: any) => e.message).join(', ') || json.error || 'Erreur lors de la création';
        throw new Error(errorMsg);
      }

      // Update cache
      const cached = getLocalCache();
      const updated = [json.data, ...cached.filter(p => p.id !== json.data.id)];
      setLocalCache(updated);

      return json.data;
    } catch (err: any) {
      // Local fallback creation if network unavailable
      console.warn('[ProjectsApi] API create failed, creating locally', err);
      const now = new Date().toISOString();
      const localProject: Project = {
        id: 'proj-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
        title: data.title.trim(),
        description: (data.description || '').trim(),
        contentType: data.contentType,
        format: data.format,
        language: data.language,
        visualStyleId: data.visualStyleId || 'cinematic-35mm',
        status: 'draft',
        createdAt: now,
        updatedAt: now
      };

      const cached = getLocalCache();
      setLocalCache([localProject, ...cached]);
      return localProject;
    }
  },

  // 4. Update an existing project
  async update(id: string, updates: Partial<Project>): Promise<Project> {
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        const errorMsg = json.errors?.map((e: any) => e.message).join(', ') || json.error || 'Erreur lors de la mise à jour';
        throw new Error(errorMsg);
      }

      // Update cache
      const cached = getLocalCache();
      const updated = cached.map(p => (p.id === id ? json.data : p));
      setLocalCache(updated);

      return json.data;
    } catch (err: any) {
      console.warn('[ProjectsApi] API update failed, updating locally', err);
      const cached = getLocalCache();
      const now = new Date().toISOString();
      const existing = cached.find(p => p.id === id);
      if (!existing) {
        throw new Error('Projet introuvable dans le cache');
      }

      const updatedProject: Project = {
        ...existing,
        ...updates,
        id,
        updatedAt: now
      };

      const updated = cached.map(p => (p.id === id ? updatedProject : p));
      setLocalCache(updated);
      return updatedProject;
    }
  },

  // 5. Delete a project
  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const cached = getLocalCache();
        setLocalCache(cached.filter(p => p.id !== id));
        return true;
      }
    } catch (err) {
      console.warn('[ProjectsApi] API delete failed, deleting locally', err);
    }

    const cached = getLocalCache();
    setLocalCache(cached.filter(p => p.id !== id));
    return true;
  },

  // 6. Duplicate a project
  async duplicate(id: string): Promise<Project> {
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(id)}/duplicate`, {
        method: 'POST'
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erreur lors de la duplication');
      }

      const cached = getLocalCache();
      setLocalCache([json.data, ...cached]);
      return json.data;
    } catch (err: any) {
      console.warn('[ProjectsApi] API duplicate failed, duplicating locally', err);
      const cached = getLocalCache();
      const original = cached.find(p => p.id === id);
      if (!original) {
        throw new Error('Projet source introuvable');
      }

      const now = new Date().toISOString();
      const duplicateProject: Project = {
        ...original,
        id: 'proj-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
        title: `${original.title} (Copie)`,
        status: 'draft',
        createdAt: now,
        updatedAt: now
      };

      setLocalCache([duplicateProject, ...cached]);
      return duplicateProject;
    }
  }
};
