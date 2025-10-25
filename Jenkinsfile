properties([
    parameters([
        choice(
            name: 'ENVIRONMENT',
            choices: ['production', 'stage', 'release', 'test-pipeline'],
             description: '''Select deployment environment:
                production -> main branch
                stage -> feature/merge branch
                release -> develop branch
                test-pipeline -> feature/pipeline branch
                '''
        ),
    ])
])

pipeline {
    agent any

    environment {
        DEPLOY_BASE = '/jenkins/projects'
        NODE_VERSION = '18'
    }

    stages {
        stage('Setup Configuration') {
            steps {
                script {
                    def config = [
                        production: [
                            dir: "${DEPLOY_BASE}/production/dozu-ui",
                            port: '3000',
                            pm2_name: 'next-app-prod',
                            branch: 'main',
                            node_env: 'production',
                            allowedBranches: ['main']
                        ],
                        stage: [
                            dir: "${DEPLOY_BASE}/staging/dozu-ui",
                            port: '3111',
                            pm2_name: 'next-app-stage',
                            branch: 'feature/merge',
                            node_env: 'stage',
                            allowedBranches: ['feature/merge']
                        ],
                        release: [
                            dir: "${DEPLOY_BASE}/release/dozu-ui",
                            port: '3222',
                            pm2_name: 'next-app-release',
                            branch: 'develop',
                            node_env: 'release',
                            allowedBranches: ['develop']
                        ],
                        'test-pipeline': [
                            dir: "${DEPLOY_BASE}/test-pipeline/dozu-ui",
                            port: '3333',
                            pm2_name: 'next-app-test',
                            branch: 'feature/pipeline',
                            node_env: 'test',
                            allowedBranches: ['feature/pipeline']
                        ]
                    ]

                    env.DEPLOY_DIR = config[params.ENVIRONMENT].dir
                    env.APP_PORT = config[params.ENVIRONMENT].port
                    env.PM2_APP_NAME = config[params.ENVIRONMENT].pm2_name
                    env.NODE_ENV = config[params.ENVIRONMENT].node_env
                    env.BRANCH = config[params.ENVIRONMENT].branch
                }
            }
        }

        stage('Clone Repository') {
            steps {
                git branch: "${BRANCH}", credentialsId: 'github-token', url: 'https://github.com/perinst/dozu-ui-service.git'
            }
        }

        stage('Setup Node.js') {
            steps {
                sh '''
                export NVM_DIR="$HOME/.nvm"
                . "$NVM_DIR/nvm.sh"

                if [ -d "node_modules" ]; then
                    echo "Using cached node_modules"
                else
                    echo "Installing dependencies..."
                    npm ci --no-audit --progress=false
                fi
                '''
            }
        }

        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy Application') {
            steps {
                sh '''
                    # Create or clean deploy directory
                    mkdir -p "${DEPLOY_DIR}"

                    # Copy only necessary files
                    cp -r .next "${DEPLOY_DIR}/"
                    cp package*.json "${DEPLOY_DIR}/"

                    # Install and start
                    cd "${DEPLOY_DIR}"
                    npm ci --omit=dev

                    # Verify deployment
                    if [ ! -d ".next" ]; then
                        echo "Build files not found"
                        exit 1
                    fi
                '''
            }
        }

        stage('Restart Application') {
            steps {
                sh '''
            cd ${DEPLOY_DIR}

                # Check if PM2 process exists
                if pm2 describe ${PM2_APP_NAME} > /dev/null 2>&1; then
                    echo "Reloading existing ${PM2_APP_NAME}..."
                    pm2 reload ${PM2_APP_NAME} --update-env || {
                        echo "Reload failed, forcing restart..."
                        pm2 delete ${PM2_APP_NAME}
                        pm2 start npm --name ${PM2_APP_NAME} -- start -- -p ${APP_PORT}
            }
                else
                    echo "Starting new ${PM2_APP_NAME}..."
                    pm2 start npm --name ${PM2_APP_NAME} -- start -- -p ${APP_PORT}
                fi

                # Save PM2 configuration
                pm2 save

                # Verify the process is running
                pm2 describe ${PM2_APP_NAME} || exit 1
            '''
        }
    }

}
}
