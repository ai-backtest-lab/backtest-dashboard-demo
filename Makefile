.PHONY: setup dev build check preview browser-check
setup:
	pnpm install --frozen-lockfile
dev:
	pnpm dev
build:
	pnpm data:check
	pnpm build
	pnpm artifact:check
check:
	pnpm test
	pnpm type-check
	pnpm lint
	pnpm data:check
preview:
	python3 scripts/preview.py
browser-check:
	pnpm browser:check
