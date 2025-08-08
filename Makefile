SHELL := /bin/bash

.PHONY: rs256-gen rs256-env rs256-up

# Generate an RS256 keypair OUTSIDE the repo
rs256-gen:
	mkdir -p "$(HOME)/.tms/keys"
	chmod 700 "$(HOME)/.tms/keys"
	@if [ ! -f "$(HOME)/.tms/keys/jwtRS256.key" ]; then \
		openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$(HOME)/.tms/keys/jwtRS256.key"; \
		chmod 600 "$(HOME)/.tms/keys/jwtRS256.key"; \
	fi
	@if [ ! -f "$(HOME)/.tms/keys/jwtRS256.pub" ]; then \
		openssl rsa -in "$(HOME)/.tms/keys/jwtRS256.key" -pubout -out "$(HOME)/.tms/keys/jwtRS256.pub"; \
		chmod 644 "$(HOME)/.tms/keys/jwtRS256.pub"; \
	fi
	@echo "RS256 keys ready at $(HOME)/.tms/keys (not in the repo)."

# Print export lines you can eval in your current shell
# Usage: eval "$(make rs256-env)"
rs256-env:
	@if [ ! -f "$(HOME)/.tms/keys/jwtRS256.key" ] || [ ! -f "$(HOME)/.tms/keys/jwtRS256.pub" ]; then \
		echo "Keys not found. Run: make rs256-gen" 1>&2; \
		exit 1; \
	fi
	@echo "export JWT_PRIVATE_KEY=\"$$(cat "$(HOME)/.tms/keys/jwtRS256.key")\""
	@echo "export JWT_PUBLIC_KEY=\"$$(cat "$(HOME)/.tms/keys/jwtRS256.pub")\""
	@echo "export JWT_ALG=RS256"

# Start just the API with RS256 env injected for this invocation
rs256-up:
	@if [ ! -f "$(HOME)/.tms/keys/jwtRS256.key" ] || [ ! -f "$(HOME)/.tms/keys/jwtRS256.pub" ]; then \
		$(MAKE) rs256-gen; \
	fi
	JWT_PRIVATE_KEY="$$(cat "$(HOME)/.tms/keys/jwtRS256.key")" \
	JWT_PUBLIC_KEY="$$(cat "$(HOME)/.tms/keys/jwtRS256.pub")" \
	JWT_ALG=RS256 \
	DOCKER_BUILDKIT=1 docker compose up -d api
	@echo "API started with RS256 keys from $(HOME)/.tms/keys"


