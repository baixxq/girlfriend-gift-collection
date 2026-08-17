now=$(date "+%Y-%m-%d")
echo "Starting add-commit-pull-push..."
git add -A && git commit -m "$now" && git push
echo "Finish!"