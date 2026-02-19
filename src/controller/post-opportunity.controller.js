import { prisma } from "../db/index.js";

async function generateProjectId() {
  const lastProject = await prisma.project.findFirst({
    orderBy: { project_id: "desc" },
  });

  if (!lastProject) return "PRO001";

  const lastNumber = parseInt(lastProject.project_id.replace("PRO", ""));
  const newNumber = lastNumber + 1;

  return `PRO${newNumber.toString().padStart(3, "0")}`;
}

export const projectController = {
  
  createProject: async (req, res) => {
  try {
    const { 
      title, 
      description, 
      skills,           // Array of skills from the form
      years,            // Array of numbers from the form
      repo_url, 
      user_id 
    } = req.body;

    if (!title || !description || !user_id) {
      return res.status(400).json({ error: "Title, description, and user identity are required." });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { user_id: user_id }
    });

    if (!teacher) {
      return res.status(403).json({ error: "Only registered teachers can post projects." });
    }

    // 3. Handle Academic Year Defaulting
    // Determine the default year (e.g., 2024-25) or a string based on user input
    const currentYear = new Date().getFullYear();
    const defaultAcademicYear = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
    
    // If the frontend sent years (e.g. [3, 4]), format them; otherwise, use the default
    const formattedAcademicYear = (years && years.length > 0)
      ? years.map(y => `${y}th Year`).join(", ")
      : defaultAcademicYear;

    // 4. Handle Technology Stack
    // Converts the skills array from the form into a string for the DB
    const technologyStack = Array.isArray(skills) && skills.length > 0 
      ? skills.join(", ") 
      : "Not specified";

    // 5. Generate ID and Save
    const customId = await generateProjectId();

    const newProject = await prisma.project.create({
      data: {
        project_id: customId,
        title,
        description,
        technology_stack: technologyStack,
        academic_year: formattedAcademicYear, // Uses the derived or default year
        repo_url: repo_url || null,           // Students can add this later
        supervisor: {
          connect: { id: teacher.id }
        }
      },
      include: {
        supervisor: true
      }
    });

    return res.status(201).json({
      message: "Project opportunity posted successfully",
      project: newProject,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({ error: error.message });
  }
},

  getAllProjects: async (req, res) => {
    try {
      const projects = await prisma.project.findMany({
        include: {
          // Include Supervisor (TeacherRole) and the nested Teacher profile
          supervisor: {
            include: {
              teacher: true,
              role: true
            }
          },
          phases: true,
          groups: {
            include: {
              group: true,
            },
          },
        },
        orderBy: {
          academic_year: 'desc',
        },
      });

      return res.status(200).json(projects);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getProjectById: async (req, res) => {
    try {
      const { id } = req.params;

      const project = await prisma.project.findUnique({
        where: { project_id: id },
        include: {
          // Include detailed supervisor info
          supervisor: {
            include: {
              teacher: {
                select: {
                  first_name: true,
                  last_name: true,
                  email: true,
                  department: true
                }
              },
              role: true
            }
          },
          phases: true,
          git_logs: true,
          groups: {
            include: {
              group: {
                include: {
                  students: {
                    include: {
                      student: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      return res.status(200).json(project);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};