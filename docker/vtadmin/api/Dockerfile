FROM golang:1

ARG BUILD_GIT_REV
ARG BUILD_GIT_BRANCH
ARG BUILD_NUMBER

WORKDIR /go/vitess.io

ADD . .
RUN go build \
        -trimpath \
        -o /vtadmin \
        -ldflags "\
 			-X 'vitess.io/vitess/go/vt/servenv.buildHost=$(hostname)' \
 			-X 'vitess.io/vitess/go/vt/servenv.buildUser=$(whoami)' \
 			-X 'vitess.io/vitess/go/vt/servenv.buildGitRev=${BUILD_GIT_REV:-$DEFAULT_BUILD_GIT_REV}' \
 			-X 'vitess.io/vitess/go/vt/servenv.buildGitBranch=${BUILD_GIT_BRANCH:-$DEFAULT_BUILD_GIT_BRANCH}' \
 			-X 'vitess.io/vitess/go/vt/servenv.buildTime=$(LC_ALL=C date)' \
 			-X 'vitess.io/vitess/go/vt/servenv.jenkinsBuildNumberStr=${BUILD_NUMBER}' \
        " \
        ./go/cmd/vtadmin/main.go

FROM ubuntu:bionic

RUN apt-get update && \
    DEBIAN_FRONTEND=noninternative apt-get install -y --no-install-recommends \
        ca-certificates \
        sudo \
        && \
    groupadd -r vtadmin && \
    useradd -r -g vtadmin vtadmin && \
    echo "vtadmin ALL=(ALL) NOPASSWD:SETENV: ALL" >> /etc/sudoers

# That last line above restricts us to *only* be able to run /api-entrypoint.sh
# as root without a password. The SETENV directive allows us to set environment
# variables when running as root.

USER vtadmin

COPY --from=0 /vtadmin /usr/local/bin/vtadmin

ADD ./docker/vtadmin/api/entrypoint.sh /entrypoint.sh

CMD [ "/entrypoint.sh" ]
