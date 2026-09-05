# Contributing to BotForge 🤖

Thank you for contributing to BotForge! This project is designed for open-source collaboration and ROSPL coursework development.

Follow the workflow below to ensure smooth collaboration and clean Git history.

---

## 🔄 Contribution Workflow

```text
Select/Assign Issue
        ↓
  Create Branch
        ↓
   Make Changes
        ↓
   Commit Changes
        ↓
    Push Branch
        ↓
 Open Pull Request
        ↓
Review & Merge into Main
```

---

## 1. Select an Issue
- Browse the [GitHub Issues](https://github.com/BotForgeLabs-droid/BotForge/issues).
- Comment on the issue you wish to work on to let your team members know.

## 2. Create a Feature/Bugfix Branch
Before making changes, pull the latest code from `main` and create a descriptive branch:

```bash
git checkout main
git pull origin main
git checkout -b <branch-type>/<short-description>
```

### Branch Naming Conventions:
- **Features**: `feature/chatbot-mobile-ui`, `feature/contact-form`
- **Bugfixes**: `fix/mobile-navigation`, `fix/form-validation`
- **Documentation**: `docs/update-readme`, `docs/jsdoc-comments`

## 3. Commit Guidelines
Write clear, imperative commit messages following conventional standards:

```bash
feat: add responsive styling for chatbot modal
fix: resolve contact form validation logic issue
docs: update installation instructions in README
```

## 4. Push Branch & Create Pull Request
Push your branch to GitHub:

```bash
git push -u origin <branch-type>/<short-description>
```

Then visit [https://github.com/BotForgeLabs-droid/BotForge](https://github.com/BotForgeLabs-droid/BotForge) to create a **Pull Request**:
- Link the issue being resolved (`Closes #1`).
- Provide a summary of changes made.
- Request review from a team member.

## 5. Review & Merge
Once reviewed and approved by a team member, merge the PR into `main`!
