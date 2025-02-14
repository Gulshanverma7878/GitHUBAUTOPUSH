const simpleGit = require('simple-git');
const cron = require('node-cron');
const express= require('express');
const app=express();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const repoPath = path.join(__dirname, '');
const username = process.env.USER;
const token = process.env.TOKEN;
const GITNAME = process.env.GITNAME;

const git = simpleGit(repoPath);

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

app.get('/',(req,res)=>{
    res.send('hello')
});


const automateGitPush = async () => {
    try {
        // Debug: Print environment variables (sanitized)
        console.log('Debug - Environment variables:');
        console.log('Username exists:', !!username);
        console.log('Token exists:', !!token);
        console.log('GITNAME exists:', !!GITNAME);
        
        await appendToFile();
        
        // Debug: Check git status before add
        const statusBefore = await git.status();
        console.log('Git status before add:', statusBefore);
        
        await git.add('.');
        console.log('Files added to staging area.');
        
        const commitMessage = `code update  - ${new Date().toISOString()}`;
        await git.commit(commitMessage);
        console.log('Changes committed.');

        // Debug: Check git status after commit
        const statusAfter = await git.status();
        console.log('Git status after commit:', statusAfter);

        // Use more detailed error handling for push
        try {
            const remote = `https://${username}:${token}@github.com/${username}/${GITNAME}`;
            console.log('Pushing to remote:', remote.replace(token, '****'));
            
            const pushResult = await git.push('origin', 'main', ['--verbose']);
            console.log('Push result:', pushResult);
            console.log('Changes pushed to GitHub.');
        } catch (pushError) {
            console.error('Detailed push error:', pushError);
            throw pushError;
        }
    } catch (error) {
        console.error('Error during Git operations:', error);
        throw error;
    }
};


(async () => {
    try {
        const remotes = await git.getRemotes(true);
        console.log('Configured remotes:', remotes);
        
        await automateGitPush();
    } catch (error) {
        console.error('Initial test failed:', error);
    }
})();

cron.schedule('*/2 * * * *', () => {
    automateGitPush().catch(error => {
        console.error('Cron job execution failed:', error);
    });
});


app.listen(3000, () => {
    console.log('Server started on port 3000');
});