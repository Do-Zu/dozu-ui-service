properties([
    parameters([
        choice(
            name: 'ENVIRONMENT',
            choices: ['production', 'stage', 'release', 'test-pipeline'],
            description: 'Select deployment environment'
        ),
        string(
            name: 'BRANCH',
            defaultValue: 'develop',
            description: 'Git branch to build',
            trim: true
        )
    ])
])

pipeline {
    agent any

    environment {
        DEPLOY_BASE = '/jenkins/projects'
        NODE_VERSION = '18'

        DEPLOY_CONFIG = [
            'production': [
                dir: "${DEPLOY_BASE}/production/dozu-ui",
                port: '3000',
                pm2_name: 'next-app-prod',
                branch: 'main',
                node_env: 'production',
                allowedBranches: ['main']
            ],
            'stage': [
                dir: "${DEPLOY_BASE}/staging/dozu-ui",
                port: '3111',
                pm2_name: 'next-app-stage',
                branch: 'feature/merge',
                node_env: 'stage',
                allowedBranches: ['feature/merge']
            ],
            'release': [
                dir: "${DEPLOY_BASE}/release/dozu-ui",
                port: '3222',
                pm2_name: 'next-app-release',
                branch: 'develop',
                node_env: 'release',
                allowedBranches: ['develop']
            ],
            'test-pipeline': [
                dir: "${DEPLOY_BASE}/test-pipeline/dozu-ui",
                port: '3334',
                pm2_name: 'next-app-test-pipeline',
                branch: 'feature/pipeline',
                node_env: 'test',
                allowedBranches: ['feature/pipeline']
            ],
        ]

        DEPLOY_DIR = "${DEPLOY_CONFIG[params.ENVIRONMENT].dir}"
        APP_PORT = "${DEPLOY_CONFIG[params.ENVIRONMENT].port}"
        PM2_APP_NAME = "${DEPLOY_CONFIG[params.ENVIRONMENT].pm2_name}"
        NODE_ENV = "${DEPLOY_CONFIG[params.ENVIRONMENT].node_env}"
    }

    stages {
        stage('Validate Parameters') {
            steps {
                script {
                    if (!DEPLOY_CONFIG[params.ENVIRONMENT].allowedBranches.contains(params.BRANCH)) {
                        error "Branch ${params.BRANCH} is not allowed for environment ${params.ENVIRONMENT}"
                    }
                }
            }
        }

        stage('Clone Repository') {
            steps {
                git branch: "${params.BRANCH}", credentialsId: 'github-token', url: 'https://github.com/perinst/dozu-ui-service.git'
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
                mkdir -p "${DEPLOY_DIR}"
                rsync -a --delete --exclude 'node_modules' . "${DEPLOY_DIR}/"
                cd "${DEPLOY_DIR}"
                npm ci --omit=dev
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
                        pm2 start npm --name "${PM2_APP_NAME}" -- start -- -p ${APP_PORT}
            }
                else
                    echo "Starting new ${PM2_APP_NAME}..."
                    pm2 start npm --name "${PM2_APP_NAME}" -- start -- -p ${APP_PORT}
                fi

                # Save PM2 configuration
                pm2 save

                # Verify the process is running
                pm2 describe ${PM2_APP_NAME} || exit 1
                '''
        }
    }

        stage('Verify Deployment') {
            steps {
                sh '''
                if ! pm2 describe ${PM2_APP_NAME} | grep -q "online"; then
                    echo "❌ Application failed to start"
                    pm2 logs ${PM2_APP_NAME} --lines 20
                    exit 1
                fi
                if ! curl -f http://localhost:${APP_PORT} > /dev/null 2>&1; then
                    echo "❌ Application is not responding"
                    pm2 logs ${PM2_APP_NAME} --lines 20
                    exit 1
                fi
                echo "✅ Deployment successful"
                '''
            }
        }
}
}
