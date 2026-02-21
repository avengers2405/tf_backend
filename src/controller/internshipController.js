import { prisma } from "../db/index.js";

// Get all internships
export const getAllInternships = async (req, res) => {
  try {
    const internships = await prisma.internship.findMany({
      orderBy: { posted_date: "desc" },
      include: {
        postedBy: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            company_name: true,
          },
        },
      },
    })

    res.status(200).json(internships)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to fetch internships" })
  }
}

// Get internship by ID
export const getInternshipById = async (req, res) => {
  const { id } = req.params

  try {
    const internship = await prisma.internship.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            company_name: true,
            email: true,
          },
        },
      },
    })

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" })
    }

    res.status(200).json(internship)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to fetch internship" })
  }
}

// Post internship
export const createInternship = async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      stipend,
      duration,
      skills,
      tags,
      min_cgpa,
      departments,
      years,
      deadline,
      posted_by,
    } = req.body

    if (!title || !company || !description || !deadline || !posted_by) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const internship = await prisma.internship.create({
      data: {
        title,
        company,
        description,
        stipend,
        duration,
        skills,
        tags,
        min_cgpa,
        departments,
        years,
        deadline: new Date(deadline),
        posted_by,
      },
    })

    res.status(201).json({
      message: "Internship created successfully",
      internship,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to create internship" })
  }
}