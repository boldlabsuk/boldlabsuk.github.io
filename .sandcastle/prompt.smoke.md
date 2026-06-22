This is a low-risk Sandcastle smoke test.

Rules:
- Do not modify repository files.
- Do not commit anything.
- Do not open or close GitHub issues.
- Do not create branches manually.
- Only write to /tmp.
- Run the commands sequentially, not in parallel.
- Do not output the normal completion signal.

Task:
1. Run `pwd`.
2. Run `git status --short`.
3. Run `CODEX_HOME=/home/agent/.codex codex login status`.
4. Run `gh auth status`.
5. Run `printf 'sandcastle smoke test ok' > /tmp/sandcastle-smoke-test.txt`.
6. Run `cat /tmp/sandcastle-smoke-test.txt`.
7. Report whether:
   - the sandbox works,
   - the repository stayed clean,
   - GitHub auth works,
   - Codex auth works,
   - the `/tmp` write/read path works.

End with a short smoke-test summary.
