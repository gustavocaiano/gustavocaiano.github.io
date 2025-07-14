// Language translations for the portfolio
const translations = {
    en: {
        title: "Gustavo Caiano | Computer Engineer",
        subtitle: "Computer Engineer | Laravel Developer",
        about: "About Me",
        aboutText: "Bachelor's degree in Computer Engineering from Instituto Superior de Engenharia do Porto (ISEP), currently completing a Master's degree in Software Engineering at the same institution. Developer focused on robust web applications and AI-based solutions, passionate about creating innovative digital experiences and solving complex technical challenges.",
        skills: "Skills",
        skillWeb: "Web Dev (My Strengths)",
        skillWebText: "Filament PHP (PHP and Laravel), REST APIs, Vue.js, React, Next.js",
        skillAI: "Artificial Intelligence",
        skillAIText: "Automatic Transcription, Natural Language Processing, AI Models",
        skillTools: "Tools & Technologies",
        skillToolsText: "Git, Docker, SQL, Tailwind CSS, HTML and CSS, JS and TS, Linux, AWS, SonarQube, Jenkins, Github Actions",
        skillSoftware: "Software Engineering",
        skillSoftwareText: "Design Patterns, Agile, CI/CD, Parallel Programming, Quality Testing, Microservices, Secure Software",
        workExperience: "Work Experience",
        jobTitle: "Mid-Level Developer",
        jobCompany: "NovaForensic",
        jobType: "Digital Forensics Company",
        jobCurrent: "Current Position",
        jobDescription: "Working as a developer at NovaForensic, specializing in digital forensics software solutions and applications, contributing to cutting-edge forensic technology development.",
        academic: "Academic Background",
        masterDegree: "Master's in Software Engineering",
        bachelorDegree: "Bachelor's in Computer Engineering",
        university: "Instituto Superior de Engenharia do Porto (ISEP)",
        inProgress: "In progress",
        completed: "Completed",
        howICanHelp: "How I Can Help",
        personalProjects: "Personal Projects",
        personalProjectsText: "Looking to bring your personal project to life? I can help you build modern web applications, from concept to deployment, using the latest technologies and best practices.",
        softwareConsulting: "Software Consulting",
        softwareConsultingText: "Need technical guidance or code review? I offer software consulting services to help optimize your existing projects, implement new features, or solve complex technical challenges.",
        getInTouch: "Get In Touch",
        firstName: "First Name",
        lastName: "Last Name",
        emailAddress: "Email Address",
        subject: "Subject",
        selectSubject: "Select a subject",
        personalProject: "Personal Project",
        jobOpportunity: "Job Opportunity",
        generalInquiry: "General Inquiry",
        message: "Message",
        messagePlaceholder: "Tell me about your project or inquiry...",
        sendMessage: "Send Message",
        sending: "Sending...",
        successMessage: "Thank you! Your message has been sent successfully. I'll get back to you soon.",
        errorMessage: "Sorry, there was an error sending your message. Please try again or contact me directly.",
        github: "GitHub",
        directEmail: "Direct Email",
        footerRights: "All rights reserved.",
        footerBuilt: "Built with passion and modern web technologies"
    },
    pt: {
        title: "Gustavo Caiano | Eng. Software",
        subtitle: "Eng. Software | Dev. Laravel",
        about: "Sobre Mim",
        aboutText: "Licenciatura em Engenharia Informática no Instituto Superior de Engenharia do Porto (ISEP), atualmente a completar o Mestrado em Engenharia de Software na mesma instituição. Desenvolvedor focado em aplicações web robustas e soluções baseadas em IA, apaixonado por criar experiências digitais inovadoras e resolver desafios técnicos complexos.",
        skills: "Competências",
        skillWeb: "Web Dev (Pontos Fortes)",
        skillWebText: "Filament PHP (PHP e Laravel), APIs REST, Vue.js, React, Next.js",
        skillAI: "Inteligência Artificial",
        skillAIText: "Transcrição Automática, Processamento de Linguagem Natural, Modelos de IA",
        skillTools: "Ferramentas e Tecnologias",
        skillToolsText: "Git, Docker, SQL, Tailwind CSS, HTML e CSS, JS e TS, Linux, AWS, SonarQube, Jenkins, Github Actions",
        skillSoftware: "Engenharia de Software",
        skillSoftwareText: "Padrões de Design, Agile, CI/CD, Programação Paralela, Testes de Qualidade, Microserviços, Software Seguro",
        workExperience: "Experiência Profissional",
        jobTitle: "Mid-Level Developer",
        jobCompany: "NovaForensic",
        jobType: "Empresa de Digital Forense",
        jobCurrent: "Posição Atual",
        jobDescription: "A trabalhar como desenvolvedor na NovaForensic, especializo-me em soluções de software de perícia digital e aplicações, contribuindo para o desenvolvimento de tecnologia forense de ponta.",
        academic: "Formação Académica",
        masterDegree: "Mestrado em Engenharia de Software",
        bachelorDegree: "Licenciatura em Engenharia Informática",
        university: "Instituto Superior de Engenharia do Porto (ISEP)",
        inProgress: "Em progresso",
        completed: "Concluído",
        howICanHelp: "Como Posso Ajudar",
        personalProjects: "Projetos Pessoais",
        personalProjectsText: "Quer dar vida ao seu projeto pessoal? Posso ajudá-lo a construir aplicações web modernas, desde o conceito até à implementação, usando as tecnologias mais recentes e as melhores práticas.",
        softwareConsulting: "Consultoria de Software",
        softwareConsultingText: "Precisa de orientação técnica ou revisão de código? Ofereço serviços de consultoria de software para ajudar a otimizar os seus projetos existentes, implementar novas funcionalidades ou resolver desafios técnicos complexos.",
        getInTouch: "Entre em Contacto",
        firstName: "Primeiro Nome",
        lastName: "Último Nome",
        emailAddress: "Endereço de Email",
        subject: "Assunto",
        selectSubject: "Selecione um assunto",
        personalProject: "Projeto Pessoal",
        jobOpportunity: "Oportunidade de Emprego",
        generalInquiry: "Consulta Geral",
        message: "Mensagem",
        messagePlaceholder: "Fale-me sobre o seu projeto ou consulta...",
        sendMessage: "Enviar Mensagem",
        sending: "Enviando...",
        successMessage: "Obrigado! A sua mensagem foi enviada com sucesso. Entrarei em contacto consigo em breve.",
        errorMessage: "Desculpe, houve um erro ao enviar a sua mensagem. Tente novamente ou contacte-me diretamente.",
        github: "GitHub",
        directEmail: "Email Direto",
        footerRights: "Todos os direitos reservados.",
        footerBuilt: "Construído com paixão e tecnologias web modernas"
    }
};

// Current language state
let currentLanguage = 'en';

// Function to get browser language
function getBrowserLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    return lang.startsWith('pt') ? 'pt' : 'en';
}

// Function to set language
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferred-language', lang);
    updatePageContent();
    updateLanguageSelector();
}

// Function to update page content
function updatePageContent() {
    const t = translations[currentLanguage];
    
    // Update title
    document.title = t.title;
    
    // Update all elements with data-translate attribute
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (t[key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = t[key];
            } else {
                element.textContent = t[key];
            }
        }
    });
}

// Function to update language selector
function updateLanguageSelector() {
    const selector = document.getElementById('languageSelector');
    if (selector) {
        selector.value = currentLanguage;
    }
}

// Initialize language system
function initializeLanguage() {
    // Get saved language or browser language
    const savedLanguage = localStorage.getItem('preferred-language');
    const browserLanguage = getBrowserLanguage();
    currentLanguage = savedLanguage || browserLanguage;
    
    // Update content
    updatePageContent();
    updateLanguageSelector();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { translations, setLanguage, initializeLanguage };
} 