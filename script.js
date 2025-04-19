document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const darkModeToggle = document.getElementById('darkModeToggle');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const toggleApiKeyBtn = document.getElementById('toggleApiKey');
    const apiKeyInput = document.getElementById('apiKey');
    const outputContainer = document.getElementById('outputContainer');
    const outputElement = document.getElementById('output');
    const loadingElement = document.getElementById('loading');
    const copyModal = document.getElementById('copyModal');
    const closeModalBtn = document.getElementById('closeModal');
    const aboutLink = document.getElementById('aboutLink');
    const aboutModal = document.getElementById('aboutModal');
    const closeAboutModalBtn = document.getElementById('closeAboutModal');
    const weeksDurationInput = document.getElementById('weeksDuration');
    
    // Check for dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Load saved API key if available
    if (localStorage.getItem('geminiApiKey')) {
        apiKeyInput.value = localStorage.getItem('geminiApiKey');
    }
    
    // Event Listeners
    darkModeToggle.addEventListener('click', toggleDarkMode);
    generateBtn.addEventListener('click', generateSyllabus);
    copyBtn.addEventListener('click', copySyllabusToClipboard);
    toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);
    closeModalBtn.addEventListener('click', () => copyModal.style.display = 'none');
    aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.style.display = 'flex';
    });
    closeAboutModalBtn.addEventListener('click', () => aboutModal.style.display = 'none');
    
    // API Key input change - save to localStorage
    apiKeyInput.addEventListener('change', () => {
        localStorage.setItem('geminiApiKey', apiKeyInput.value);
    });
    
    // Functions
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    function toggleApiKeyVisibility() {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleApiKeyBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            apiKeyInput.type = 'password';
            toggleApiKeyBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }
    
    async function generateSyllabus() {
        // Get input values
        const courseName = document.getElementById('courseName').value.trim();
        const courseCode = document.getElementById('courseCode').value.trim();
        const courseDescription = document.getElementById('courseDescription').value.trim();
        const discipline = document.getElementById('discipline').value.trim();
        const teachingStyle = document.getElementById('teachingStyle').value;
        const weeksDuration = weeksDurationInput.value.trim();
        const referenceContent = document.getElementById('referenceContent').value.trim();
        const apiKey = apiKeyInput.value.trim();
        
        // Validate inputs
        if (!courseName || !courseCode || !courseDescription || !discipline) {
            alert('Please fill in the required fields: Course Name, Course Code, Course Description, and Discipline.');
            return;
        }
        
        if (!weeksDuration || weeksDuration <= 0) {
            alert('Please enter a valid duration in weeks.');
            return;
        }
        
        if (!apiKey) {
            alert('Please enter your Gemini API Key.');
            return;
        }
        
        // Show loading
        loadingElement.style.display = 'block';
        outputElement.innerHTML = '';
        copyBtn.disabled = true;
        
        try {
            const response = await callGeminiAPI({
                courseName,
                courseCode,
                courseDescription,
                discipline,
                teachingStyle,
                weeksDuration,
                referenceContent,
                apiKey
            });
            
            // Display result
            outputElement.innerHTML = response;
            copyBtn.disabled = false;
        } catch (error) {
            outputElement.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        } finally {
            loadingElement.style.display = 'none';
        }
    }
    
    // Map teaching style values to descriptive text
    function getTeachingStyleDescription(style) {
        const styleDescriptions = {
            'lecture': 'Instructor delivers structured content through formal presentations while students take notes. Relies on clear explanations of concepts, organized visuals, and occasional student questions. Best for introducing foundational knowledge and theoretical frameworks to larger groups.',
            'case': 'Students analyze authentic scenarios to apply theoretical concepts to practical situations. Instructor facilitates critical analysis through guided questioning and structured frameworks. Develops problem-solving abilities, critical thinking, and professional judgment through realistic contextual learning.',
            'discussion': 'Instructor poses thought-provoking questions and moderates exchanges between students. Requires preparation of discussion prompts, strategic facilitation techniques, and clear expectations for participation. Builds critical thinking, communication skills, and diverse perspective appreciation.',
            'project': 'Students work individually or collaboratively on complex tasks resulting in tangible outcomes. Instructor provides initial guidance, milestone check-ins, and assessment rubrics. Develops practical skills, time management, and real-world application through sustained engagement with authentic challenges.',
            'flipped': 'Students engage with content independently before class (videos, readings) then participate in interactive activities during class time. Requires careful curation of pre-class materials and well-designed in-class application exercises. Maximizes face-to-face time for higher-order thinking and personalized guidance.',
            'hands-on': 'Students learn through direct manipulation of objects, tools, or processes in specialized environments. Instructor demonstrates techniques, supervises practice, and provides immediate feedback. Develops procedural knowledge, technical skills, and experiential understanding through structured practice.',
            'seminar': 'Students lead substantial portions of instruction through prepared presentations and facilitated discussions of advanced topics. Instructor establishes intellectual framework, provides expert guidance, and ensures scholarly rigor. Develops deep subject mastery, research skills, and professional discourse abilities.',
            'hybrid': 'Learning occurs through deliberate integration of online and in-person components with clear purpose for each modality. Requires thoughtful technology selection, seamless transitions between environments, and consistent engagement across platforms. Combines flexibility of digital learning with richness of face-to-face interaction.'
        };
        
        return styleDescriptions[style] || style;
    }
    
    async function callGeminiAPI({ courseName, courseCode, courseDescription, discipline, teachingStyle, weeksDuration, referenceContent, apiKey }) {
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent';
        
        const teachingStyleDescription = getTeachingStyleDescription(teachingStyle);
        
        const prompt = `
        Generate a comprehensive, world-class academic course syllabus in PDF-ready markdown format, adhering to the following specifications:

COURSE DETAILS:
- Course Name: ${courseName}
- Course Code: ${courseCode}
- Course Description: ${courseDescription}
- Academic Discipline: ${discipline}
- Teaching Style: ${teachingStyleDescription}
- Duration: ${weeksDuration} weeks
${referenceContent ? `- Reference Content: ${referenceContent}` : ''}

FORMATTING REQUIREMENTS:
- Use elegant, academic formatting consistent with top-tier global universities
- Main title: H1 heading (#) with course name and code
- Section headings: H2 headings (##)
- Subsection headings: H3 headings (###)
- Formatting: Use bold for important terms/policies, italics for emphasis
- Tables: Use standard markdown tables with clear column headers
- Create clear visual hierarchy with consistent spacing and organization
- Include notes on potential color formatting for Word (headings in navy/blue shades)
- Write in a style and approach that aligns with the specified teaching style (${teachingStyle})

REQUIRED STRUCTURAL ELEMENTS:

1. COURSE HEADER SECTION
- Course name and code (main title)
- Instructor placeholder with bracketed fields for customization
- Term/semester information
- Contact information and office hours placeholders
- Course website/LMS information

2. COURSE OVERVIEW (2 paragraphs)
- Begin with a compelling, intellectually stimulating opening quote or statement related to the field, and give a brief description of the author / speaker of that quote as it relates to the subject field.
- Articulate the course's relevance to both the discipline and broader intellectual/professional contexts
- Explain how the course fits within the program's curriculum
- Connect course concepts to real-world applications and contemporary challenges

3. COURSE OBJECTIVES AND LEARNING OUTCOMES (5-7 items)
- Use Bloom's taxonomy action verbs appropriate to the course level
- Include technical/domain-specific competencies AND transferable skills
- Ensure objectives are measurable, achievable, and clearly articulated
- Include both theoretical understanding and practical application components

4. TEACHING METHODOLOGY (detailed explanation)
- Describe pedagogical approach tailored to the specified teaching style (${teachingStyle})
- Explain rationale for methodology and its appropriateness to learning objectives
- Detail specific classroom activities and their educational purpose
- Include approximate time allocations for different activity types
- Specify any special tools, software, platforms, or resources students will need

5. ASSESSMENT STRUCTURE (detailed table and descriptions)
- Create a professional assessment table with columns: Assessment Type, Due Date, Weight (%), Group/Individual
- Include diverse assessment methods appropriate to the discipline and teaching style
- Provide detailed descriptions of each assessment component (purpose, format, expectations)
- Include rubric information or evaluation criteria
- Balance formative and summative assessments
- For major assessments, include detailed instructions and success criteria
- Final exam/project should be 25-30% of total grade

6. COURSE SCHEDULE (weekly breakdown)
- Provide a tabulated, detailed ${weeksDuration}-week schedule with specific dates/periods
- For each session/week include:
  * Topic title (descriptive and engaging)
  * Session learning objectives (2-3 specific, sharp objectives per session)
  * Session takeaways in a paragraph
  * Name all required readings with complete academic citations
  * Name all optional readings with complete academic citations
  * Preparation questions or activities
  * In-class activities
  * Name and details of Assignments to be completed post-session

7. REQUIRED MATERIALS AND RESOURCES
- List required textbooks with complete citations
- List required articles/readings with complete citations
- Detail any required software, equipment, or subscriptions
- Specify any required online resources or platforms

8. POLICIES AND EXPECTATIONS
- Include detailed, institutionally appropriate policies on:
  * Academic integrity and plagiarism
  * Attendance and participation
  * Late submissions and extensions
  * Technology use in class
  * Accommodations and accessibility
  * Communication expectations and response times
  * Student conduct and classroom environment

9. SUPPORT RESOURCES
- List academic support services
- Include mental health and wellbeing resources
- Mention technical support options
- Provide career/professional development resources relevant to the course

SYLLABUS CREATION GUIDELINES:

- Create a syllabus that exemplifies the highest standards of the specified academic discipline (${discipline})
- Ensure content is appropriate for the specified duration (${weeksDuration} weeks)
- Match depth and rigor to what would be expected at an Ivy League institution in this field
- If reference materials are provided, incorporate them appropriately into readings and content
- If no reference materials are provided, suggest highly respected, current, and accurate references in the field (NO FICTIONAL SOURCES)
- Tailor the academic tone and formatting to discipline-specific conventions
- Include discipline-appropriate terminology, methodologies, and assessment approaches
- For reading assignments, prioritize seminal works, recent significant contributions, and diverse perspectives
- Ensure all suggested readings and resources actually exist and are accurately cited
- Create a coherent progression of topics that builds knowledge systematically
- Balance theoretical foundations with practical applications
- Include opportunities for critical thinking, analysis, and synthesis
- Incorporate current developments and emerging trends in the field
- Ensure the overall syllabus reflects the teaching style specified (${teachingStyle})
DON'T WRITE  THE STARTING LINE AS '''markdown AND THEN END THE WHOLE THING WITH ''' TO SHOW MARKDOWN CODING. THE TEXT IS ALREADY WRITTEN IN MARKDOWN, THE LABELS AT TOP AND BOTTOM ARE NOT NEEDED. DO NOT WRITE ANY EXPLANATORY OR OTHER TEXT ABOVE OR BELOW THE ACTUAL SYLLABUS OUTPUT. NO TOKEN WASTAGE APART FROM TASK OUTPUT! YOU CAN NEVER LET ANY PART OF THE CONTENT FILLED WITH A CONTINUATION STATEMENT WITHOUT DOING YOUR WORK, YOU MUST ALWAYS GIVE THE FULL OUTPUT. DON'T SAY "FINISH THE REST OF IT LIKE I HAVE SHOWN" - INSTEAD, DO THE FULL THING.
The final syllabus should be comprehensive (3,000-4,000 words), intellectually rigorous, and exemplify the highest standards of pedagogical design in the discipline. It should appear as if created by a distinguished professor at a world-renowned institution.
        `;
        
        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ],
            generationConfig: {
                temperature: 1.0,
                maxOutputTokens: 20000,
            }
        };
        
        try {
            const response = await fetch(`${apiUrl}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API request failed');
            }
            
            const data = await response.json();
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response generated. Please try again.');
            }
            
            // Extract the text content from the response
            let textContent = '';
            
            data.candidates[0].content.parts.forEach(part => {
                if (part.text) {
                    textContent += part.text;
                }
            });
            
            return textContent;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    function copySyllabusToClipboard() {
        const textToCopy = outputElement.textContent;
        
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                copyModal.style.display = 'flex';
            })
            .catch((error) => {
                console.error('Failed to copy text:', error);
                alert('Failed to copy text to clipboard. Please try again or copy manually.');
            });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === copyModal) {
            copyModal.style.display = 'none';
        }
        if (event.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
    });
});
