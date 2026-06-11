# Contributing to Hence-Code

First off, thank you for considering contributing to Hence-Code! It's people like you that make open-source software such a great community.

## 🛠️ How to Contribute

1. **Fork the Repository**: Start by forking the project to your own GitHub account.
2. **Clone the Repo**: Clone your fork to your local machine.
   ```bash
   git clone https://github.com/your-username/Hence-Code.git
   ```
3. **Set Up Local Environment**: Follow the instructions in the [Local Setup Guide](docs/LOCAL_SETUP.md) to get the backend, frontend, and Docker dependencies running locally.
4. **Create a Branch**: Create a descriptive branch for your feature or bug fix.
   ```bash
   git checkout -b feature/amazing-new-feature
   ```
5. **Make Your Changes**: Write code, add tests, and ensure everything runs smoothly.
6. **Commit Your Changes**: Use clear, descriptive commit messages.
   ```bash
   git commit -m "feat: added syntax highlighting for Rust"
   ```
7. **Push to your Fork**:
   ```bash
   git push origin feature/amazing-new-feature
   ```
8. **Open a Pull Request**: Submit a PR to the `main` branch of the original repository. Include a clear description of what your PR accomplishes.

## 🐛 Reporting Bugs

If you find a bug in the system, please open an issue on GitHub. Be sure to include:
- A clear title and description.
- Steps to reproduce the issue.
- Details about your environment (Browser, OS, Docker version).
- Any relevant logs from the backend console or frontend developer tools.

## ✨ Suggesting Enhancements

Have an idea to make Hence-Code better? We'd love to hear it! Open an issue on GitHub and use the `enhancement` label. Describe the feature in detail and explain why it would be beneficial.

## 💻 Code Style & Conventions

- **Frontend**: Follow React best practices, use functional components, and rely on standard Tailwind CSS classes. Run linting if available.
- **Backend**: Adhere to standard Java/Spring Boot conventions. Ensure all REST controllers are documented and securely protected via Spring Security.
- **Documentation**: If you change a core feature, please update the relevant documentation in the `docs/` folder.

Thank you for your interest in improving Hence-Code!
