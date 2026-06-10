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
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set aliases for convenience
RUN echo 'alias python=python3' >> ~/.bashrc
RUN echo 'alias pip=pip3' >> ~/.bashrc

# Set the default working directory
WORKDIR /workspace

# Keep container alive
CMD ["tail", "-f", "/dev/null"]
