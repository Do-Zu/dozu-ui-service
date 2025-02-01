pipeline {
    agent any
    environment {
        DEPLOY_DIR = '/jenkins/projects/staging/dozu-ui'
        APP_PORT = '3111'
        NODE_VERSION = '18'
        PM2_APP_NAME = 'next-app'
        NODE_ENV = 'stage'
    }
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'feature/pipeline', credentialsId: 'github-token', url: 'https://github.com/perinst/dozu-ui-service.git'
            }
        }
        stage('Setup Node.js') {
            steps {
                sh '''
                export NVM_DIR="$HOME/.nvm"
                . "$NVM_DIR/nvm.sh"

                if [ -d "node_modules" ]; then
                    echo " Using cached node_modules"
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

                        # Check and manage PM2 process
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

                        # Verify process is running
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
