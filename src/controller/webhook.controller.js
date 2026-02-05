import {prisma} from "../db/index.js"

const prisma_ = prisma;
// Extract project_id from commit message
// Example: [PROJECT:101] Added login
function extractProjectId(message) {
    const match = message.match(/\[PROJECT:(.*?)\]/);
    return match ? match[1] : null;
}

// Difficulty calculation
function calculateDifficulty(additions, deletions, filesChanged) {
    const score = additions + deletions + filesChanged * 5;

    if (score < 20) return 0; // easy
    if (score < 100) return 1; // medium
    return 2; // hard
}

async function getCommitStats(owner, repo, commitSha) {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json"
        }
    });

    const data = await response.json();

    return {
        additions: data.stats?.additions || 0,
        deletions: data.stats?.deletions || 0
    };
}

export const handleGitHubWebhook = async (req, res) => {
    const payload = req.body;
    console.log("Received webhook payload:", payload);
    if (!payload.commits || !payload.repository) {
        return res.status(400).send("Invalid payload");
    }
    const repoName = payload.repository.name;
    const owner = payload.repository.owner.name || payload.repository.owner.login;

    try {
        // Map commits to an array of Promises
        console.log("Creating Promise for each commit...");
        const commitPromises = payload.commits.map(async (commit) => {
            const project_id = extractProjectId(commit.message);
            
            if (!project_id) {
                console.log(`Skipping commit ${commit.id}: No Project ID tag found.`);
                return null; 
            }

            const files_changed = commit.added.length + commit.modified.length + commit.removed.length;
            
            const { additions, deletions } = await getCommitStats(owner, repoName, commit.id);
            
            const difficulty = calculateDifficulty(additions, deletions, files_changed);

            return prisma_.git_logbook_entries.upsert({
                where: { commit_id: commit.id },
                update: {},
                create: {
                    project_id: project_id,
                    commit_id: commit.id,
                    commit_message: commit.message,
                    files_changed,
                    difficulty_of_commit: difficulty,
                    commit_timestamp: new Date(commit.timestamp),
                },
            });
        });

        // Execute all database operations concurrently
        const results = await Promise.all(commitPromises);
        
        // Filter out the nulls from skipped commits for the log
        const successfulEntries = results.filter(entry => entry !== null);
        
        console.log(`Successfully processed ${successfulEntries.length} commits.`);
        res.status(200).send(`Smart Logbook Updated: ${successfulEntries.length} entries added/verified.`);

    } catch (err) {
        console.error("Critical Webhook Error:", err);
        // It's often better to send 200 even on error so GitHub doesn't retry failed logic,
        // but 500 is standard for debugging.
        res.status(500).send("Internal Server Error during processing");
    }
}
// async function checkInconsistency(newEntry, projectId) {
//     // 1. Get average commits for this project from your DB/RAG
//     const history = logbookMemory.filter(e => e.project_id === projectId);
    
//     if (history.length < 3) return null; // Not enough data for a baseline

//     const avgAdditions = history.reduce((sum, e) => sum + e.additions, 0) / history.length;
//     const lastCommitDate = new Date(history[history.length - 1].received_at);
//     const timeGapDays = (new Date() - lastCommitDate) / (1000 * 60 * 60 * 24);

//     let flagReason = null;

//     // Logic: Sudden Massive Code Push after silence
//     if (timeGapDays > 7 && newEntry.additions > (avgAdditions * 5)) {
//         flagReason = "SUSPICIOUS_DUMP: Large code volume after 7+ days of inactivity.";
//     }

//     // Logic: Significant outlier in difficulty
//     if (newEntry.difficulty_of_commit > 1 && avgAdditions < 20) {
//         flagReason = "UNUSUAL_COMPLEXITY: Commit is significantly harder than group average.";
//     }

//     return flagReason;
// }

// // Inside your app.post("/webhook/git")
// const flag = await checkInconsistency(entry, entry.project_id);
// if (flag) {
//     // Store flag in a 'notifications' table for the teacher
//     console.warn(`[FLAG RAISED] Group ${entry.project_id}: ${flag}`);
    
//     // Optionally: Send a message into the chat as the AI Bot
//     // await sendAiMessage(entry.project_id, `Note: I've noticed a large update. Let's discuss the progress in our next meeting.`);
// }

//work this through later. 
// const authorizeChatAccess = (req, res, next) => {
//     const { userRole, userGroupId, managedGroups } = req.user; // From your Auth JWT
//     const { chatId } = req.params; 

//     if (userRole === "student") {
//         if (chatId !== userGroupId) return res.status(403).send("Unauthorized");
//     } else if (userRole === "teacher") {
//         if (!managedGroups.includes(chatId)) return res.status(403).send("Unauthorized");
//     }
//     next();
// };