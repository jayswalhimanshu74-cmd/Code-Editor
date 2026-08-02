FROM ghcr.io/engineerman/piston:latest

# Set environment variables for production execution
ENV PORT=20000
ENV PISTON_BIND=0.0.0.0:20000
ENV PISTON_RUNTIMES_PATH=/piston/packages
ENV PISTON_TMP_PATH=/tmp/piston

# Expose port 20000 for Render / Container networking
EXPOSE 20000

# Healthcheck to verify Piston API responsiveness
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:20000/api/v2/runtimes', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "src/index.js"]
