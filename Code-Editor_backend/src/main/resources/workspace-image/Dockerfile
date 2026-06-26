FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install essential tools and runtimes
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    nano \
    vim \
    build-essential \
    python3 \
    python3-pip \
    nodejs \
    npm \
    openjdk-17-jdk \
    maven \
    unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set python symlinks
RUN ln -sf /usr/bin/python3 /usr/bin/python \
    && ln -sf /usr/bin/pip3 /usr/bin/pip

# Create sandbox group and user
RUN groupadd -g 1000 sandbox && useradd -u 1000 -g sandbox -m -s /bin/bash sandbox

# Configure permissions for workspace folder
RUN mkdir -p /workspace && chown -R sandbox:sandbox /workspace

# Install .NET SDK as root
RUN apt-get update && apt-get install -y dotnet-sdk-8.0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Switch to sandbox user for user-level tools
USER sandbox
ENV HOME=/home/sandbox

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/home/sandbox/.cargo/bin:${PATH}"

# Install dotnet-script
RUN dotnet tool install -g dotnet-script
ENV PATH="/home/sandbox/.dotnet/tools:${PATH}"

# Install Kotlin
USER root
RUN wget https://github.com/JetBrains/kotlin/releases/download/v1.9.23/kotlin-compiler-1.9.23.zip \
    && unzip kotlin-compiler-1.9.23.zip -d /opt/ \
    && rm kotlin-compiler-1.9.23.zip \
    && chown -R sandbox:sandbox /opt/kotlinc
ENV PATH="/opt/kotlinc/bin:${PATH}"

# Final workspace config
WORKDIR /workspace
USER sandbox

# Keep container alive
CMD ["tail", "-f", "/dev/null"]
