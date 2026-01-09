import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

/*
====================================================
IN-MEMORY SMART LOGBOOK (acts like vector store)
====================================================
*/

const logbookMemory = []; 
// Each entry:
// {
//   project,
//   author,
//   commitId,
//   message,
//   timestamp
// }

/*
====================================================
1️⃣ GIT WEBHOOK RECEIVER
====================================================
*/

app.post("/webhook/git", (req, res) => {
    const payload = req.body;

    if (!payload.commits || !payload.repository) {
        return res.status(400).send("Invalid payload");
    }

    payload.commits.forEach(commit => {
        const entry = {
            project: payload.repository.name,
            author: commit.author.name,
            commitId: commit.id,
            message: commit.message,
            timestamp: commit.timestamp
        };

        // Store in logbook memory
        logbookMemory.push(entry);

        // Trigger AI logbook chat
        triggerSmartAILogbook(entry);
    });

    res.status(200).send("Smart Logbook Updated");
});

/*
====================================================
2️⃣ SMART AI LOGBOOK TRIGGER
====================================================
*/

function triggerSmartAILogbook(newCommit) {
    console.log("\n📌 NEW COMMIT RECEIVED");
    console.log(newCommit);

    // Retrieve relevant context (RAG)
    const context = retrieveContext(newCommit.author);

    // Generate AI-style response
    const aiResponse = generateAIResponse(newCommit, context); 

    console.log("\n🤖 SMART AI LOGBOOK RESPONSE");
    console.log(aiResponse);
}

/*
====================================================
3️⃣ RETRIEVAL (RAG CORE)
====================================================
This simulates vector similarity by:
- same student
- same project
====================================================
*/

function retrieveContext(author) {
    return logbookMemory
        .filter(entry => entry.author === author)
        .slice(-5); // last 5 commits
}

/*
====================================================
4️⃣ GENERATION (LLM-LIKE LOGIC)
====================================================
*/

function generateAIResponse(newCommit, context) {
    let summary = `Student ${newCommit.author} made a new commit.\n`;
    summary += `Project: ${newCommit.project}\n`;
    summary += `Commit Message: "${newCommit.message}"\n\n`;

    if (context.length > 1) {
        summary += `📚 Recent Activity:\n`;

        context.forEach((c, index) => {
            summary += `${index + 1}. ${c.message}\n`;
        });

        summary += `\n📈 Progress Insight:\n`;
        summary += analyzeProgress(context);
    } else {
        summary += `🆕 This looks like the first commit. Project initialized.\n`;
    }

    return summary;
}

/*
====================================================
5️⃣ SIMPLE ANALYSIS LOGIC
====================================================
*/

function analyzeProgress(commits) {
    const keywords = commits.map(c => c.message.toLowerCase());

    if (keywords.some(k => k.includes("fix") || k.includes("bug"))) {
        return "Student is stabilizing or fixing issues.";
    }

    if (keywords.some(k => k.includes("feature") || k.includes("add"))) {
        return "Student is actively developing new features.";
    }

    if (commits.length >= 5) {
        return "Student shows consistent development progress.";
    }

    return "Progress is ongoing.";
}

/*
====================================================
6️⃣ OPTIONAL CHAT QUERY ENDPOINT (TEACHER)
====================================================
*/

app.get("/chat", (req, res) => {
    const { student } = req.query;

    if (!student) {
        return res.status(400).send("Student name required");
    }

    const context = retrieveContext(student);

    if (context.length === 0) {
        return res.send("No activity found for this student.");
    }

    const response = `
📘 Smart Logbook Summary for ${student}

Total Commits: ${context.length}
Recent Work:
${context.map(c => `- ${c.message}`).join("\n")}
`;

    res.send(response);
});

/*
====================================================
SERVER START
====================================================
*/

app.listen(PORT, () => {
    console.log(`🚀 Smart AI Logbook running on port ${PORT}`);
});
