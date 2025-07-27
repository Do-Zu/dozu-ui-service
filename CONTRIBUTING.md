# Contributing to Dozu

Thank you for your interest in contributing to Dozu! We welcome contributions from the community to help make our learning platform better for everyone. This document provides guidelines and information for contributors.

## 🤝 How to Contribute

There are many ways you can contribute to Dozu:

- **🐛 Report bugs** - Help us identify and fix issues
- **💡 Suggest features** - Share ideas for new learning methods or improvements
- **📝 Improve documentation** - Help make our docs clearer and more comprehensive
- **🎨 UI/UX improvements** - Enhance the user experience
- **🔧 Code contributions** - Fix bugs, implement features, or optimize performance
- **🌐 Translations** - Help make Dozu accessible in more languages
- **🧪 Testing** - Write tests or help with quality assurance

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- Node.js 18 or higher
- Git installed on your machine
- A GitHub account
- Basic knowledge of React, Next.js, and TypeScript

### Setting Up Your Development Environment

1. **Fork the repository**

    ```bash
    # Fork the repo on GitHub, then clone your fork
    git clone https://github.com/YOUR_USERNAME/dozu-ui-service.git
    cd dozu-ui-service
    ```

2. **Add upstream remote**

    ```bash
    git remote add upstream https://github.com/perinst/dozu-ui-service.git
    ```

3. **Install dependencies**

    ```bash
    npm install
    ```

4. **Start the development server**

    ```bash
    npm run dev
    ```

5. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000) to see the app running.

## 📋 Development Guidelines

### Code Style

We maintain consistent code quality through:

- **ESLint** - For code linting
- **Prettier** - For code formatting
- **TypeScript** - For type safety
- **Tailwind CSS** - For styling

Before submitting code, please run:

```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Fix auto-fixable linting issues
npm run type-check  # Check TypeScript types
```

### Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**

```bash
feat(flashcard): add spaced repetition algorithm
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
style(ui): improve button hover animations
```

### Branch Naming

Use descriptive branch names:

- `feature/flashcard-spaced-repetition`
- `fix/login-redirect-bug`
- `docs/update-contributing-guide`
- `refactor/api-service-layer`

## 🔄 Pull Request Process

1. **Create a feature branch**

    ```bash
    git checkout -b feature/your-feature-name
    ```

2. **Make your changes**

    - Write clean, well-documented code
    - Add tests for new functionality
    - Update documentation as needed

3. **Test your changes**

    ```bash
    npm run test
    npm run build
    ```

4. **Commit your changes**

    ```bash
    git add .
    git commit -m "feat: add your feature description"
    ```

5. **Push to your fork**

    ```bash
    git push origin feature/your-feature-name
    ```

6. **Create a Pull Request**
    - Go to the original repository on GitHub
    - Click "New Pull Request"
    - Provide a clear title and description
    - Link any relevant issues

### Pull Request Guidelines

- **Title**: Use a clear, descriptive title
- **Description**: Explain what changes you made and why
- **Screenshots**: Include screenshots for UI changes
- **Testing**: Describe how you tested your changes
- **Breaking Changes**: Clearly mark any breaking changes

## 🐛 Bug Reports

When reporting bugs, please include:

- **Clear title** - Summarize the issue in one line
- **Steps to reproduce** - Detailed steps to recreate the bug
- **Expected behavior** - What should happen
- **Actual behavior** - What actually happens
- **Environment** - Browser, OS, Node.js version
- **Screenshots** - If applicable
- **Console errors** - Any error messages

Use our bug report template when creating issues.

## 💡 Feature Requests

For feature requests, please provide:

- **Problem description** - What problem does this solve?
- **Proposed solution** - How should it work?
- **Learning method relevance** - How does it improve the learning experience?
- **Use cases** - Who would benefit from this feature?
- **Alternative solutions** - Other ways to solve this problem

## 🧪 Testing

We encourage writing tests for new features:

- **Unit tests** - For individual functions and components
- **Integration tests** - For feature workflows
- **E2E tests** - For complete user journeys

Run tests with:

```bash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 🌐 Internationalization

Help make Dozu accessible worldwide:

- **Adding translations** - Contribute to `messages/` directory
- **Testing translations** - Verify UI in different languages
- **RTL support** - Help with right-to-left language support

## 📚 Documentation

Improve our documentation by:

- **API documentation** - Document new endpoints or services
- **Component documentation** - Add Storybook stories
- **User guides** - Help write user-facing documentation
- **Code comments** - Add helpful inline documentation

## 🏆 Recognition

Contributors are recognized in:

- **Contributors section** - Listed in our README
- **Release notes** - Mentioned in version releases
- **Community highlights** - Featured in our communications

## 📞 Getting Help

If you need help or have questions:

- **GitHub Discussions** - For general questions and ideas
- **GitHub Issues** - For bug reports and feature requests
- **Code Reviews** - Ask for feedback on your PRs

## 📄 License

By contributing to Dozu, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for helping make Dozu a better learning platform for everyone! 🎓✨
