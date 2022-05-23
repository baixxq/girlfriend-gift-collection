now=$(date "+%Y-%m-%d")
echo "Change Directory to E:\Github\girlfriend-gift-collection"
cd E:/Github/girlfriend-gift-collection
echo "Starting add-commit-pull-push..."
git add -A && git commit -m "$now" && git push
echo "Finish!"