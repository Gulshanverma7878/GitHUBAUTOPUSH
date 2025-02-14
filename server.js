const simpleGit = require('simple-git');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
require('dotenv').config();


const repoPath = process.env.RPATH; 

const username = process.env.USER; 
const token = process.env.TOKEN;
const GITNAME= process.env.GITNAME;

const git = simpleGit(repoPath);
const appendToFile = () => {
    const filePath = path.join(repoPath, 'file.txt');
    const date = new Date().toISOString();
    const content = `Update Code test on ${date}\n`;

    fs.appendFileSync(filePath, content, 'utf8');
    console.log('Content appended to file.txt');
};
const automateGitPush = async () => {
    try {
        appendToFile();
        await git.add('.');
        console.log('Files added to staging area.');
        const commitMessage = `code update  - ${new Date().toISOString()}`;
        await git.commit(commitMessage);
        console.log('Changes committed.');

        await git.push(`https://${username}:${token}@github.com/${username}/${GITNAME}`, 'main');
        console.log('Changes pushed to GitHub.');
    } catch (error) {
        console.error('Error during Git operations:', error);
    }
};



cron.schedule('*/5 * * * *', () => { 
    automateGitPush();
});

automateGitPush();
