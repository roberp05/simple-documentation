const { Octokit } = require("@octokit/rest");
const fs = require("fs");
var DateDiff = require('diff-dates');

const octokit = new Octokit({
    auth: process.env.GH_PAT,
  });
  

const get_readmes = async (repo) => {
    await octokit.request(`GET /repos/{owner}/{repo}/readme`, {
        owner: 'bbc',
        repo: repo
      }).then(async (data) => {
        let buff = new Buffer.from(data.data.content, 'base64');
        if(!fs.existsSync('../docs/repositories/')){
            fs.mkdirSync('../docs/repositories/');
            fs.writeFileSync(`../docs/repositories/index.md`, '');
        }
        fs.writeFileSync(`../docs/repositories/${repo}.md`, buff.toString());
        return true;
      }).catch(error => {
        console.log(`${repo} : ${error.response.status}`)
        return false;
      });
};

const getTeamRepositories = async (teamname) => {
    if(!fs.existsSync('../docs/repositories/')){
        fs.mkdirSync('../docs/repositories/');
    }
    if(!fs.existsSync('../docs/repositories/index.md')){
        fs.writeFileSync(`../docs/repositories/index.md`, '');
    }
    var logger = fs.createWriteStream('../docs/repositories/index.md',)
    logger.write('# Team Repositories  \n');
    logger.write('*Repositories we have an ownership or general administrative stakeholding* \n');
    logger.write('|Repository Name|Size(kb)|Language|Created|Updated|Last Push| \n')
    logger.write('|-|-:|-|-:|-: |-: | \n')

    await octokit.request(`GET /orgs/{org}/teams/{team_slug}/repos?per_page=100`, {
        org: 'bbc',
        team_slug: teamname
    }).then(async (data) => {
        data.data.forEach(async record => {
            if(record.role_name.toLowerCase() === 'admin') { 
                get_readmes()
                logger.write(`|[${record.name}](./${record.name}.md)|${record.size}|${record.language}|${new Date(record.created_at).toDateString()}|${new Date(record.updated_at).toDateString()}|${new Date(record.pushed_at).toDateString()}| \n`)
             };

        })
    }).catch(error => { 
        console.log(error)
    }).finally(() => {
        logger.write(`Last Generated: ${new Date().toDateString()} \n`);
        logger.end();
    });
}

getTeamRepositories('Quark');
//get_readmes('devops');