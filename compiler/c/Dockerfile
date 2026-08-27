FROM gcc:15

# Container scratch root for judged jobs. MUST live on the writable overlay
# layer, NOT a tmpfs mount: the docker daemon's `docker cp` cannot write into
# container-internal tmpfs mounts (yields "Could not find the file ... in
# container <name>"). mode=1777 (sticky, world-writable) so any user can create
# per-job subdirectories.
RUN mkdir -p /workspace/jobs /tmp/jobs \
    && chmod 1777 /workspace/jobs /tmp/jobs

WORKDIR /workspace

# Keep container alive to accept exec commands from backend
CMD ["tail", "-f", "/dev/null"]