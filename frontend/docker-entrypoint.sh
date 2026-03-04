#!/bin/sh

# Generate runtime config with the API URL from environment
cat > /app/dist/runtime-config.js << EOF
window.__RUNTIME_CONFIG__ = {
  API_URL: "${VITE_API_URL}"
};
EOF

# Start the static file server
exec serve -s dist -l ${PORT:-5173}
