import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaDownload, FaFolder, FaFile, FaHtml5, FaJs, FaCss3 } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

interface Project {
  id: string;
  title: string;
  createdAt: string;
}

interface ProjectFile {
  name: string;
  path: string;
  type: string;
  size: number;
}

interface LocalProjectsProps {
  html: string;
  setHtml: (html: string) => void;
  onClose: () => void;
}

function LocalProjects({ html, setHtml, onClose }: LocalProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [view, setView] = useState<"list" | "files">("list");

  // Cargar proyectos al montar el componente
  useEffect(() => {
    fetchProjects();
  }, []);

  // Cargar archivos cuando se selecciona un proyecto
  useEffect(() => {
    if (selectedProject) {
      fetchProjectFiles(selectedProject);
    }
  }, [selectedProject]);

  // Obtener la lista de proyectos
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/local-projects");
      const data = await response.json();
      
      if (data.ok) {
        setProjects(data.projects);
      } else {
        toast.error(data.message || "Error al cargar proyectos");
      }
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
      toast.error("Error al cargar proyectos");
    } finally {
      setLoading(false);
    }
  };

  // Obtener los archivos de un proyecto
  const fetchProjectFiles = async (projectId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/local-projects/${projectId}/files`);
      const data = await response.json();
      
      if (data.ok) {
        setProjectFiles(data.files);
        setView("files");
      } else {
        toast.error(data.message || "Error al cargar archivos");
      }
    } catch (error) {
      console.error("Error al cargar archivos:", error);
      toast.error("Error al cargar archivos");
    } finally {
      setLoading(false);
    }
  };

  // Cargar un proyecto en el editor
  const loadProject = async (projectId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/local-projects/${projectId}`);
      const data = await response.json();
      
      if (data.ok && data.project) {
        setHtml(data.project.html);
        toast.success("Proyecto cargado con éxito");
        onClose();
      } else {
        toast.error(data.message || "Error al cargar el proyecto");
      }
    } catch (error) {
      console.error("Error al cargar el proyecto:", error);
      toast.error("Error al cargar el proyecto");
    } finally {
      setLoading(false);
    }
  };

  // Guardar el proyecto actual
  const saveProject = async () => {
    if (!saveTitle.trim()) {
      toast.error("Por favor, ingresa un título para el proyecto");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/save-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html,
          title: saveTitle,
        }),
      });
      
      const data = await response.json();
      
      if (data.ok) {
        toast.success("Proyecto guardado con éxito");
        setSaveTitle("");
        fetchProjects();
        setView("list");
      } else {
        toast.error(data.message || "Error al guardar el proyecto");
      }
    } catch (error) {
      console.error("Error al guardar el proyecto:", error);
      toast.error("Error al guardar el proyecto");
    } finally {
      setLoading(false);
    }
  };

  // Obtener el icono adecuado para el tipo de archivo
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "html":
        return <FaHtml5 className="text-orange-500" />;
      case "js":
      case "javascript":
        return <FaJs className="text-yellow-500" />;
      case "css":
        return <FaCss3 className="text-blue-500" />;
      default:
        return <FaFile className="text-gray-500" />;
    }
  };

  // Formatear el tamaño del archivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {view === "list" ? "Proyectos Locales" : "Archivos del Proyecto"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {view === "list" ? (
            <>
              {/* Formulario para guardar proyecto */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Guardar proyecto actual</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                    placeholder="Título del proyecto"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={saveProject}
                    disabled={loading || !saveTitle.trim()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Guardar
                  </button>
                </div>
              </div>

              {/* Lista de proyectos */}
              <h3 className="text-lg font-medium text-gray-700 mb-2">Proyectos guardados</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando proyectos...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay proyectos guardados
                </div>
              ) : (
                <div className="grid gap-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">{project.title}</h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(project.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadProject(project.id)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Cargar en editor"
                          >
                            Cargar
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProject(project.id);
                            }}
                            className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                            title="Ver archivos"
                          >
                            <FaFolder /> Archivos
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Vista de archivos */}
              <button
                onClick={() => setView("list")}
                className="mb-4 text-blue-500 hover:text-blue-700 flex items-center gap-1"
              >
                ← Volver a la lista de proyectos
              </button>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando archivos...</p>
                </div>
              ) : projectFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay archivos en este proyecto
                </div>
              ) : (
                <div className="grid gap-2">
                  {projectFiles.map((file) => (
                    <div
                      key={file.name}
                      className="border rounded-lg p-3 hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.type)}
                        <div>
                          <h4 className="font-medium text-gray-800">{file.name}</h4>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={file.path}
                        download
                        className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                        title="Descargar archivo"
                      >
                        <FaDownload /> Descargar
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LocalProjects;
