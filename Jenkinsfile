pipeline {
    agent any

    environment {
        GITHUB_CREDENTIALS_ID = 'githubpat'
        GITHUB_USERNAME = 'roberp05'
        GITHUB_EMAIL = 'paul.roberts05@bbc.co.uk'
        NPM_CREDENTIALS_ID = 'npm_token'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: env.GITHUB_CREDENTIALS_ID, url: 'your-github-repo-url']]]) // Replace with your repo URL
            }
        }

        stage('Cache Clean & Install') {
            steps {
                sh 'npm cache clean --force'
                sh 'npm install'
            }
        }

        stage('Semantic Versioning') {
            steps {
                script {
                    def version = sh(returnStdout: true, script: 'npm version --no-git-tag patch').trim()
                    echo "New version: ${version}"
                    sh "npm version ${version} --no-git-tag"
                    sh "git config --global user.email ${env.GITHUB_EMAIL}"
                    sh "git config --global user.name ${env.GITHUB_USERNAME}"
                    sh "git commit -am 'Version: ${version}'"
                    sh "git push origin main"
                }
            }
        }

        stage('Build & Publish') {
            steps {
                sh 'npm run build' // Replace with your build command

                withCredentials([usernamePassword(credentialsId: env.NPM_CREDENTIALS_ID, usernameVariable: 'NPM_USERNAME', passwordVariable: 'NPM_PASSWORD')]) {
                    sh "echo //registry.npmjs.org/:_authToken=\${NPM_PASSWORD} > .npmrc"  // Create .npmrc
                    sh "npm config set email ${env.GITHUB_EMAIL}" // Set npm email
                    sh "npm config set always-auth true" // Always authenticate
                    sh 'npm publish'
                    sh 'rm .npmrc' // Remove the .npmrc file for security
                }
            }
        }
    }
}