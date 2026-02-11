import {prisma} from "../db/index.js"

const prisma_ = prisma;

export const getCommitsByProjectId = async (req, res) => {
    const { projectId } = req.params;
    const commits = await prisma_.git_logbook_entries.findMany({
      where: { project_id: projectId },
      orderBy: { commit_timestamp: 'desc' }
    });
    res.json({ success: true, data: commits });

}

export const getProjectDataByProjectId = async (req, res) => {
    const { projectId } = req.params;
    const projectData = await prisma_.Project.findUnique({
      where: { project_id: projectId },
    });
    res.json({ success: true, data: projectData });

}

export const getGroupData = async (req, res) => {
  const groupData = await prisma_.group.findFirst({
    where: {}
  })
}