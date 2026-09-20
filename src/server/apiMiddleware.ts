import { IncomingMessage, ServerResponse } from 'http';
import { 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject, 
  duplicateProject 
} from './projectsStorage';

// Helper to parse JSON body
function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body.trim()) {
        return resolve({});
      }
      try {
        const json = JSON.parse(body);
        resolve(json);
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', err => reject(err));
  });
}

// Helper to send JSON response
function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

// Vite Connect Middleware for /api/projects
export async function projectsApiMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const url = req.url || '';

  // Only handle /api/projects routes
  if (!url.startsWith('/api/projects')) {
    return next();
  }

  const cleanUrl = url.split('?')[0];
  const method = req.method?.toUpperCase();

  try {
    // 1. GET /api/projects
    if (cleanUrl === '/api/projects' && method === 'GET') {
      const projects = getAllProjects();
      return sendJson(res, 200, { success: true, data: projects });
    }

    // 2. POST /api/projects (Create new project)
    if (cleanUrl === '/api/projects' && method === 'POST') {
      const body = await parseJsonBody(req);
      const result = createProject(body);
      if (result.errors) {
        return sendJson(res, 400, { success: false, errors: result.errors });
      }
      return sendJson(res, 201, { success: true, data: result.project });
    }

    // Match /api/projects/:id and /api/projects/:id/duplicate
    const duplicateMatch = cleanUrl.match(/^\/api\/projects\/([^/]+)\/duplicate$/);
    if (duplicateMatch && method === 'POST') {
      const id = decodeURIComponent(duplicateMatch[1]);
      const result = duplicateProject(id);
      if (result.error) {
        return sendJson(res, 404, { success: false, error: result.error });
      }
      return sendJson(res, 201, { success: true, data: result.project });
    }

    const itemMatch = cleanUrl.match(/^\/api\/projects\/([^/]+)$/);
    if (itemMatch) {
      const id = decodeURIComponent(itemMatch[1]);

      // GET /api/projects/:id
      if (method === 'GET') {
        const project = getProjectById(id);
        if (!project) {
          return sendJson(res, 404, { success: false, error: 'Projet introuvable.' });
        }
        return sendJson(res, 200, { success: true, data: project });
      }

      // PUT /api/projects/:id (Update project)
      if (method === 'PUT' || method === 'PATCH') {
        const body = await parseJsonBody(req);
        const result = updateProject(id, body);
        if (result.errors) {
          return sendJson(res, 400, { success: false, errors: result.errors });
        }
        return sendJson(res, 200, { success: true, data: result.project });
      }

      // DELETE /api/projects/:id (Delete project)
      if (method === 'DELETE') {
        const success = deleteProject(id);
        if (!success) {
          return sendJson(res, 404, { success: false, error: 'Projet introuvable.' });
        }
        return sendJson(res, 200, { success: true, message: 'Projet supprimé avec succès.' });
      }
    }

    // Unmatched API endpoint
    return sendJson(res, 404, { success: false, error: 'Endpoint API introuvable.' });
  } catch (err: any) {
    console.error('[projectsApiMiddleware] Error processing request:', err);
    return sendJson(res, 500, { success: false, error: err?.message || 'Erreur interne du serveur' });
  }
}
