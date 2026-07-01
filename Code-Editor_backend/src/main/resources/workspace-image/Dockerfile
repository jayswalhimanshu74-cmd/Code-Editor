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

# Final workspace config
WORKDIR /workspace
USER sandbox

# Keep container alive
CMD ["tail", "-f", "/dev/null"]
