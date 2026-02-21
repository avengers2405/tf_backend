import { prisma } from "../db/index.js";

export const getPendingInvitations = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Fetch the receiver's registration_number using their user_id
        const receiverProfile = await prisma.student.findUnique({
            where: { user_id: userId },
            select: { registration_number: true }
        });

        if (!receiverProfile) {
            return res.status(404).json({ error: "Student profile not found." });
        }

        // 2. Fetch all pending invitations for this student
        const pendingInvitations = await prisma.group_Invitation.findMany({
            where: {
                receiver_id: receiverProfile.registration_number,
                status: "PENDING"
            },
            include: {
                // Include group details to show the group name
                group: {
                    select: {
                        group_id: true,
                        group_name: true
                    }
                },
                // Include sender details to show who sent the invite
                sender: {
                    select: {
                        registration_number: true,
                        first_name: true,
                        last_name: true,
                        primary_email: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc' // Newest invitations first
            }
        });

        res.status(200).json(pendingInvitations);

    } catch (error) {
        console.error("Error fetching pending invitations:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// 2. Send an Invitation
export const sendGroupInvitation = async (req, res) => {
    try {
        const { group_id, receiver_registration_number, sender_user_id } = req.body;
        console.log("Received invitation request:", { group_id, receiver_registration_number, sender_user_id });
        // 1. Validate incoming data
        if (!group_id || !receiver_registration_number || !sender_user_id) {
            return res.status(400).json({ error: "Missing required fields for invitation." });
        }

        // 2. Fetch the sender's registration_number using their user_id
        const senderProfile = await prisma.student.findUnique({
            where: { user_id: sender_user_id },
            select: { registration_number: true }
        });

        if (!senderProfile) {
            return res.status(404).json({ error: "Sender profile not found." });
        }

        const senderRegId = senderProfile.registration_number;

        // 4. Prevent sending duplicate pending invitations
        const existingInvitation = await prisma.group_Invitation.findFirst({
            where: {
                group_id: parseInt(group_id),
                receiver_id: receiver_registration_number,
                status: "PENDING"
            }
        });

        if (existingInvitation) {
            return res.status(400).json({ error: "A pending invitation already exists for this student for this group." });
        }

        // 5. Create the new pending invitation
        const newInvitation = await prisma.group_Invitation.create({
            data: {
                group_id: parseInt(group_id),
                sender_id: senderRegId,
                receiver_id: receiver_registration_number,
                status: "PENDING"
            }
        });

        console.log("Created new invitation:", newInvitation);
        res.status(201).json({ 
            message: "Invitation sent successfully.", 
            invitation: newInvitation 
        });

    } catch (error) {
        console.error("Error sending group invitation:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const acceptGroupInvitation = async (req, res) => {
    try {
        const { invitation_id } = req.body;
        console.log("Accepting invitation with ID:", invitation_id);
        if (!invitation_id) {
            return res.status(400).json({ error: "Invitation ID is required." });
        }

        // 1. Find the pending invitation
        console.log("Fetching invitation details for ID:", invitation_id);
        const invitation = await prisma.group_Invitation.findUnique({
            where: { id: parseInt(invitation_id) }
        });

        if (!invitation) {
            return res.status(404).json({ error: "Invitation not found." });
        }

        if (invitation.status !== "PENDING") {
            return res.status(400).json({ error: "Invitation has already been processed." });
        }

        // 2. Perform a transaction: Update invite status AND add student to group
        console.log("Updating invitation status and adding student to group in a transaction");
        await prisma.$transaction([
            prisma.group_Invitation.update({
                where: { id: parseInt(invitation_id) },
                data: { status: "ACCEPTED" }
            }),
            prisma.student_Group_Association.create({
                data: {
                    student_id: invitation.receiver_id,
                    group_id: invitation.group_id
                }
            })
        ]);

        // 3. Fetch the updated list of accepted team members to send back to the UI
        const groupMemberships = await prisma.student_Group_Association.findMany({
            where: { group_id: invitation.group_id },
            include: {
                student: {
                    select: {
                        first_name: true,
                        last_name: true,
                        primary_email: true
                    }
                }
            }
        });

        // Format the members for a cleaner frontend payload
        const membersList = groupMemberships.map(membership => membership.student);

        res.status(200).json({
            message: "Invitation accepted successfully.",
            group_id: invitation.group_id,
            members: membersList
        });

    } catch (error) {
        console.error("Error accepting invitation:", error);
        
        // Handle Prisma unique constraint violation (if they are somehow already in the group)
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "You are already a member of this team." });
        }
        
        res.status(500).json({ error: "Internal server error." });
    }
};

export const declineGroupInvitation = async (req, res) => {
    try {
        const { invitation_id } = req.body;

        if (!invitation_id) {
            return res.status(400).json({ error: "Invitation ID is required." });
        }

        // 1. Find the invitation
        const invitation = await prisma.group_Invitation.findUnique({
            where: { id: parseInt(invitation_id) }
        });

        if (!invitation || invitation.status !== "PENDING") {
            return res.status(400).json({ error: "Invalid or already processed invitation." });
        }

        // 2. Update status to REJECTED and fetch the details of who was involved
        const updatedInvitation = await prisma.group_Invitation.update({
            where: { id: parseInt(invitation_id) },
            data: { status: "REJECTED" },
            include: {
                sender: {
                    select: { primary_email: true, first_name: true }
                },
                receiver: {
                    select: { first_name: true, registration_number: true }
                },
                group: {
                    select: { group_name: true }
                }
            }
        });

        // 3. (OPTIONAL FUTURE STEP) Send an email to the sender here!
        // console.log(`Sending email to ${updatedInvitation.sender.primary_email}: ${updatedInvitation.receiver.first_name} declined your invite to ${updatedInvitation.group.group_name}`);

        res.status(200).json({ 
            message: "Invitation declined successfully.",
            student_id: updatedInvitation.receiver_id,
            // Include sender info for frontend notification
            sender: updatedInvitation.sender,
            receiver: updatedInvitation.receiver,
            group: updatedInvitation.group
        });

    } catch (error) {
        console.error("Error declining invitation:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const getSentInvitations = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Translate user_id to registration_number
        const senderProfile = await prisma.student.findUnique({
            where: { user_id: userId },
            select: { registration_number: true }
        });

        if (!senderProfile) {
            return res.status(404).json({ error: "Student profile not found." });
        }

        // 2. Fetch all invites SENT by this user
        const sentInvitations = await prisma.group_Invitation.findMany({
            where: {
                sender_id: senderProfile.registration_number ,
                status: "PENDING"
            },
            include: {
                group: {
                    select: { group_name: true }
                },
                receiver: {
                    select: { 
                        first_name: true, 
                        last_name: true,
                        registration_number: true 
                    }
                }
            },
            orderBy: {
                updated_at: 'desc' // Show the most recently updated ones first
            }
        });

        // 3. Return the array directly. 
        // If no invitations were sent, Prisma returns [], which is sent back as a 200 OK response.
        // It will not trigger the catch block.
        res.status(200).json(sentInvitations);

    } catch (error) {
        res.status(200).json({"message": "No sent invitations found for this user."});
    }
};