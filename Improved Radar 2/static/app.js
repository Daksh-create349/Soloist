/**
 * Soloist Opportunity Agent — Frontend Application
 * Handles file upload, pipeline triggering, status polling, and results rendering.
 */

// ── DOM Elements ─────────────────────────────────────────────────────────
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const dropIcon = document.getElementById('drop-icon');
const huntBtn = document.getElementById('hunt-btn');
const uploadStats = document.getElementById('upload-stats');
const skillsContainer = document.getElementById('skills-container');
const pipelineProgress = document.getElementById('pipeline-progress');
const pipelineStatusText = document.getElementById('pipeline-status-text');
const resultsSection = document.getElementById('results-section');
const jobsGrid = document.getElementById('jobs-grid');
const resultsCount = document.getElementById('results-count');
const resultsStats = document.getElementById('results-stats');
const errorsSection = document.getElementById('errors-section');
const errorsList = document.getElementById('errors-list');
const emptyState = document.getElementById('empty-state');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const chunksInfo = document.getElementById('chunks-info');
const chunksCount = document.getElementById('chunks-count');

// ── State ────────────────────────────────────────────────────────────────
let isHunting = false;
let pollInterval = null;

// ── File Upload ──────────────────────────────────────────────────────────

// Click to browse
dropZone.addEventListener('click', () => fileInput.click());

// File selected via input
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        uploadFile(e.target.files[0]);
    }
});

// Drag & drop events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drop-zone--dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drop-zone--dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drop-zone--dragover');
    if (e.dataTransfer.files.length > 0) {
        uploadFile(e.dataTransfer.files[0]);
    }
});

// Track mouse for glow effect
dropZone.addEventListener('mousemove', (e) => {
    const rect = dropZone.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    dropZone.style.setProperty('--glow-x', `${x}%`);
    dropZone.style.setProperty('--glow-y', `${y}%`);
});

async function uploadFile(file) {
    const validExts = ['.pdf', '.docx', '.txt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExts.includes(ext)) {
        showToast(`Unsupported format: ${ext}. Use PDF, DOCX, or TXT.`, 'error');
        return;
    }

    // Show uploading state
    dropIcon.innerHTML = '<i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>';
    lucide.createIcons();
    statusDot.className = 'status-bar__dot status-bar__dot--hunting';
    statusText.textContent = `Uploading & analyzing ${file.name}...`;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Upload failed');
        }

        // Success — update UI
        dropZone.classList.add('drop-zone--uploaded');
        dropIcon.innerHTML = '<i data-lucide="check-circle" style="width: 32px; height: 32px; color: var(--solo-blue);"></i>';
        dropZone.querySelector('.drop-zone__text').innerHTML =
            `<strong>${file.name}</strong> — uploaded successfully`;
        dropZone.querySelector('.drop-zone__hint').textContent =
            'Click to upload a different resume';

        // Show stats
        uploadStats.style.display = 'grid';
        document.getElementById('stat-file').textContent = file.name.split('.')[0];
        document.getElementById('stat-chars').textContent = formatNumber(data.text_length);
        document.getElementById('stat-chunks').textContent = data.chunks_count;
        document.getElementById('stat-skills').textContent = data.skills_extracted.length;

        // Show skills tags
        skillsContainer.innerHTML = '';
        data.skills_extracted.forEach((skill, i) => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.textContent = skill;
            tag.style.animationDelay = `${i * 60}ms`;
            skillsContainer.appendChild(tag);
        });

        // Update status
        statusDot.className = 'status-bar__dot status-bar__dot--active';
        statusText.textContent = 'Resume indexed — ready to hunt';
        chunksInfo.style.display = 'flex';
        chunksCount.textContent = data.chunks_count;

        // Enable hunt button
        huntBtn.disabled = false;
        huntBtn.innerHTML = '<i data-lucide="zap" style="width: 18px; height: 18px; fill: currentColor;"></i> Hunt for Gigs';
        lucide.createIcons();

        showToast(`Resume analyzed! ${data.chunks_count} chunks indexed, ${data.skills_extracted.length} skills detected.`, 'success');

    } catch (error) {
        dropIcon.innerHTML = '<i data-lucide="alert-circle" style="width: 32px; height: 32px; color: var(--solo-coral);"></i>';
        lucide.createIcons();
        statusDot.className = 'status-bar__dot status-bar__dot--error';
        statusText.textContent = 'Upload failed — try again';
        showToast(`Upload failed: ${error.message}`, 'error');
    }
}

// ── Hunt Pipeline ────────────────────────────────────────────────────────

huntBtn.addEventListener('click', startHunt);

async function startHunt() {
    if (isHunting) return;
    isHunting = true;

    // Reset results
    resultsSection.style.display = 'none';
    emptyState.style.display = 'none';
    jobsGrid.innerHTML = '';

    // UI updates
    huntBtn.disabled = true;
    huntBtn.innerHTML = '<i data-lucide="loader-2" class="spin" style="width: 18px; height: 18px;"></i> Hunting...';
    lucide.createIcons();
    huntBtn.classList.add('hunt-btn--hunting');

    pipelineProgress.style.display = 'block';
    pipelineStatusText.textContent = 'Starting pipeline...';

    statusDot.className = 'status-bar__dot status-bar__dot--hunting';
    statusText.textContent = 'Hunting across 5 platforms...';

    // Reset pipeline steps
    ['step-sourcing', 'step-filtering', 'step-crafting', 'step-complete'].forEach(id => {
        document.getElementById(id).className = 'pipeline-step';
    });

    try {
        const response = await fetch('/api/hunt', { method: 'POST' });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Hunt failed to start');
        }

        showToast(data.message, 'info');

        // Start polling for status
        startPolling();

    } catch (error) {
        showToast(`Hunt failed: ${error.message}`, 'error');
        resetHuntUI();
    }
}

function startPolling() {
    // Animate pipeline steps based on time
    let elapsed = 0;
    document.getElementById('step-sourcing').classList.add('pipeline-step--active');
    pipelineStatusText.textContent = 'Sourcing jobs from 5 platforms...';

    pollInterval = setInterval(async () => {
        elapsed++;

        // Animate pipeline steps based on elapsed time
        if (elapsed === 5) {
            document.getElementById('step-sourcing').classList.remove('pipeline-step--active');
            document.getElementById('step-sourcing').classList.add('pipeline-step--done');
            document.getElementById('step-filtering').classList.add('pipeline-step--active');
            pipelineStatusText.textContent = 'Filtering & scoring with AI...';
        }
        if (elapsed === 15) {
            document.getElementById('step-filtering').classList.remove('pipeline-step--active');
            document.getElementById('step-filtering').classList.add('pipeline-step--done');
            document.getElementById('step-crafting').classList.add('pipeline-step--active');
            pipelineStatusText.textContent = 'Crafting tailored proposals...';
        }

        try {
            const response = await fetch('/api/status');
            const status = await response.json();

            if (status.status === 'complete') {
                clearInterval(pollInterval);
                pollInterval = null;

                // Mark all steps as done
                ['step-sourcing', 'step-filtering', 'step-crafting'].forEach(id => {
                    const el = document.getElementById(id);
                    el.classList.remove('pipeline-step--active');
                    el.classList.add('pipeline-step--done');
                });
                document.getElementById('step-complete').classList.add('pipeline-step--done');
                pipelineStatusText.textContent = 'Pipeline complete!';

                // Fetch results
                await loadResults();
                resetHuntUI();

            } else if (status.status === 'error') {
                clearInterval(pollInterval);
                pollInterval = null;
                showToast(`Pipeline error: ${status.error}`, 'error');
                resetHuntUI();
            }

        } catch (e) {
            // Network error — keep polling
            console.warn('Poll error:', e);
        }
    }, 2000);
}

async function loadResults() {
    try {
        const response = await fetch('/api/jobs');
        const data = await response.json();

        if (data.jobs && data.jobs.length > 0) {
            renderJobs(data.jobs);

            // Show stats
            if (data.stats) {
                resultsStats.innerHTML = `
                    <span style="gap: 4px; display: flex; align-items: center;"><i data-lucide="activity" style="width: 14px; height: 14px;"></i> ${data.stats.raw_jobs || 0} scraped</span>
                    <span style="gap: 4px; display: flex; align-items: center;"><i data-lucide="target" style="width: 14px; height: 14px;"></i> ${data.stats.filtered_jobs || 0} matched</span>
                    <span style="gap: 4px; display: flex; align-items: center;"><i data-lucide="edit-3" style="width: 14px; height: 14px;"></i> ${data.stats.crafted_jobs || 0} proposals</span>
                `;
                lucide.createIcons();
            }

            // Show errors if any
            if (data.errors && data.errors.length > 0) {
                errorsSection.style.display = 'block';
                errorsList.innerHTML = data.errors
                    .map(e => `<li>${escapeHtml(e)}</li>`)
                    .join('');
            } else {
                errorsSection.style.display = 'none';
            }

            showToast(`🎉 Found ${data.jobs.length} matching opportunities!`, 'success');
        } else {
            emptyState.style.display = 'block';
            resultsSection.style.display = 'none';

            // Still show errors
            if (data.errors && data.errors.length > 0) {
                errorsSection.style.display = 'block';
                errorsList.innerHTML = data.errors
                    .map(e => `<li>${escapeHtml(e)}</li>`)
                    .join('');
                emptyState.appendChild(errorsSection);
            }

            showToast('No matches found this round. Try a different resume.', 'info');
        }
    } catch (e) {
        showToast(`Failed to load results: ${e.message}`, 'error');
    }
}

function resetHuntUI() {
    isHunting = false;
    huntBtn.disabled = false;
    huntBtn.innerHTML = '<i data-lucide="zap" style="width: 18px; height: 18px; fill: currentColor;"></i> Hunt Again';
    lucide.createIcons();
    huntBtn.classList.remove('hunt-btn--hunting');

    statusDot.className = 'status-bar__dot status-bar__dot--active';
    statusText.textContent = 'Ready for another hunt';

    setTimeout(() => {
        pipelineProgress.style.display = 'none';
    }, 2000);
}

// ── Render Job Cards ─────────────────────────────────────────────────────

function renderJobs(jobs) {
    resultsSection.style.display = 'block';
    emptyState.style.display = 'none';
    resultsCount.textContent = jobs.length;

    jobsGrid.innerHTML = jobs.map((job, i) => createJobCard(job, i)).join('');
    // Initialize Lucide icons on new cards
    lucide.createIcons();
}

function createJobCard(job, index) {
    const score = Math.round(job.match_score || 0);
    const source = (job.source || 'unknown').toLowerCase();
    
    // SVG Gauge Logic
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    // Semantic signal logic
    const isHighMatch = score >= 90;
    const matchLabel = isHighMatch ? "ELITE MATCH" : "MATCH SIGNAL";
    
    // Lucide Icon Mapping
    const icons = {
        budget: 'dollar-sign',
        source: 'globe',
        email: 'mail',
        download: 'download',
        apply: 'zap',
        time: 'clock',
        verify: 'shield-check'
    };

    const budgetHtml = job.budget
        ? `<div class="job-card__budget">
            <i data-lucide="${icons.budget}" style="width: 14px; height: 14px; stroke-width: 2px;"></i>
            ${escapeHtml(job.budget)}
           </div>`
        : '';

    const emailHtml = job.email_draft
        ? `
        <div class="job-card__email">
            <div class="job-card__email-label">
                <span class="micro-label">COMMUNICATION DRAFT</span>
                <button class="copy-btn" onclick="copyEmail(this, ${index})">Copy</button>
            </div>
            <textarea class="email-textarea" id="email-${index}" readonly>${escapeHtml(job.email_draft)}</textarea>
        </div>`
        : '';

    const pdfBtnHtml = job.resume_pdf_path
        ? `<a class="btn" style="background: rgba(255,255,255,0.05); color: var(--text-primary); border: 1px solid var(--glass-border);" 
              href="/api/jobs/job_${index + 1}_${targetSource(source, job.url)}/resume" download>
             <i data-lucide="${icons.download}" style="width: 16px; height: 16px;"></i>
             Download Resume
           </a>`
        : '';

    return `
    <div class="job-card" style="animation-delay: ${index * 80}ms">
        <div class="job-card__header">
            <div class="job-card__content">
                <span class="micro-label">${matchLabel}</span>
                <h3 class="job-card__title">${escapeHtml(job.title || 'Untitled Gig')}</h3>
                <div class="job-card__meta" style="margin-top: 12px; gap: 8px;">
                    <span class="source-badge">
                        <i data-lucide="${icons.source}" style="width: 12px; height: 12px; margin-right: 4px; display: inline-block; vertical-align: middle;"></i>
                        ${source}
                    </span>
                    ${isHighMatch ? '<span class="source-badge tag-hot">HOT LEAD</span>' : ''}
                    <span class="source-badge" style="gap: 4px; display: flex; align-items: center;">
                        <i data-lucide="${icons.time}" style="width: 12px; height: 12px;"></i>
                        Just Posted
                    </span>
                </div>
            </div>
            
            <div class="match-gauge">
                <div class="match-gauge__orbit"></div>
                <svg width="60" height="60" viewBox="0 0 48 48">
                    <circle class="match-gauge__bg" cx="24" cy="24" r="${radius}"/>
                    <circle class="match-gauge__stroke" cx="24" cy="24" r="${radius}"
                        style="stroke-dashoffset: ${offset};" />
                </svg>
                <div class="match-gauge__icon">
                    <i data-lucide="zap" style="width: 20px; height: 20px; stroke-width: 2.5px;"></i>
                </div>
            </div>
        </div>

        ${job.description ? `<p class="job-card__desc" style="color: var(--text-secondary); opacity: 0.8;">${escapeHtml(job.description)}</p>` : ''}
        ${budgetHtml}
        ${emailHtml}

        <div class="job-card__actions">
            <a class="btn" style="background: var(--solo-blue); color: white; flex: 1; justify-content: center;" 
               href="${escapeHtml(job.url || '#')}" target="_blank" rel="noopener">
                <i data-lucide="${icons.apply}" style="width: 16px; height: 16px;"></i>
                Apply Project
            </a>
            ${pdfBtnHtml}
        </div>
    </div>`;
}

// Support function for job ID naming in download route
function targetSource(source, url) {
    if (source !== 'unknown') return source;
    if (url.includes('upwork.com')) return 'upwork';
    if (url.includes('linkedin.com')) return 'linkedin';
    if (url.includes('reddit.com')) return 'reddit';
    if (url.includes('fiverr.com')) return 'fiverr';
    return 'unknown';
}


// ── Copy Email ───────────────────────────────────────────────────────────

function copyEmail(btn, index) {
    const textarea = document.getElementById(`email-${index}`);
    navigator.clipboard.writeText(textarea.value).then(() => {
        btn.textContent = '✓ Copied!';
        btn.classList.add('copy-btn--copied');
        setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copy-btn--copied');
        }, 2000);
    }).catch(() => {
        // Fallback
        textarea.select();
        document.execCommand('copy');
        btn.textContent = '✓ Copied!';
        btn.classList.add('copy-btn--copied');
        setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copy-btn--copied');
        }, 2000);
    });
}

// ── Toast Notifications ──────────────────────────────────────────────────

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<span>${icons[type] || ''}</span><span>${escapeHtml(message)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// ── Utilities ────────────────────────────────────────────────────────────

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatNumber(num) {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return String(num);
}

// ── Initial Status Check ─────────────────────────────────────────────────
(async function checkInitialStatus() {
    try {
        const response = await fetch('/api/status');
        const status = await response.json();

        if (status.resume_uploaded) {
            dropZone.classList.add('drop-zone--uploaded');
            dropIcon.innerHTML = '<i data-lucide="check-circle" style="width: 32px; height: 32px; color: var(--solo-blue);"></i>';
            dropZone.querySelector('.drop-zone__text').innerHTML =
                `<strong>${status.resume_file}</strong> — uploaded`;
            dropZone.querySelector('.drop-zone__hint').textContent =
                'Click to upload a different resume';
            huntBtn.disabled = false;
            huntBtn.innerHTML = '<i data-lucide="zap" style="width: 18px; height: 18px; fill: currentColor;"></i> Hunt for Gigs';

            statusDot.className = 'status-bar__dot status-bar__dot--active';
            statusText.textContent = 'Resume indexed — ready to hunt';
            chunksInfo.style.display = 'flex';
            chunksCount.textContent = status.chunks_count;

            // Show skills
            if (status.skills && status.skills.length > 0) {
                skillsContainer.innerHTML = '';
                status.skills.forEach((skill, i) => {
                    const tag = document.createElement('span');
                    tag.className = 'skill-tag';
                    tag.textContent = skill;
                    tag.style.animationDelay = `${i * 60}ms`;
                    skillsContainer.appendChild(tag);
                });
            }

            // Sync icons
            lucide.createIcons();

            // If pipeline was completed, load results
            if (status.status === 'complete') {
                await loadResults();
            } else if (status.status === 'hunting') {
                isHunting = true;
                huntBtn.disabled = true;
                huntBtn.innerHTML = '<i data-lucide="loader-2" class="spin" style="width: 18px; height: 18px;"></i> Hunting...';
                huntBtn.classList.add('hunt-btn--hunting');
                pipelineProgress.style.display = 'block';
                statusDot.className = 'status-bar__dot status-bar__dot--hunting';
                statusText.textContent = 'Hunt in progress...';
                startPolling();
                lucide.createIcons();
            }
        }
    } catch (e) {
        // API not ready yet — that's fine
    }
    lucide.createIcons(); // Initial load sync
})();
