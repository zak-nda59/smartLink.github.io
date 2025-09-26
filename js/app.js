/**
 * SmartLink - Main JavaScript Application
 * Version: 1.0.0
 */

const CONFIG = {
    MAX_LINKS: 50, // Reasonable technical limit
    STORAGE_KEY: 'smartlink_data',
    STATS_KEY: 'smartlink_stats'
};

class SmartLinkApp {
    constructor() {
        this.currentUser = null;
        this.editMode = false;
        this.currentTheme = 'light';
        this.currentEditingLink = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.setupTheme();
        this.renderProfile();
        this.updateStats();
        document.body.classList.add('fade-in');
    }

    setupEventListeners() {
        const editToggle = document.getElementById('editModeToggle');
        const statsToggle = document.getElementById('statsToggle');
        const exportBtn = document.getElementById('exportData');
        const themeToggle = document.getElementById('themeToggle');
        const saveProfileBtn = document.getElementById('saveProfile');
        const addLinkBtn = document.getElementById('addLinkBtn');
        const addNewLinkBtn = document.getElementById('addNewLink');
        const saveLinkBtn = document.getElementById('saveLinkChanges');
        const deleteLinkBtn = document.getElementById('deleteLink');

        if (editToggle) editToggle.addEventListener('click', () => this.toggleEditMode());
        if (statsToggle) statsToggle.addEventListener('click', () => this.toggleStatsPanel());
        if (exportBtn) exportBtn.addEventListener('click', () => this.showImportExportModal());
        if (themeToggle) themeToggle.addEventListener('click', () => this.toggleTheme());
        if (saveProfileBtn) saveProfileBtn.addEventListener('click', () => this.saveProfile());
        if (addLinkBtn) addLinkBtn.addEventListener('click', () => this.showAddLinkModal());
        if (addNewLinkBtn) addNewLinkBtn.addEventListener('click', () => this.showAddLinkModal());
        if (saveLinkBtn) saveLinkBtn.addEventListener('click', () => this.saveLinkChanges());
        if (deleteLinkBtn) deleteLinkBtn.addEventListener('click', () => this.deleteCurrentLink());

        // Écouteurs pour les champs de profil
        ['editUsername', 'editDisplayName', 'editBioText', 'editAvatarUrl', 'editBannerUrl'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.addEventListener('input', () => this.previewProfileChanges());
        });

        // Écouteurs pour les thèmes
        const themeMode = document.getElementById('themeMode');
        const primaryColor = document.getElementById('primaryColor');
        if (themeMode) themeMode.addEventListener('change', (e) => this.setThemeMode(e.target.value));
        if (primaryColor) primaryColor.addEventListener('change', (e) => this.setPrimaryColor(e.target.value));

        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => this.applyThemePreset(e.target.dataset.theme));
        });
    }

    loadUserData() {
        try {
            const savedData = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (savedData) {
                this.currentUser = JSON.parse(savedData);
            } else {
                this.currentUser = {
                    username: 'username',
                    displayName: 'Your Name',
                    bio: 'Your personalized bio',
                    avatar: 'assets/images/default-avatar.svg',
                    banner: '',
                    theme: { mode: 'light', primary: '#0d6efd', preset: 'default' },
                    links: []
                };
                this.saveUserData();
            }
        } catch (error) {
            console.error('Loading error:', error);
        }
    }

    saveUserData() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.currentUser));
        } catch (error) {
            console.error('Save error:', error);
        }
    }

    setupTheme() {
        if (this.currentUser?.theme) {
            this.setThemeMode(this.currentUser.theme.mode);
            this.setPrimaryColor(this.currentUser.theme.primary);
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setThemeMode(newTheme);
    }

    setThemeMode(mode) {
        this.currentTheme = mode;
        document.documentElement.setAttribute('data-theme', mode);
        
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = mode === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        if (this.currentUser) {
            this.currentUser.theme.mode = mode;
            this.saveUserData();
        }
    }

    setPrimaryColor(color) {
        document.documentElement.style.setProperty('--primary-color', color);
        if (this.currentUser) {
            this.currentUser.theme.primary = color;
            this.saveUserData();
        }
    }

    applyThemePreset(themeName) {
        const themes = {
            default: '#0d6efd',
            sunset: '#ff6b6b',
            ocean: '#74b9ff',
            forest: '#00b894',
            purple: '#a29bfe'
        };
        
        if (themes[themeName]) {
            this.setPrimaryColor(themes[themeName]);
            const colorInput = document.getElementById('primaryColor');
            if (colorInput) colorInput.value = themes[themeName];
            
            document.querySelectorAll('.theme-option').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`[data-theme="${themeName}"]`)?.classList.add('active');
        }
    }

    renderProfile() {
        if (!this.currentUser) return;
        this.updateProfileInfo();
        this.updateProfileForm();
        this.renderLinks();
    }

    updateProfileInfo() {
        const profileName = document.getElementById('profileName');
        const profileBio = document.getElementById('profileBio');
        const profileAvatar = document.getElementById('profileAvatar');
        const profileBanner = document.getElementById('profileBanner');

        if (profileName) profileName.textContent = `@${this.currentUser.username}`;
        if (profileBio) profileBio.textContent = this.currentUser.bio;
        if (profileAvatar) {
            profileAvatar.src = this.currentUser.avatar;
            profileAvatar.alt = this.currentUser.displayName;
        }
        if (profileBanner && this.currentUser.banner) {
            profileBanner.style.backgroundImage = `url(${this.currentUser.banner})`;
        }
    }

    updateProfileForm() {
        const fields = {
            editUsername: this.currentUser.username,
            editDisplayName: this.currentUser.displayName,
            editBioText: this.currentUser.bio,
            editAvatarUrl: this.currentUser.avatar,
            editBannerUrl: this.currentUser.banner || '',
            themeMode: this.currentUser.theme.mode,
            primaryColor: this.currentUser.theme.primary
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        });
    }

    previewProfileChanges() {
        const username = document.getElementById('editUsername')?.value || this.currentUser.username;
        const bio = document.getElementById('editBioText')?.value || this.currentUser.bio;
        const avatar = document.getElementById('editAvatarUrl')?.value || this.currentUser.avatar;
        const banner = document.getElementById('editBannerUrl')?.value || this.currentUser.banner;

        const profileName = document.getElementById('profileName');
        const profileBio = document.getElementById('profileBio');
        const profileAvatar = document.getElementById('profileAvatar');
        const profileBanner = document.getElementById('profileBanner');

        if (profileName) profileName.textContent = `@${username}`;
        if (profileBio) profileBio.textContent = bio;
        if (profileAvatar && avatar) profileAvatar.src = avatar;
        if (profileBanner && banner) profileBanner.style.backgroundImage = `url(${banner})`;
    }

    saveProfile() {
        try {
            this.currentUser.username = document.getElementById('editUsername')?.value || this.currentUser.username;
            this.currentUser.displayName = document.getElementById('editDisplayName')?.value || this.currentUser.displayName;
            this.currentUser.bio = document.getElementById('editBioText')?.value || this.currentUser.bio;
            this.currentUser.avatar = document.getElementById('editAvatarUrl')?.value || this.currentUser.avatar;
            this.currentUser.banner = document.getElementById('editBannerUrl')?.value || '';

            this.saveUserData();
            this.renderProfile();
            this.showNotification('Profile saved!', 'success');
        } catch (error) {
            console.error('Profile save error:', error);
        }
    }

    renderLinks() {
        const container = document.getElementById('linksContainer');
        const editContainer = document.getElementById('editLinksContainer');
        
        if (container) {
            container.innerHTML = '';
            this.currentUser.links.forEach((link, index) => {
                container.appendChild(this.createLinkElement(link, index));
            });
        }

        if (editContainer) {
            editContainer.innerHTML = '';
            this.currentUser.links.forEach((link, index) => {
                editContainer.appendChild(this.createEditLinkElement(link, index));
            });
        }

        this.updateLinkLimits();
    }

    createLinkElement(link, index) {
        const linkEl = document.createElement('a');
        linkEl.className = `link-button ${this.getLinkClass(link)}`;
        linkEl.href = link.url;
        linkEl.target = '_blank';
        linkEl.rel = 'noopener noreferrer';
        
        linkEl.addEventListener('click', () => this.trackLinkClick(index));

        const icon = link.icon ? `<i class="${link.icon}"></i>` : '<i class="fas fa-link"></i>';
        const stats = this.editMode ? `<span class="link-stats">${this.getLinkClicks(index)} clics</span>` : '';
        
        linkEl.innerHTML = `
            ${this.editMode ? '<i class="fas fa-grip-vertical drag-handle"></i>' : ''}
            ${icon}
            ${link.title}
            ${stats}
        `;

        if (link.color) {
            linkEl.style.background = link.color;
            linkEl.style.color = 'white';
            linkEl.style.borderColor = 'transparent';
        }

        return linkEl;
    }

    createEditLinkElement(link, index) {
        const editEl = document.createElement('div');
        editEl.className = 'edit-link-item';
        editEl.innerHTML = `
            <i class="fas fa-grip-vertical drag-handle"></i>
            <div class="edit-link-info">
                <div class="edit-link-title">${link.title}</div>
                <div class="edit-link-url">${link.url}</div>
            </div>
            <div class="edit-link-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="smartLink.editLink(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="smartLink.deleteLink(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        return editEl;
    }

    getLinkClass(link) {
        if (link.type === 'social') {
            const platform = this.detectSocialPlatform(link.url);
            return platform ? `social-${platform}` : '';
        }
        return '';
    }

    detectSocialPlatform(url) {
        const platforms = {
            'instagram.com': 'instagram',
            'youtube.com': 'youtube',
            'youtu.be': 'youtube',
            'spotify.com': 'spotify',
            'twitter.com': 'twitter',
            'x.com': 'twitter',
            'linkedin.com': 'linkedin',
            'tiktok.com': 'tiktok',
            'facebook.com': 'facebook',
            'github.com': 'github'
        };

        for (const [domain, platform] of Object.entries(platforms)) {
            if (url.includes(domain)) return platform;
        }
        return null;
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        
        const editPanel = document.getElementById('editPanel');
        const statsPanel = document.getElementById('statsPanel');
        const editToggle = document.getElementById('editModeToggle');

        if (editPanel) editPanel.style.display = this.editMode ? 'block' : 'none';
        if (statsPanel) statsPanel.style.display = 'none';
        if (editToggle) {
            editToggle.innerHTML = this.editMode 
                ? '<i class="fas fa-eye me-1"></i>Mode Aperçu'
                : '<i class="fas fa-edit me-1"></i>Mode Édition';
        }

        this.renderLinks();
    }

    toggleStatsPanel() {
        const editPanel = document.getElementById('editPanel');
        const statsPanel = document.getElementById('statsPanel');
        
        if (editPanel) editPanel.style.display = 'none';
        if (statsPanel) {
            const isVisible = statsPanel.style.display === 'block';
            statsPanel.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) this.updateStats();
        }
    }

    showAddLinkModal() {
        if (!this.canAddMoreLinks()) {
            this.showNotification(`Technical limit of ${CONFIG.MAX_LINKS} links reached!`, 'warning');
            return;
        }

        this.currentEditingLink = null;
        this.resetLinkForm();
        const modal = new bootstrap.Modal(document.getElementById('linkEditModal'));
        modal.show();
    }

    editLink(index) {
        const link = this.currentUser.links[index];
        if (!link) return;

        this.currentEditingLink = index;
        this.populateLinkForm(link);
        const modal = new bootstrap.Modal(document.getElementById('linkEditModal'));
        modal.show();
    }

    deleteLink(index) {
        if (confirm('Delete this link?')) {
            this.currentUser.links.splice(index, 1);
            this.saveUserData();
            this.renderLinks();
            this.showNotification('Link deleted', 'success');
        }
    }

    deleteCurrentLink() {
        if (this.currentEditingLink !== null) {
            this.deleteLink(this.currentEditingLink);
            const modal = bootstrap.Modal.getInstance(document.getElementById('linkEditModal'));
            modal.hide();
        }
    }

    resetLinkForm() {
        ['linkTitle', 'linkUrl', 'linkIcon', 'linkColor'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = '';
        });
        
        const typeSelect = document.getElementById('linkType');
        if (typeSelect) typeSelect.value = 'default';
    }

    populateLinkForm(link) {
        const fields = {
            linkTitle: link.title,
            linkUrl: link.url,
            linkType: link.type || 'default',
            linkIcon: link.icon || '',
            linkColor: link.color || '#0d6efd'
        };

        Object.entries(fields).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field) field.value = value;
        });
    }

    saveLinkChanges() {
        const title = document.getElementById('linkTitle')?.value;
        const url = document.getElementById('linkUrl')?.value;
        const type = document.getElementById('linkType')?.value;
        const icon = document.getElementById('linkIcon')?.value;
        const color = document.getElementById('linkColor')?.value;

        if (!title || !url) {
            this.showNotification('Title and URL required', 'error');
            return;
        }

        const linkData = {
            title,
            url: this.formatUrl(url),
            type,
            icon: icon || this.getDefaultIcon(type, url),
            color: color !== '#0d6efd' ? color : null
        };

        if (this.currentEditingLink !== null) {
            this.currentUser.links[this.currentEditingLink] = linkData;
        } else {
            this.currentUser.links.push(linkData);
        }

        this.saveUserData();
        this.renderLinks();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('linkEditModal'));
        modal.hide();
        this.showNotification('Link saved', 'success');
    }

    formatUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
            return 'https://' + url;
        }
        return url;
    }

    getDefaultIcon(type, url) {
        const iconMap = {
            social: 'fas fa-share-alt',
            email: 'fas fa-envelope',
            phone: 'fas fa-phone',
            youtube: 'fab fa-youtube',
            spotify: 'fab fa-spotify'
        };
        return iconMap[type] || 'fas fa-link';
    }

    canAddMoreLinks() {
        return this.currentUser.links.length < CONFIG.MAX_LINKS;
    }

    updateLinkLimits() {
        // Plus de limites premium - fonction conservée pour compatibilité
        const upgradeNotice = document.getElementById('upgradeNotice');
        const addButtons = document.querySelectorAll('#addLinkBtn, #addNewLink');
        
        // Masquer toujours les notices d'upgrade
        if (upgradeNotice) upgradeNotice.style.display = 'none';
        addButtons.forEach(btn => { if (btn) btn.disabled = false; });
    }

    trackLinkClick(linkIndex) {
        try {
            const stats = this.getStats();
            const linkId = `link_${linkIndex}`;
            
            if (!stats.links[linkId]) {
                stats.links[linkId] = {
                    clicks: 0,
                    lastClick: null,
                    title: this.currentUser.links[linkIndex]?.title || 'Deleted link'
                };
            }
            
            stats.links[linkId].clicks++;
            stats.links[linkId].lastClick = new Date().toISOString();
            stats.totalClicks++;
            
            this.saveStats(stats);
        } catch (error) {
            console.error('Click tracking error:', error);
        }
    }

    getStats() {
        try {
            const savedStats = localStorage.getItem(CONFIG.STATS_KEY);
            return savedStats ? JSON.parse(savedStats) : { totalClicks: 0, links: {} };
        } catch (error) {
            return { totalClicks: 0, links: {} };
        }
    }

    saveStats(stats) {
        try {
            localStorage.setItem(CONFIG.STATS_KEY, JSON.stringify(stats));
        } catch (error) {
            console.error('Stats save error:', error);
        }
    }

    getLinkClicks(linkIndex) {
        const stats = this.getStats();
        return stats.links[`link_${linkIndex}`]?.clicks || 0;
    }

    updateStats() {
        const stats = this.getStats();
        const totalLinks = this.currentUser.links.length;
        const avgClicks = totalLinks > 0 ? Math.round(stats.totalClicks / totalLinks) : 0;

        const totalClicksEl = document.getElementById('totalClicks');
        const totalLinksEl = document.getElementById('totalLinks');
        const avgClicksEl = document.getElementById('avgClicks');

        if (totalClicksEl) totalClicksEl.textContent = stats.totalClicks;
        if (totalLinksEl) totalLinksEl.textContent = totalLinks;
        if (avgClicksEl) avgClicksEl.textContent = avgClicks;

        this.updateStatsTable(stats);
    }

    updateStatsTable(stats) {
        const tableBody = document.getElementById('statsTable');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        Object.entries(stats.links).forEach(([linkId, linkStats]) => {
            const row = document.createElement('tr');
            const lastClick = linkStats.lastClick 
                ? new Date(linkStats.lastClick).toLocaleDateString('fr-FR')
                : 'Jamais';
            
            row.innerHTML = `
                <td>${linkStats.title}</td>
                <td><span class="badge bg-primary">${linkStats.clicks}</span></td>
                <td>${lastClick}</td>
            `;
            tableBody.appendChild(row);
        });

        if (Object.keys(stats.links).length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="3" class="text-center text-muted">Aucune statistique</td>';
            tableBody.appendChild(row);
        }
    }

    showImportExportModal() {
        const modal = new bootstrap.Modal(document.getElementById('importExportModal'));
        modal.show();
    }

    exportData() {
        try {
            const exportData = {
                profile: this.currentUser,
                stats: this.getStats(),
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `smartlink-${this.currentUser.username}-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showNotification('Data exported!', 'success');
        } catch (error) {
            console.error('Export error:', error);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <i class="${iconMap[type] || iconMap.info} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => { if (notification.parentNode) notification.remove(); }, 5000);
    }
}

// Initialisation
let smartLink;
document.addEventListener('DOMContentLoaded', () => {
    smartLink = new SmartLinkApp();
    
    // QR Code
    if (document.getElementById('qrcode')) {
        generateQRCode();
    }
    
    // Export/Import listeners
    const downloadDataBtn = document.getElementById('downloadData');
    const downloadQRBtn = document.getElementById('downloadQR');
    
    if (downloadDataBtn) {
        downloadDataBtn.addEventListener('click', () => smartLink.exportData());
    }
    
    if (downloadQRBtn) {
        console.log('QR download button found, adding event...');
        downloadQRBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('QR download button click detected');
            downloadQRCode();
            smartLink.showNotification('QR Code downloaded!', 'success');
        });
    } else {
        console.error('QR download button not found');
    }

    // QR Code modal listeners
    const qrToggleBtn = document.getElementById('qrToggle');
    if (qrToggleBtn) {
        qrToggleBtn.addEventListener('click', () => {
            // Generate QR Code when modal opens
            setTimeout(() => {
                generateQRCode();
            }, 300); // Delay for modal to be visible
        });
    }

    // Generate QR Code when Bootstrap modal opens
    const qrModal = document.getElementById('qrModal');
    if (qrModal) {
        qrModal.addEventListener('shown.bs.modal', () => {
            setTimeout(() => {
                generateQRCode();
            }, 100); // Small delay to ensure modal is fully displayed
        });
    }

    // Scroll animations for homepage
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        initScrollAnimations();
        initCounterAnimations();
        // initTypingEffect(); // Disabled to avoid display issues
    }
});

/**
 * Initialisation des animations au scroll
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    // Ajouter la classe animate-on-scroll aux éléments
    const elementsToAnimate = document.querySelectorAll('.feature-card, .testimonial-card, .pricing-card, .demo-container');
    elementsToAnimate.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

/**
 * Animation des compteurs de statistiques
 */
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

/**
 * Animation d'un compteur
 */
function animateCounter(element) {
    const target = element.textContent;
    const isPercentage = target.includes('%');
    const isRating = target.includes('/');
    const isPlus = target.includes('+');
    
    let finalNumber;
    if (isRating) {
        finalNumber = parseFloat(target);
    } else {
        finalNumber = parseInt(target.replace(/[^\d]/g, ''));
    }
    
    let current = 0;
    const increment = finalNumber / 50; // 50 étapes d'animation
    const duration = 2000; // 2 secondes
    const stepTime = duration / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= finalNumber) {
            current = finalNumber;
            clearInterval(timer);
        }
        
        let displayValue;
        if (isRating) {
            displayValue = current.toFixed(1) + '/5';
        } else if (isPercentage) {
            displayValue = Math.floor(current) + '%';
        } else if (isPlus) {
            displayValue = Math.floor(current).toLocaleString() + '+';
        } else {
            displayValue = Math.floor(current).toLocaleString();
        }
        
        element.textContent = displayValue;
    }, stepTime);
}

/**
 * Effet de frappe pour le titre principal
 */
function initTypingEffect() {
    const titleElement = document.querySelector('.hero-title');
    if (!titleElement) return;

    const originalText = titleElement.innerHTML;
    titleElement.innerHTML = '';
    
    let i = 0;
    const typeWriter = () => {
        if (i < originalText.length) {
            titleElement.innerHTML += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    };
    
    // Démarrer l'effet après un délai
    setTimeout(typeWriter, 1000);
}

/**
 * Effet de parallaxe pour les particules du hero
 */
function initParallaxEffect() {
    const heroParticles = document.querySelector('.hero-particles');
    if (!heroParticles) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        heroParticles.style.transform = `translateY(${rate}px)`;
    });
}

// Initialiser l'effet parallaxe
document.addEventListener('DOMContentLoaded', () => {
    initParallaxEffect();
});

function generateQRCode() {
    const qrContainer = document.getElementById('qrcode');
    if (!qrContainer) {
        console.error('QR Code container not found');
        return;
    }

    // Clear container
    qrContainer.innerHTML = '';

    // Check if QRCode is available
    if (typeof QRCode === 'undefined') {
        qrContainer.innerHTML = '<p class="text-muted">QR Code library not loaded</p>';
        return;
    }
    
    // Profile URL
    const profileUrl = window.location.href.replace('#', '');
    
    // Create QR Code
    try {
        QRCode.toCanvas(qrContainer, profileUrl, {
            width: 200,
            height: 200,
            margin: 2,
            colorDark: '#000000',
            colorLight: '#ffffff',
            errorCorrectionLevel: 'M'
        }, (error) => {
            if (error) {
                console.error('QR Code generation error:', error);
                qrContainer.innerHTML = '<p class="text-muted">Error generating QR Code</p>';
            } else {
                console.log('QR Code generated successfully');
            }
        });
    } catch (error) {
        console.error('QR Code error:', error);
        qrContainer.innerHTML = '<p class="text-muted">Generation error</p>';
    }
}

function downloadQRCode() {
    console.log('Attempting QR Code download...');
    
    const canvas = document.querySelector('#qrcode canvas');
    if (canvas) {
        try {
            console.log('Canvas found, creating download link...');
            
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 10);
            link.download = `smartlink-qrcode-${timestamp}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            
            // More compatible alternative method
            if (link.href.startsWith('data:')) {
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('QR Code downloaded successfully');
                
                // Simple notification without dependency
                alert('QR Code downloaded successfully!');
            } else {
                throw new Error('Unable to generate download link');
            }
        } catch (error) {
            console.error('QR Code download error:', error);
            alert('Error downloading QR Code');
        }
    } else {
        console.error('No QR Code canvas found');
        alert('No QR Code to download. Please generate the QR Code first.');
    }
}
