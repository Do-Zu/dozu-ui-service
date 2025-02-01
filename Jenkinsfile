pipeline {
    agent any

    environment {
        DEPLOY_DIR = '/projects/staging/dozu-ui'
        APP_PORT = '3111'
        NODE_VERSION = '18'
        PM2_APP_NAME = 'next-app'
        NODE_ENV = 'stage'
    }

    stages {
        stage('Clone Repository') {
            steps {
                checkout scm
            }
        }

        stage('Setup Node.js') {
            steps {
                sh 'nvm install $NODE_VERSION && nvm use $NODE_VERSION'
            }
        }

        stage('Build Application') {
            steps {
                sh 'npm cache clean --force'
                sh 'npm ci --no-audit --progress=false'
                sh 'npm run build'
            }
        }

        stage('Deploy Application') {
            steps {
                sh '''
                mkdir -p "$DEPLOY_DIR"
                rsync -a --delete .next "$DEPLOY_DIR/"
                cp package*.json "$DEPLOY_DIR/"
                cd "$DEPLOY_DIR"
                npm ci --omit=dev
                pm2 stop $PM2_APP_NAME || true
                pm2 start npm --name "$PM2_APP_NAME" -- start -- -p $APP_PORT
                pm2 save
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    def result = sh(script: "pm2 describe $PM2_APP_NAME | grep -q 'online'", returnStatus: true)
                    if (result != 0) {
                        error('❌ Application failed to start')
                    }
                    
                    def response = sh(script: "curl -f http://localhost:$APP_PORT > /dev/null 2>&1", returnStatus: true)
                    if (response != 0) {
                        error('❌ Application is not responding')
                    }
                    echo '✅ Deployment successful'
                }
            }
        }
    }
}
