const simpleGit = require('simple-git');
const cron = require('node-cron');
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const repoPath = path.join(__dirname, '');
const username = process.env.USER;
const token = process.env.TOKEN;
const GITNAME = process.env.GITNAME;

const git = simpleGit(repoPath);

// Initialize repository if it doesn't exist
const initializeRepo = async () => {
    try {
        if (!fs.existsSync(path.join(repoPath, '.git'))) {
            console.log('Initializing Git repository...');
            await git.init();
        }
    } catch (error) {
        console.error('Error initializing repository:', error);
        throw error;
    }
};

const appendToFile = async () => {
    try {
        await git.raw(['config', 'user.name', 'Gulshanverma7878']);
        await git.raw(['config', 'user.email', 'gamerronak9@gmail.com']);
        const filePath = path.join(repoPath, 'file.txt');
        const date = new Date().toISOString();
        const content = `Update Code test on ${date}\n`;

        fs.appendFileSync(filePath, content, 'utf8');
        console.log('Content appended to file.txt');
    } catch (error) {
        console.error('Error in appendToFile:', error);
        throw error;
    }
};

const setupRemote = async () => {
    try {
        const remote = `https://${username}:${token}@github.com/${username}/${GITNAME}`;
        console.log('Setting up remote with URL:', remote.replace(token, '****'));

        // Remove existing remote if it exists
        await git.removeRemote('origin').catch(() => {
            console.log('No existing remote to remove');
        });

        // Add new remote
        await git.addRemote('origin', remote);
        console.log('Remote "origin" configured successfully');
    } catch (error) {
        console.error('Error setting up remote:', error);
        throw error;
    }
};

const automateGitPush = async () => {
    try {
        // Verify environment variables
        if (!username || !token || !GITNAME) {
            throw new Error('Missing required environment variables');
        }

        console.log('Debug - Environment variables:');
        console.log('Username exists:', !!username);
        console.log('Token exists:', !!token);
        console.log('GITNAME exists:', !!GITNAME);

        // Initialize repository if needed
        await initializeRepo();

        // Set up remote repository
        await setupRemote();

        // Append content to file
        await appendToFile();

        // Check git status before operations
        const statusBefore = await git.status();//your code
        console.log('Git status before operations:', statusBefore);

        // Add changes
        await git.add('.');
        console.log('Files added to staging area');

        // Commit changes
        const commitMessage = `code update - ${new Date().toISOString()}`;
        await git.commit(commitMessage);
        console.log('Changes committed');

        // Push changes
        const pushResult = await git.push(['-u', 'origin', 'main']);
        console.log('Push completed:', pushResult);

        return 'Git operations completed successfully';
    } catch (error) {
        console.error('Error during Git operations:', error);
        throw error;//
    }
};

// Express route
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Manual trigger route
app.post('/trigger-push', async (req, res) => {
    try {
        await automateGitPush();
        res.status(200).json({ message: 'Git push triggered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Initial test
(async () => {
    try {
        console.log('Running initial test...');
        const remotes = await git.getRemotes(true);
        console.log('Configured remotes:', remotes);
        //
        await automateGitPush();
        console.log('Initial test completed successfully');
    } catch (error) {
        console.error('Initial test failed:', error);
    }
})();

// Schedule cron job
cron.schedule('*/2 * * * *', () => {
    console.log('Running scheduled Git push...');
    automateGitPush()
        .then(() => console.log('Scheduled push completed successfully'))
        .catch(error => console.error('Scheduled push failed:', error));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

///

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

////