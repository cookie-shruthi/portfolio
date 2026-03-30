async function fetchGithubCode(containerId, user, repo, branch, filePath) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`fetchGithubCode: container '${containerId}' not found`);
        return;
    }

    const label = container.querySelector('.filename');
    const codeElement = container.querySelector('code');
    const url = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filePath}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('File not found');

        const text = await response.text();
        if (label) {
            label.textContent = filePath.split('/').pop();
        }

        const extension = filePath.split('.').pop();
        if (codeElement) {
            codeElement.className = `language-${extension}`;
            codeElement.textContent = text;
            Prism.highlightElement(codeElement);
        }
    } catch (err) {
        if (codeElement) {
            codeElement.textContent = 'Error loading code: ' + err.message;
        }
        if (label) {
            label.textContent = 'Error';
        }
        console.error('fetchGithubCode error:', err);
    }
}
