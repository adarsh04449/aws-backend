const { v4: uuidv4 } = require('uuid');
const fs = require("fs").promises;
const path = require("path");

async function commitRepo(message) {
    const repoPath = path.resolve(process.cwd(), ".hidden");
    const stagingPath = path.join(repoPath, "staging");
    const commitPath = path.join(repoPath, "commits");

    try {
        const commitId = uuidv4();
        const newCommitFolder = path.join(commitPath, commitId);
        await fs.mkdir(newCommitFolder, { recursive: true });

        const stagedFiles = await fs.readdir(stagingPath);

        for (const file of stagedFiles) {
            const src = path.join(stagingPath, file);
            const dest = path.join(newCommitFolder, file);
            await fs.copyFile(src, dest);
        }

        await fs.writeFile(path.join(newCommitFolder, "commit.json"), JSON.stringify({
            message,
            date: new Date().toISOString(),
        }))

        console.log(`Commit ${commitId} created with message: ${message}`)
    } catch (err) {
        console.error("Error commiting files", err);
    }
}

module.exports = { commitRepo };