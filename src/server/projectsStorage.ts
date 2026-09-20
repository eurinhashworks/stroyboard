import fs from 'fs';
import path from 'path';
import { Project, ProjectFormData, ContentType, AspectRatio, ProjectLanguage } from '../types';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'projects.json');

// Helper to ensure data directory and file exist
function ensureDb(): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('[ProjectsStorage] Error ensuring DB file:', err);
  }
}

// Read all projects
export function getAllProjects(): Project[] {
  ensureDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as Project[];
  } catch (err) {
    console.error('[ProjectsStorage] Error reading projects:', err);
    return [];
  }
}

// Write all projects
export function saveAllProjects(projects: Project[]): boolean {
  ensureDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(projects, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[ProjectsStorage] Error writing projects:', err);
    return false;
  }
}

// Find single project
export function getProjectById(id: string): Project | null {
  const projects = getAllProjects();
  return projects.find(p => p.id === id) || null;
}

// Validation rules
export interface ValidationError {
  field: string;
  message: string;
}

const VALID_CONTENT_TYPES: ContentType[] = [
  'court-metrage',
  'storytelling',
  'tiktok',
  'instagram-reel',
  'youtube-short',
  'publicite',
  'documentaire',
  'histoire-enfants',
  'clip-musical'
];

const VALID_FORMATS: AspectRatio[] = ['9:16', '16:9', '1:1'];

const VALID_LANGUAGES: ProjectLanguage[] = ['fr', 'en', 'es', 'de', 'it', 'ja', 'pt', 'ar'];

export function validateProjectData(data: Partial<ProjectFormData>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Le titre du projet est obligatoire.' });
  } else if (data.title.trim().length > 120) {
    errors.push({ field: 'title', message: 'Le titre ne doit pas dépasser 120 caractères.' });
  }

  if (data.description && typeof data.description === 'string' && data.description.length > 2000) {
    errors.push({ field: 'description', message: 'La description ne doit pas dépasser 2000 caractères.' });
  }

  if (data.contentType && !VALID_CONTENT_TYPES.includes(data.contentType as ContentType)) {
    errors.push({ field: 'contentType', message: 'Le type de contenu sélectionné est invalide.' });
  }

  if (data.format && !VALID_FORMATS.includes(data.format as AspectRatio)) {
    errors.push({ field: 'format', message: 'Le format vidéo sélectionné est invalide (9:16, 16:9, 1:1).' });
  }

  if (data.language && !VALID_LANGUAGES.includes(data.language as ProjectLanguage)) {
    errors.push({ field: 'language', message: 'La langue sélectionnée est invalide.' });
  }

  return errors;
}

// Create project
export function createProject(data: ProjectFormData): { project?: Project; errors?: ValidationError[] } {
  const errors = validateProjectData(data);
  if (errors.length > 0) {
    return { errors };
  }

  const projects = getAllProjects();
  const now = new Date().toISOString();
  const id = 'proj-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);

  const newProject: Project = {
    id,
    title: data.title.trim(),
    description: (data.description || '').trim(),
    contentType: data.contentType,
    format: data.format,
    language: data.language,
    visualStyleId: data.visualStyleId || 'cinematic-35mm',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };

  projects.unshift(newProject);
  saveAllProjects(projects);

  return { project: newProject };
}

// Update project
export function updateProject(id: string, updates: Partial<Project>): { project?: Project; errors?: ValidationError[] } {
  const projects = getAllProjects();
  const index = projects.findIndex(p => p.id === id);

  if (index === -1) {
    return { errors: [{ field: 'id', message: 'Projet introuvable.' }] };
  }

  // Validate fields if updating form data
  const formValidation = validateProjectData({
    title: updates.title ?? projects[index].title,
    description: updates.description ?? projects[index].description,
    contentType: updates.contentType ?? projects[index].contentType,
    format: updates.format ?? projects[index].format,
    language: updates.language ?? projects[index].language,
  });

  if (formValidation.length > 0) {
    return { errors: formValidation };
  }

  const now = new Date().toISOString();
  const updatedProject: Project = {
    ...projects[index],
    ...updates,
    id, // protect ID
    createdAt: projects[index].createdAt, // protect creation date
    updatedAt: now,
  };

  projects[index] = updatedProject;
  saveAllProjects(projects);

  return { project: updatedProject };
}

// Delete project
export function deleteProject(id: string): boolean {
  const projects = getAllProjects();
  const filtered = projects.filter(p => p.id !== id);

  if (filtered.length === projects.length) {
    return false; // not found
  }

  return saveAllProjects(filtered);
}

// Duplicate project
export function duplicateProject(id: string): { project?: Project; error?: string } {
  const original = getProjectById(id);
  if (!original) {
    return { error: 'Projet source introuvable.' };
  }

  const projects = getAllProjects();
  const now = new Date().toISOString();
  const newId = 'proj-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);

  // Deep clone storyboard scenes if any with new IDs
  let clonedStoryboard = undefined;
  if (original.storyboard) {
    clonedStoryboard = {
      ...original.storyboard,
      scenes: original.storyboard.scenes.map(sc => ({
        ...sc,
        id: 'sc-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6)
      }))
    };
  }

  const clonedProject: Project = {
    ...original,
    id: newId,
    title: `${original.title} (Copie)`,
    status: 'draft',
    storyboard: clonedStoryboard,
    createdAt: now,
    updatedAt: now
  };

  projects.unshift(clonedProject);
  saveAllProjects(projects);

  return { project: clonedProject };
}
