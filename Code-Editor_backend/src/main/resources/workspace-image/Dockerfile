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

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install .NET and dotnet-script
RUN apt-get update && apt-get install -y dotnet-sdk-8.0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
RUN dotnet tool install -g dotnet-script
ENV PATH="/root/.dotnet/tools:${PATH}"

# Install Kotlin
RUN wget https://github.com/JetBrains/kotlin/releases/download/v1.9.23/kotlin-compiler-1.9.23.zip \
    && unzip kotlin-compiler-1.9.23.zip -d /opt/ \
    && rm kotlin-compiler-1.9.23.zip
ENV PATH="/opt/kotlinc/bin:${PATH}"

# Set the default working directory
WORKDIR /workspace

# Keep container alive
CMD ["tail", "-f", "/dev/null"]
