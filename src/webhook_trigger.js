import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3000;

import crypto from "crypto";

const verifyGitHubSignature = (req, res, buf) => {
    const signature = req.headers["x-hub-signature-256"];
    if (!signature) throw new Error("Missing signature");


    const hmac = crypto.createHmac("sha256", process.env.GITHUB_SECRET);
    const digest = "sha256=" + hmac.update(buf).digest("hex");

    if (signature !== digest) {
        throw new Error("Invalid GitHub webhook signature");
    }
    console.log("GitHub webhook signature verified");
};

app.use(express.json({
    verify: verifyGitHubSignature
}));

const logbookMemory = []; 

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


app.post("/webhook/git", async (req, res) => {
    const payload = req.body;
    console.log("Received webhook payload:", payload);
    if (!payload.commits || !payload.repository) {
        return res.status(400).send("Invalid payload");
    }

    const repoName = payload.repository.name;
    const owner = payload.repository.owner.name || payload.repository.owner.login;

    for (const commit of payload.commits) {

        console.log("Commit file Details:", commit.added.length, commit.modified.length, commit.removed.length);
        const files_changed =
            commit.added.length +
            commit.modified.length +
            commit.removed.length;

        const { additions, deletions } = await getCommitStats(
            owner,
            repoName,
            commit.id
        );

        const difficulty_of_commit = calculateDifficulty(
            additions,
            deletions,
            files_changed
        );

        const entry = {
            project_id: extractProjectId(commit.message),
            commit_id: commit.id,
            commit_message: commit.message,
            files_changed,
            additions,
            deletions,
            difficulty_of_commit,
            commit_timestamp: commit.timestamp,
            received_at: new Date()
        };

        // Store in logbook memory
        logbookMemory.push(entry);
        console.log("\nLogbook Entry Added:", entry);

        // Trigger AI logbook chat
        //triggerSmartAILogbook(entry);
    }

    res.status(200).send("Smart Logbook Updated");});

// function triggerSmartAILogbook(newCommit) {
//     console.log("\n📌 NEW COMMIT RECEIVED");
//     console.log(newCommit);

//     // Retrieve relevant context (RAG)
//     const context = retrieveContext(newCommit.author);

//     // Generate AI-style response
//     const aiResponse = generateAIResponse(newCommit, context); 

//     console.log("\n🤖 SMART AI LOGBOOK RESPONSE: ");
//     console.log(aiResponse);
// }



// function retrieveContext(author) {
//     return logbookMemory
//         .filter(entry => entry.author === author)
//         .slice(-5); // last 5 commits
// }



// function generateAIResponse(newCommit, context) {
//     let summary = `Student ${newCommit.author} made a new commit.\n`;
//     summary += `Project: ${newCommit.project}\n`;
//     summary += `Commit Message: "${newCommit.message}"\n\n`;

//     if (context.length > 1) {
//         summary += `📚 Recent Activity:\n`;

//         context.forEach((c, index) => {
//             summary += `${index + 1}. ${c.message}\n`;
//         });

//         summary += `\n📈 Progress Insight:\n`;
//         summary += analyzeProgress(context);
//     } else {
//         summary += `🆕 This looks like the first commit. Project initialized.\n`;
//     }

//     return summary;
// }


// function analyzeProgress(commits) {
//     const keywords = commits.map(c => c.message.toLowerCase());

//     if (keywords.some(k => k.includes("fix") || k.includes("bug"))) {
//         return "Student is stabilizing or fixing issues.";
//     }

//     if (keywords.some(k => k.includes("feature") || k.includes("add"))) {
//         return "Student is actively developing new features.";
//     }

//     if (commits.length >= 5) {
//         return "Student shows consistent development progress.";
//     }

//     return "Progress is ongoing.";
// }

app.listen(PORT, () => {
    console.log(`🚀 Smart AI Logbook running on port ${PORT}`);
});
