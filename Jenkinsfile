pipeline {
    agent any

    environment {
        // Define your GitHub credentials ID in Jenkins
        GITHUB_CREDENTIALS_ID = 'GITHUB_PATTOKEN'  // Replace with your credentials ID
        // Define your GitHub username for commit authoring
        GITHUB_USERNAME = 'roberp05' // Replace with your GitHub username
        // Define your GitHub email for commit authoring
        GITHUB_EMAIL = 'paul.roberts05@bbc.co.uk' // Replace with your GitHub email
        NPM_CREDENTIALS_ID = 'NPMTOKEN' // ID of your npm credentials in Jenkins
    }

        stages {
        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM', extensions: [], userRemoteConfigs: [[credentialsId: env.GITHUB_CREDENTIALS_ID, url: 'your-github-repo-url']]]) // Replace with your repo URL
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

                    if (env.BRANCH_NAME != 'main') { //Example: Add pre-release identifier for non-main branches
                        version = "${version}-beta.${BUILD_NUMBER}"
                        echo "Pre-release version: ${version}"
                    }

                    sh "npm version ${version} --no-git-tag"
                    sh "git config --global user.email ${env.GITHUB_EMAIL}"
                    sh "git config --global user.name ${env.GITHUB_USERNAME}"
                    sh "git commit -am 'Version: ${version}'"
                    sh "git push origin ${env.BRANCH_NAME}" // Push to the correct branch
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main') {
                        sh 'npm run build:main' // Example: Main branch build
                    } else if (env.BRANCH_NAME == 'develop') {
                        sh 'npm run build:develop' // Example: Develop branch build
                    } else {
                        sh 'npm run build' // Default build command
                    }
                }
            }
        }



        stage('Publish') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main') {
                        withCredentials([usernamePassword(credentialsId: env.NPM_CREDENTIALS_ID, usernameVariable: 'NPM_USERNAME', passwordVariable: 'NPM_PASSWORD')]) {
                            sh "echo //registry.npmjs.org/:_authToken=\${NPM_PASSWORD} > .npmrc"
                            sh "npm config set email ${env.GITHUB_EMAIL}"
                            sh "npm config set always-auth true"
                            sh 'npm publish'
                            sh 'rm .npmrc'
                        }
                    } else {
                        // Example: Publish to a staging registry
                        withCredentials([usernamePassword(credentialsId: 'your-npm-staging-credentials-id', usernameVariable: 'NPM_USERNAME', passwordVariable: 'NPM_PASSWORD')]) { // Replace with your staging credentials ID
                            sh "echo //your-staging-registry.com/:_authToken=\${NPM_PASSWORD} > .npmrc" // Replace with your staging registry URL
                            sh "npm config set email ${env.GITHUB_EMAIL}"
                            sh "npm config set always-auth true"
                            sh 'npm publish --registry http://your-staging-registry.com' // Publish to staging
                            sh 'rm .npmrc'
                        }
                    }
                }
            }
        }
    }
}