(() => {
    'use strict';

    /* ------------------------------------------------------------------ *
     * Copy (EN / PT)
     * ------------------------------------------------------------------ */
    const T = {
        en: {
            subtitle: 'Software Engineer · AI Native · Product Engineer',
            hint: 'Look closely: a cabin, a signpost and a bald eagle are out there.',
            hintTouch: 'Drag sideways to look around, tap what you find.',
            close: 'Close',
            lblAbout: 'About me', lblProjects: 'Projects', lblContact: 'Say hello', footContact: 'Contact',
            aboutText: "Bachelor's degree in Computer Engineering from Instituto Superior de Engenharia do Porto (ISEP), currently completing a Master's degree in Software Engineering at the same institution. Software engineer, AI native and product engineer building robust web applications.",
            skills: 'My Specialties',
            skillWeb: 'Web Development', skillWebText: 'REST APIs, Vue.js, React, Next.js',
            skillArchitecture: 'Software Architecture', skillArchitectureText: 'Pragmatic modular design, layered architecture, design patterns, maintainable service boundaries',
            skillAI: 'AI Automation & Integration', skillAIText: 'Experience with AI automation in company workflows and integrating AI capabilities into services.',
            skillSecurity: 'Cybersecurity & Networks', skillSecurityText: 'Firewall Policies, VPNs, Network Security, Secure Software Development',
            skillTools: 'DevOps & Tools', skillToolsText: 'Git, Docker, Linux, AWS, CI/CD pipelines, SQL databases, testing workflows',
            skillSoftware: 'Software Engineering', skillSoftwareText: 'Agile Methodologies, Parallel Programming, Full-Stack Development',
            workExperience: 'Professional Experience', jobCurrent: 'Current Position', jobTitle: 'Software Engineer',
            jobType: 'Digital Forensics Company', jobDate: 'February 2024 - Present',
            jobDescription: 'Working as a software engineer at NovaForensic, developing and maintaining software that supports criminal investigations while also contributing to infrastructure, networking, development processes, CI/CD pipelines, and team training.',
            academic: 'Academic Background', masterDegree: "Master's in Software Engineering", bachelorDegree: "Bachelor's in Computer Engineering",
            university: 'Instituto Superior de Engenharia do Porto (ISEP)', inProgress: 'In progress', completed: 'Completed',
            projectsShowcase: 'Projects & Public Solutions',
            liveDemo: 'Live Demo', landing: 'Landing Page',
            howICanHelp: 'How I Can Help',
            personalProjects: 'Full-Stack Product Development',
            personalProjectsText: 'Need to launch a full-stack product, internal platform, or web service? I can help from architecture through deployment with a practical, maintainable approach.',
            softwareConsulting: 'Software Engineering Consulting',
            softwareConsultingText: 'Need support with architecture, code review, integrations, feature delivery, or development workflows? I provide practical software engineering consulting.',
            directEmail: 'Direct Email',
            getInTouch: 'Get In Touch', firstName: 'First Name', lastName: 'Last Name', emailAddress: 'Email Address',
            subject: 'Subject', selectSubject: 'Select or type a hiring/collaboration subject',
            subjects: ['Full-Stack Product Development', 'Software Engineering Consulting', 'Full-Stack / Software Engineering Role', 'Partnership or Hiring Inquiry'],
            message: 'Message', messagePlaceholder: 'Tell me about your project or inquiry...',
            sendMessage: 'Send Message', sending: 'Sending...',
            successMessage: "Thank you! Your message has been sent successfully. I'll get back to you soon.",
            errorMessage: 'Sorry, there was an error sending your message. Please try again or contact me directly.'
        },
        pt: {
            subtitle: 'Engenheiro de Software · AI Native · Product Engineer',
            hint: 'Olha com atenção: há uma cabana, um sinal e uma águia-careca por aí.',
            hintTouch: 'Arrasta para os lados e toca no que encontrares.',
            close: 'Fechar',
            lblAbout: 'Sobre mim', lblProjects: 'Projetos', lblContact: 'Diz olá', footContact: 'Contacto',
            aboutText: 'Licenciatura em Engenharia Informática no Instituto Superior de Engenharia do Porto (ISEP), atualmente a completar o Mestrado em Engenharia de Software na mesma instituição. Engenheiro de software, AI native e product engineer, a construir aplicações web robustas.',
            skills: 'As Minhas Especialidades',
            skillWeb: 'Desenvolvimento Web', skillWebText: 'APIs REST, Vue.js, React, Next.js',
            skillArchitecture: 'Arquitetura de Software', skillArchitectureText: 'Design modular pragmático, arquitetura em camadas, padrões de design, limites de serviços sustentáveis',
            skillAI: 'Automação e Integração com IA', skillAIText: 'Experiência em automação com IA em contextos empresariais e na integração de capacidades de IA em serviços.',
            skillSecurity: 'Cibersegurança & Redes', skillSecurityText: 'Políticas de Firewall, VPNs, Segurança de Rede, Desenvolvimento de Software Seguro',
            skillTools: 'DevOps & Ferramentas', skillToolsText: 'Git, Docker, Linux, AWS, pipelines CI/CD, bases de dados SQL, fluxos de testes',
            skillSoftware: 'Engenharia de Software', skillSoftwareText: 'Metodologias Ágeis, Programação Paralela, Desenvolvimento Full-Stack',
            workExperience: 'Experiência Profissional', jobCurrent: 'Posição Atual', jobTitle: 'Software Engineer',
            jobType: 'Empresa de Digital Forense', jobDate: 'Fevereiro 2024 - Presente',
            jobDescription: 'A trabalhar como engenheiro de software na NovaForensic, desenvolvendo e mantendo software de apoio à investigação criminal, contribuindo também para a infraestrutura, redes, processos de desenvolvimento, pipelines de CI/CD e formação técnica da equipa.',
            academic: 'Formação Académica', masterDegree: 'Mestrado em Engenharia de Software', bachelorDegree: 'Licenciatura em Engenharia Informática',
            university: 'Instituto Superior de Engenharia do Porto (ISEP)', inProgress: 'Em progresso', completed: 'Concluído',
            projectsShowcase: 'Projetos e Soluções Públicas',
            liveDemo: 'Ao Vivo', landing: 'Página de Apresentação',
            howICanHelp: 'Como Posso Ajudar',
            personalProjects: 'Desenvolvimento de Produtos Full-Stack',
            personalProjectsText: 'Precisa de lançar um produto full-stack, plataforma interna ou serviço web? Posso ajudar desde a arquitetura até à colocação em produção com uma abordagem prática e sustentável.',
            softwareConsulting: 'Consultoria em Engenharia de Software',
            softwareConsultingText: 'Precisa de apoio em arquitetura, revisão de código, integrações, entrega de funcionalidades ou melhoria de processos de desenvolvimento? Presto consultoria prática em engenharia de software.',
            directEmail: 'Email Direto',
            getInTouch: 'Entre em Contacto', firstName: 'Primeiro Nome', lastName: 'Último Nome', emailAddress: 'Endereço de Email',
            subject: 'Assunto', selectSubject: 'Selecione ou escreva um assunto de recrutamento/colaboração',
            subjects: ['Desenvolvimento de Produto Full-Stack', 'Consultoria em Engenharia de Software', 'Oportunidade para Função Full-Stack / Engenharia de Software', 'Parceria ou Consulta de Recrutamento'],
            message: 'Mensagem', messagePlaceholder: 'Fale-me sobre o seu projeto ou consulta...',
            sendMessage: 'Enviar Mensagem', sending: 'A enviar...',
            successMessage: 'Obrigado! A sua mensagem foi enviada com sucesso. Entrarei em contacto consigo em breve.',
            errorMessage: 'Desculpe, houve um erro ao enviar a sua mensagem. Tente novamente ou contacte-me diretamente.'
        }
    };

    let lang = 'en';
    if ((navigator.language || '').toLowerCase().startsWith('pt')) lang = 'pt';
    try { const s = localStorage.getItem('lang'); if (s === 'en' || s === 'pt') lang = s; } catch (_) {}

    /* ------------------------------------------------------------------ *
     * The landscape (img/valley.jpg, see tools/render-valley.mjs) and what
     * can be clicked in it. Positions are in the image's 1600x900 space and
     * come from `render-valley.mjs points`. The cabin and the signpost are
     * part of the render, so here they only get a hit area.
     * ------------------------------------------------------------------ */
    const NS = 'http://www.w3.org/2000/svg';
    const el = (tag, attrs = {}, parent) => {
        const n = document.createElementNS(NS, tag);
        for (const k in attrs) n.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(n);
        return n;
    };

    const things = document.getElementById('things');

    function hotspot({ target, label, x, y, w, h, art }) {
        const g = el('g', { class: 'hotspot', tabindex: 0, role: 'button', transform: `translate(${x} ${y})`, 'data-target': target, 'data-i18n-aria': label }, things);
        if (art) el('g', { class: 'art' }, g).innerHTML = art;
        else el('ellipse', { class: 'halo', cx: 0, cy: -h * 0.3, rx: w * 0.62, ry: h * 0.62 }, g);
        el('rect', { class: 'hit', x: -w / 2, y: -h * 0.8, width: w, height: h }, g);
        return g;
    }

    // Chimney smoke, drifting with the wind
    const smoke = el('g', { class: 'smoke', transform: 'translate(885.6 660)', filter: 'url(#smokeBlur)' }, things);
    for (let i = 0; i < 7; i++) el('circle', { r: 1.7, style: `animation-delay:${-i * 1.15}s` }, smoke);

    // Cabin — About me, experience and studies
    hotspot({ target: 'dlg-about', label: 'lblAbout', x: 876, y: 687, w: 72, h: 52 });

    // Signpost — Projects
    hotspot({ target: 'dlg-projects', label: 'lblProjects', x: 657, y: 845, w: 64, h: 78 });

    // Bald eagle — Contact: a small soaring silhouette, still until hovered.
    // Phones open at the cabin, so it flies in from the right edge there, with a target big enough for a finger.
    const sceneScale = Math.max(innerWidth / 1600, innerHeight / 900), touch = matchMedia('(pointer: coarse)').matches;
    hotspot({
        target: 'dlg-contact', label: 'lblContact', x: Math.min(1262, Math.round(876 + (innerWidth / 2 - 50) / sceneScale)), y: 226,
        w: touch ? 84 : 40, h: touch ? 64 : 30,
        art: `<g transform="rotate(-4)">
            <g transform="translate(2 -1)"><g class="wing r"><path fill="#33241a" d="M0 0C3-2 6-5 12-6.5L14-5.5 13-4.4 14.4-3.6C9-2 5 0 2 1.5Z"/></g></g>
            <path fill="#ece8df" d="M-9 1.4L-15.5 0.6-15 3.4-9.4 3.2Z"/>
            <path fill="#2b1d14" d="M-10 2C-5-.8 1-1.6 6-1.2 7 .6 3 2.6-2 3-5 3.2-8 2.8-10 2Z"/>
            <g transform="translate(1 0)"><g class="wing l"><path fill="#2b1d14" d="M1 0C-3-3-8-6-15-7L-17.4-5.6-15.6-4.8-17-3.6C-11-2-6 0-3 2Z"/></g></g>
            <path fill="#f4f0e7" d="M5-1.4C6.4-2.8 9-2.8 10.2-1.2 9.6.2 7 .6 5.4.2Z"/>
            <path fill="#e3ad1f" d="M10-1.8L12.2-.8 10.2-.4Z"/>
        </g>`
    });

    // On phones the scene is wider than the screen: start at the cabin
    const sceneEl = document.getElementById('scene');
    sceneEl.scrollLeft = Math.max(0, sceneEl.scrollWidth * (876 / 1600) - sceneEl.clientWidth / 2);

    /* ------------------------------------------------------------------ *
     * Lake: a small shader wobbles the rendered reflection, on the water only.
     * Without WebGL, or with reduced motion, the lake simply stays still.
     * ------------------------------------------------------------------ */
    (function lake() {
        const LAKE = { x: 371, y: 680, w: 1229, h: 159 }, HORIZON = 590;     // scene units, from `render-valley.mjs lake`
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const cv = document.createElement('canvas');
        const gl = cv.getContext('webgl', { antialias: false, depth: false, stencil: false });
        if (!gl) return;
        const load = (src) => new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = src; });
        const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };

        const program = gl.createProgram();
        gl.attachShader(program, shader(gl.VERTEX_SHADER, `
            attribute vec2 pos; varying vec2 uv;
            void main() { uv = vec2(0.5 + 0.5 * pos.x, 0.5 - 0.5 * pos.y); gl_Position = vec4(pos, 0.0, 1.0); }`));
        gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `
            precision highp float;
            varying vec2 uv; uniform sampler2D photo, mask; uniform float t;
            const vec4 L = vec4(${LAKE.x}.0, ${LAKE.y}.0, ${LAKE.w}.0, ${LAKE.h}.0);
            float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
            float noise(vec2 p) {
                vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
                return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
            }
            void main() {
                vec2 s = L.xy + uv * L.zw;
                float d = s.y - ${HORIZON}.0;
                vec2 g = vec2((s.x - 800.0) / d, 900.0 / d);                  // on the water plane, so ripples shrink with distance
                float w = (noise(g * vec2(3, 6) + vec2(0.3, 0.7) * t) + 0.5 * noise(g * vec2(7, 13) - vec2(0.2, 0.9) * t)) / 1.5 - 0.5;
                vec2 moved = uv + vec2(0.25, 1.0) * w * d * 0.022 / L.zw;
                vec2 at = mix(uv, moved, smoothstep(0.4, 0.9, texture2D(mask, moved).r));   // never pull the shore into the water
                gl_FragColor = vec4(texture2D(photo, at).rgb * (1.0 + w * 0.1), 1.0) * texture2D(mask, uv).r;
            }`));
        gl.linkProgram(program);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.bindAttribLocation(program, 0, 'pos');
        gl.linkProgram(program);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        const texture = (unit, source) => {
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
            for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
        };

        Promise.all([load('img/valley.jpg'), load('img/lake-mask.png')]).then(([photo, mask]) => {
            const crop = document.createElement('canvas'), k = photo.naturalWidth / 1600;
            crop.width = Math.round(LAKE.w * k); crop.height = Math.round(LAKE.h * k);
            crop.getContext('2d').drawImage(photo, LAKE.x * k, LAKE.y * k, LAKE.w * k, LAKE.h * k, 0, 0, crop.width, crop.height);
            texture(0, crop);
            texture(1, mask);
            gl.uniform1i(gl.getUniformLocation(program, 'photo'), 0);
            gl.uniform1i(gl.getUniformLocation(program, 'mask'), 1);
            const time = gl.getUniformLocation(program, 't');
            const draw = (now) => { gl.uniform1f(time, now / 1000); gl.drawArrays(gl.TRIANGLES, 0, 3); };

            // the same placement as the SVG's "xMidYMid slice"
            const svg = document.getElementById('mountain');
            const fit = () => {
                const W = svg.clientWidth, H = svg.clientHeight, s = Math.max(W / 1600, H / 900), q = Math.min(devicePixelRatio, 1.5);
                cv.style.left = (W - 1600 * s) / 2 + LAKE.x * s + 'px';
                cv.style.top = (H - 900 * s) / 2 + LAKE.y * s + 'px';
                cv.style.width = LAKE.w * s + 'px';
                cv.style.height = LAKE.h * s + 'px';
                cv.width = Math.round(LAKE.w * s * q); cv.height = Math.round(LAKE.h * s * q);
                gl.viewport(0, 0, cv.width, cv.height);
                draw(performance.now());
            };
            cv.id = 'lake';
            cv.setAttribute('aria-hidden', 'true');
            fit();
            svg.after(cv);
            addEventListener('resize', fit);

            // 30 frames a second is plenty for water, and none while a panel covers it
            let last = 0;
            requestAnimationFrame(function frame(now) {
                requestAnimationFrame(frame);
                if (now - last < 32 || document.querySelector('dialog[open]')) return;
                last = now;
                draw(now);
            });
        }).catch(() => {});
    })();

    /* ------------------------------------------------------------------ *
     * Dialogs
     * ------------------------------------------------------------------ */
    const openDialog = (id, from) => {
        const d = document.getElementById(id);
        if (!d) return;
        document.querySelectorAll('dialog[open]').forEach(o => o !== d && o.close());
        d._from = from;
        d.showModal();
    };
    document.addEventListener('click', (e) => {
        const opener = e.target.closest('[data-target]');
        if (opener) return openDialog(opener.dataset.target, opener);
        if (e.target.closest('[data-close]')) return e.target.closest('dialog').close();
        if (e.target.tagName === 'DIALOG') e.target.close(); // click on backdrop
    });
    document.addEventListener('keydown', (e) => {
        const hs = e.target.closest && e.target.closest('.hotspot');
        if (hs && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openDialog(hs.dataset.target, hs); }
    });
    document.querySelectorAll('dialog').forEach(d => d.addEventListener('close', () => d._from && d._from.focus && d._from.focus({ preventScroll: true })));

    /* ------------------------------------------------------------------ *
     * Language
     * ------------------------------------------------------------------ */
    function applyLang(l) {
        lang = l;
        const t = T[l];
        document.documentElement.lang = l;
        document.querySelectorAll('[data-i18n]').forEach(n => { if (t[n.dataset.i18n] != null) n.textContent = t[n.dataset.i18n]; });
        document.querySelectorAll('[data-i18n-ph]').forEach(n => { n.placeholder = t[n.dataset.i18nPh]; });
        document.querySelectorAll('[data-i18n-aria]').forEach(n => { n.setAttribute('aria-label', t[n.dataset.i18nAria]); });
        const dl = document.getElementById('subjects');
        dl.replaceChildren(...t.subjects.map(s => Object.assign(document.createElement('option'), { value: s })));
        document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
        document.title = l === 'pt' ? 'Gustavo Caiano | Engenheiro de Software' : 'Gustavo Caiano | Software Engineer';
        try { localStorage.setItem('lang', l); } catch (_) {}
    }
    document.querySelector('.lang').addEventListener('click', (e) => {
        const b = e.target.closest('button[data-lang]');
        if (b) applyLang(b.dataset.lang);
    });
    applyLang(lang);
    document.getElementById('year').textContent = new Date().getFullYear();

    /* ------------------------------------------------------------------ *
     * Contact form (EmailJS)
     * ------------------------------------------------------------------ */
    const EMAILJS = { publicKey: 'sAyrLoQJ3thC7v3qZ', serviceId: 'service_z2pbjvh', templateId: 'template_gun7e0j' };
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    const submit = document.getElementById('submitBtn');
    let emailReady = false;
    addEventListener('load', () => {
        if (window.emailjs) { try { emailjs.init(EMAILJS.publicKey); emailReady = true; } catch (_) {} }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const t = T[lang];
        status.className = '';
        status.textContent = '';
        submit.disabled = true;
        submit.textContent = t.sending;
        const f = new FormData(form);
        try {
            if (!emailReady) throw new Error('EmailJS not loaded');
            await emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, {
                firstName: f.get('firstName'), lastName: f.get('lastName'), email: f.get('email'),
                subject: f.get('subject'), message: f.get('message'), to_name: 'Gustavo Caiano'
            });
            status.className = 'ok';
            status.textContent = t.successMessage;
            form.reset();
        } catch (err) {
            console.error(err);
            status.className = 'err';
            status.textContent = t.errorMessage;
        } finally {
            submit.disabled = false;
            submit.textContent = t.sendMessage;
        }
    });
})();
