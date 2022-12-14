FROM ubuntu:22.10

ARG NODE_VERSION="18.12.1"
ARG GO_VERSION="2:1.19.3"
ARG PNPM_VERSION="7.17.1"

ARG TARGETARCH
ARG USERNAME=dluki
ARG USER_UID=1000
ARG USER_GID=$USER_UID
RUN groupadd --gid $USER_GID $USERNAME && \
    useradd --uid $USER_UID --gid $USER_GID -m $USERNAME && \
    usermod -s /bin/bash $USERNAME

RUN apt update && \
    apt install -y build-essential git protobuf-compiler curl wget sudo
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y nodejs
RUN wget https://go.dev/dl/go1.19.4.linux-$TARGETARCH.tar.gz && \
    tar -C /usr/local -xzf go1.19.4.linux-$TARGETARCH.tar.gz && \
    rm go1.19.4.linux-$TARGETARCH.tar.gz

RUN npm i -g pnpm@7.17.1 @go-task/cli

RUN echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers

RUN echo "${USERNAME}:shgpu-table" | chpasswd
USER ${USERNAME}
ENV PATH="$PATH:/usr/local/go/bin:$PATH:/home/$USERNAME/go/bin"
RUN SHELL=/bin/bash pnpm setup

RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.28 && \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.2 && \
    go install github.com/mitranim/gow@latest && \
    go install mvdan.cc/gofumpt@latest && \
    go install github.com/segmentio/golines@latest && \
    go install -v golang.org/x/tools/gopls@latest


