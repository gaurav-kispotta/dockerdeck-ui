# DockerDeck - Docker Compose Visualizer 🐳

[![Deploy Status](https://img.shields.io/badge/Deploy-Firebase-orange)](https://docker-deck.web.app/)
[![Version](https://img.shields.io/badge/Version-0.0.8-blue)](https://github.com/gaurav-kispotta/dockerdeck-ui)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)

> **Transform your Docker Compose files into beautiful, interactive visual diagrams**

DockerDeck is a powerful web-based tool that helps developers, DevOps engineers, and system architects visualize Docker Compose configurations as interactive diagrams. Upload your `docker-compose.yml` files and instantly see your container architecture, service dependencies, networks, and volumes in a clear, organized visual format.

## 🌟 Features

- **📁 File Upload**: Drag and drop your `docker-compose.yml` files
- **🎨 Interactive Visualization**: See your containers, services, networks, and volumes as connected nodes
- **🔍 Dependency Mapping**: Understand service relationships and dependencies at a glance
- **🌐 Network Visualization**: Visualize Docker networks and how services connect
- **💾 Volume Mapping**: See volume mounts and data persistence patterns
- **🌙 Dark/Light Themes**: Choose your preferred viewing mode
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **⚡ Real-time Processing**: Instant visualization as you upload files
- **🔧 AST Analysis**: Deep dive into the parsed structure of your Docker Compose files
- **📊 Redux State Management**: Robust state management for complex visualizations

## 🚀 Live Demo

Visit [docker-deck.web.app](https://docker-deck.web.app/) to try DockerDeck now!

## 🛠️ Technology Stack

- **Frontend**: React 18.3 + TypeScript
- **State Management**: Redux Toolkit
- **Visualization**: React Flow (xyFlow)
- **Styling**: Tailwind CSS + Ant Design
- **Build Tool**: Vite
- **Deployment**: Firebase Hosting
- **Testing**: Vitest
- **Code Editor**: Monaco Editor (VS Code editor in browser)

## 🎯 Use Cases

- **DevOps Teams**: Understand complex multi-container applications
- **Developers**: Visualize microservices architecture
- **System Architects**: Plan and document container orchestration
- **Education**: Learn Docker Compose through visual representation
- **Documentation**: Generate visual documentation for Docker projects
- **Debugging**: Identify configuration issues and dependencies

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/gaurav-kispotta/dockerdeck-ui.git

# Navigate to project directory
cd dockerdeck-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

### Deployment

```bash
# Deploy to Firebase
npm run firebase:deploy
```

## 📖 How It Works

1. **Upload**: Drag and drop your `docker-compose.yml` file
2. **Parse**: DockerDeck parses the YAML and creates an Abstract Syntax Tree (AST)
3. **Visualize**: The AST is transformed into an interactive node-based diagram
4. **Explore**: Click on nodes to see details, zoom, pan, and explore your architecture

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- **Live Application**: [docker-deck.web.app](https://docker-deck.web.app/)
- **Repository**: [GitHub](https://github.com/gaurav-kispotta/dockerdeck-ui)
- **Issues**: [Report Issues](https://github.com/gaurav-kispotta/dockerdeck-ui/issues)

## 📊 Project Status

DockerDeck is actively maintained and continuously improved. Current version: **0.0.8**

---

**Made with ❤️ for the Docker and DevOps community**
