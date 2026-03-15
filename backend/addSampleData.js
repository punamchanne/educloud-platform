import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Document from './models/Document.js';
import Meeting from './models/Meeting.js';
import User from './models/User.js';

dotenv.config();

const addSampleData = async () => {
  try {
    // Connect using default local MongoDB URI
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/educloud';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find a user to associate with documents and meetings
    const user = await User.findOne({ role: 'student' });
    if (!user) {
      console.log('No student user found. Please register a student first.');
      return;
    }

    console.log('Found user:', user.username);

    // Add sample documents
    const sampleDocuments = [
      {
        title: 'Introduction to Calculus - Limits and Derivatives',
        type: 'lesson_plan',
        subject: 'Mathematics',
        gradeLevel: '12',
        topic: 'Calculus Fundamentals',
        content: `CALCULUS LESSON PLAN: LIMITS AND DERIVATIVES

LEARNING OBJECTIVES:
By the end of this lesson, students will be able to:
- Understand the concept of limits
- Calculate basic limits using algebraic methods
- Define derivatives as limits of difference quotients
- Find derivatives of polynomial functions

LESSON STRUCTURE:

1. INTRODUCTION TO LIMITS (15 minutes)
   - Concept of approaching a value
   - Graphical interpretation of limits
   - Limit notation: lim(x→a) f(x) = L

2. CALCULATING LIMITS (20 minutes)
   - Direct substitution method
   - Factoring and canceling
   - Rationalization techniques
   
   Examples:
   a) lim(x→2) (x² + 3x - 1) = 9
   b) lim(x→3) (x² - 9)/(x - 3) = 6
   c) lim(h→0) (√(x+h) - √x)/h = 1/(2√x)

3. INTRODUCTION TO DERIVATIVES (15 minutes)
   - Definition as rate of change
   - Geometric interpretation as slope of tangent line
   - Difference quotient: [f(x+h) - f(x)]/h
   
4. DERIVATIVE FORMULAS (20 minutes)
   - Power rule: d/dx(x^n) = nx^(n-1)
   - Constant rule: d/dx(c) = 0
   - Sum rule: d/dx[f(x) + g(x)] = f'(x) + g'(x)
   
   Practice Problems:
   a) f(x) = x³ + 2x² - 5x + 1, find f'(x)
   b) g(x) = 4x⁵ - 3x² + 7, find g'(x)

5. REAL-WORLD APPLICATIONS (10 minutes)
   - Velocity as derivative of position
   - Marginal cost in economics
   - Growth rates in biology

ASSESSMENT:
- Exit ticket with 3 limit problems
- Homework: Practice worksheet with 15 problems
- Quiz next class on basic derivative rules

MATERIALS NEEDED:
- Graphing calculator or computer
- Graph paper
- Practice worksheets
- Interactive online graphing tool

DIFFERENTIATION STRATEGIES:
- Visual learners: Use graphs and diagrams
- Kinesthetic learners: Physical demonstrations of rate of change
- Advanced students: Introduction to L'Hôpital's rule
- Struggling students: Extra practice with basic algebraic manipulation`,
        duration: 80,
        requirements: 'Students should be comfortable with algebraic manipulation and basic function notation',
        generatedBy: user._id,
        tags: ['calculus', 'derivatives', 'limits', 'mathematics'],
        metadata: {
          difficulty: 'advanced',
          wordCount: 420,
          estimatedReadingTime: 3
        }
      },
      {
        title: 'Cell Division: Mitosis and Meiosis Study Guide',
        type: 'study_guide',
        subject: 'Biology',
        gradeLevel: '10',
        topic: 'Cell Division',
        content: `CELL DIVISION STUDY GUIDE: MITOSIS AND MEIOSIS

CHAPTER OVERVIEW:
Cell division is fundamental to life - it's how organisms grow, repair damage, and reproduce. There are two main types of cell division: mitosis (for growth and repair) and meiosis (for sexual reproduction).

PART 1: MITOSIS

WHAT IS MITOSIS?
Mitosis is the process by which a single cell divides to produce two identical diploid daughter cells. Each daughter cell has the same number of chromosomes as the parent cell.

PHASES OF MITOSIS:

1. PROPHASE
   - Chromatin condenses into visible chromosomes
   - Each chromosome consists of two sister chromatids
   - Nuclear envelope begins to break down
   - Centrioles move to opposite poles
   - Spindle fibers begin to form

2. METAPHASE
   - Chromosomes align at the cell's equator (metaphase plate)
   - Spindle fibers attach to kinetochores
   - Cell checkpoints ensure proper attachment

3. ANAPHASE
   - Sister chromatids separate and move to opposite poles
   - Spindle fibers shorten
   - Cell elongates

4. TELOPHASE
   - Nuclear envelopes reform around each set of chromosomes
   - Chromosomes begin to decondense
   - Spindle apparatus disassembles

5. CYTOKINESIS
   - Cytoplasm divides
   - In animal cells: contractile ring forms
   - In plant cells: cell plate forms

PART 2: MEIOSIS

WHAT IS MEIOSIS?
Meiosis is the process that produces four genetically different haploid gametes (sex cells) from one diploid parent cell. This reduction in chromosome number is essential for sexual reproduction.

KEY DIFFERENCES FROM MITOSIS:
- Produces 4 cells instead of 2
- Cells are haploid (n) instead of diploid (2n)
- Genetic variation through crossing over and independent assortment
- Two rounds of division (meiosis I and II)

MEIOSIS I (REDUCTION DIVISION):

Prophase I:
- Longest phase of meiosis
- Homologous chromosomes pair up (synapsis)
- Crossing over occurs between non-sister chromatids
- Creates genetic recombination

Metaphase I:
- Homologous pairs align at metaphase plate
- Independent assortment occurs

Anaphase I:
- Homologous chromosomes separate
- Sister chromatids remain together

Telophase I:
- Nuclear envelopes may reform
- Cytokinesis produces two haploid cells

MEIOSIS II (SIMILAR TO MITOSIS):
- Prophase II, Metaphase II, Anaphase II, Telophase II
- Sister chromatids separate
- Results in 4 haploid gametes

IMPORTANCE OF CELL DIVISION:

1. GROWTH
   - Multicellular organisms grow through mitosis
   - Increases cell number while maintaining cell size

2. REPAIR AND REPLACEMENT
   - Replace damaged or worn-out cells
   - Wound healing
   - Continuous replacement of skin, blood cells, etc.

3. REPRODUCTION
   - Asexual reproduction through mitosis
   - Sexual reproduction through meiosis
   - Maintains species chromosome number

GENETIC VARIATION IN MEIOSIS:

1. CROSSING OVER
   - Exchange of genetic material between homologous chromosomes
   - Occurs during prophase I
   - Creates new combinations of alleles

2. INDEPENDENT ASSORTMENT
   - Random orientation of chromosome pairs
   - 2^n possible combinations (n = haploid number)
   - For humans: 2^23 = 8.4 million possibilities

STUDY TIPS:
1. Draw and label diagrams of each phase
2. Use mnemonics: PMAT (Prophase, Metaphase, Anaphase, Telophase)
3. Compare and contrast mitosis vs. meiosis
4. Practice identifying phases in microscope images
5. Understand the biological significance of each process

COMMON EXAM QUESTIONS:
- Identify phases from diagrams
- Compare chromosome numbers before and after division
- Explain the importance of genetic variation
- Describe how errors in division can lead to genetic disorders

REVIEW VOCABULARY:
- Diploid (2n), Haploid (n)
- Chromatid, Chromosome, Homologous pair
- Kinetochore, Spindle fiber, Centromere
- Synapsis, Crossing over, Independent assortment`,
        duration: 0, // Self-paced
        requirements: 'Basic understanding of cell structure and DNA',
        generatedBy: user._id,
        tags: ['biology', 'cell division', 'mitosis', 'meiosis', 'genetics'],
        metadata: {
          difficulty: 'intermediate',
          wordCount: 650,
          estimatedReadingTime: 4
        }
      },
      {
        title: 'Shakespeare\'s Hamlet Character Analysis Worksheet',
        type: 'worksheet',
        subject: 'English',
        gradeLevel: '11',
        topic: 'Character Analysis',
        content: `HAMLET CHARACTER ANALYSIS WORKSHEET

NAME: _________________________ DATE: _____________

INSTRUCTIONS: Complete the following character analysis for William Shakespeare's "Hamlet." Use specific examples and quotes from the text to support your answers.

PART A: MAJOR CHARACTERS

1. HAMLET (Prince of Denmark)

a) Describe Hamlet's personality at the beginning of the play:
_________________________________________________________________
_________________________________________________________________

b) How does Hamlet's character develop throughout the play?
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

c) What internal conflicts does Hamlet face? List at least three:
   1. _____________________________________________________________
   2. _____________________________________________________________
   3. _____________________________________________________________

d) Find and write out ONE quote that best represents Hamlet's character:
Quote: "_______________________________________________________"
Act/Scene: ___________________
Explanation: ___________________________________________________
_________________________________________________________________

2. CLAUDIUS (King of Denmark, Hamlet's Uncle)

a) What are Claudius's main motivations in the play?
_________________________________________________________________
_________________________________________________________________

b) How does Shakespeare present Claudius as both a capable king and a villain?
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

c) Analyze Claudius's guilt. Find a quote showing his remorse:
Quote: "_______________________________________________________"
Act/Scene: ___________________

3. GERTRUDE (Queen of Denmark, Hamlet's Mother)

a) What role does Gertrude play in Hamlet's emotional turmoil?
_________________________________________________________________
_________________________________________________________________

b) Do you think Gertrude knew about Claudius's crime? Explain your reasoning:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

4. OPHELIA (Polonius's Daughter)

a) Trace Ophelia's transformation from Act I to Act IV:
Act I: _______________________________________________________
Act III: ____________________________________________________
Act IV: _____________________________________________________

b) What factors contribute to Ophelia's madness?
_________________________________________________________________
_________________________________________________________________

c) Compare and contrast Ophelia's madness with Hamlet's "antic disposition":
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

PART B: SUPPORTING CHARACTERS

5. POLONIUS (Lord Chamberlain)

Character traits: _____________________________________________
Role in the plot: ____________________________________________
Significance of his death: ___________________________________

6. LAERTES (Polonius's Son)

How does Laertes serve as a foil to Hamlet?
_________________________________________________________________
_________________________________________________________________

7. HORATIO (Hamlet's Friend)

What does Horatio represent in the play?
_________________________________________________________________

PART C: CHARACTER RELATIONSHIPS

8. Map the relationship dynamics:

HAMLET → CLAUDIUS: ___________________________________________
HAMLET → GERTRUDE: __________________________________________
HAMLET → OPHELIA: __________________________________________
CLAUDIUS → GERTRUDE: _______________________________________
POLONIUS → LAERTES: ________________________________________
POLONIUS → OPHELIA: ________________________________________

PART D: THEMATIC CONNECTIONS

9. How do the characters embody the major themes of the play?

REVENGE:
Which characters seek revenge? ________________________________
How do their approaches differ? ______________________________
_________________________________________________________________

MADNESS:
Real vs. feigned madness in the play: _________________________
_________________________________________________________________

CORRUPTION:
How does corruption affect different characters? _______________
_________________________________________________________________

PART E: CRITICAL ANALYSIS

10. CHARACTER COMPARISON CHART

Fill in the chart comparing Hamlet with another character of your choice:

                    HAMLET              OTHER CHARACTER: ____________

Motivation:      ________________    ____________________________

Methods:         ________________    ____________________________

Outcome:         ________________    ____________________________

Sympathy Level:  ________________    ____________________________

11. ESSAY QUESTION (Choose ONE):

a) Analyze how Hamlet's relationship with his mother influences his actions throughout the play.

b) Examine the role of women in Hamlet and how they are affected by the men around them.

c) Compare Hamlet and Laertes as avengers. What does Shakespeare suggest about revenge through these characters?

[Use back of sheet or additional paper for essay response]

PART F: REFLECTION

12. Which character do you find most interesting and why?
_________________________________________________________________
_________________________________________________________________

13. If you could give advice to any character in the play, who would it be and what would you tell them?
Character: ___________________________________________________
Advice: _____________________________________________________
_________________________________________________________________

14. What modern-day figure or character from another work reminds you of Hamlet? Explain the similarities:
_________________________________________________________________
_________________________________________________________________

BONUS QUESTION:
Research one film adaptation of Hamlet. How does the director's interpretation of a character differ from your reading of the text?
_________________________________________________________________
_________________________________________________________________

Remember to support all answers with specific textual evidence!`,
        duration: 50,
        requirements: 'Students should have read Acts I-V of Hamlet',
        generatedBy: user._id,
        tags: ['english', 'shakespeare', 'hamlet', 'character analysis', 'literature'],
        metadata: {
          difficulty: 'advanced',
          wordCount: 580,
          estimatedReadingTime: 3
        }
      }
    ];

    console.log('Adding sample documents...');
    await Document.deleteMany({ generatedBy: user._id }); // Clear existing
    await Document.insertMany(sampleDocuments);
    console.log('Sample documents added successfully!');

    // Add sample meetings
    const sampleMeetings = [
      {
        title: 'Advanced Mathematics - Calculus Review Session',
        description: 'Comprehensive review of limits, derivatives, and integration techniques before the final exam. Interactive problem-solving session.',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        scheduledTime: '10:00',
        duration: 90,
        type: 'classroom',
        status: 'scheduled',
        participants: ['Dr. Sarah Johnson', 'Mathematics Class 12A', 'Teaching Assistant'],
        location: 'Mathematics Lab - Room 203',
        meetingLink: 'https://meet.google.com/sni-ekey-jkk',
        organizer: user._id,
        createdBy: user._id,
        analytics: {
          attendanceRate: 0,
          engagementScore: 0,
          participantCount: 3
        }
      },
      {
        title: 'Biology Lab: Cell Division Microscopy',
        description: 'Hands-on laboratory session observing mitosis and meiosis under microscopes. Students will prepare slides and identify different phases.',
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        scheduledTime: '14:30',
        duration: 120,
        type: 'classroom',
        status: 'scheduled',
        participants: ['Prof. Michael Chen', 'Biology Class 10B', 'Lab Technician'],
        location: 'Biology Laboratory - Building B',
        meetingLink: 'https://meet.google.com/sni-ekey-jkk',
        organizer: user._id,
        createdBy: user._id,
        analytics: {
          attendanceRate: 0,
          engagementScore: 0,
          participantCount: 3
        }
      },
      {
        title: 'English Literature Discussion: Hamlet Analysis',
        description: 'Interactive discussion on character development and themes in Shakespeare\'s Hamlet. Students will present their character analysis findings.',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        scheduledTime: '11:15',
        duration: 60,
        type: 'classroom',
        status: 'scheduled',
        participants: ['Mrs. Elizabeth Smith', 'English Class 11A'],
        location: 'Literature Room - Room 105',
        meetingLink: 'https://meet.google.com/sni-ekey-jkk',
        organizer: user._id,
        createdBy: user._id,
        analytics: {
          attendanceRate: 0,
          engagementScore: 0,
          participantCount: 2
        }
      },
      {
        title: 'Parent-Teacher Conference - Academic Progress Review',
        description: 'Individual meeting to discuss academic performance, strengths, areas for improvement, and upcoming goals for the semester.',
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        scheduledTime: '16:00',
        duration: 30,
        type: 'parent_teacher',
        status: 'scheduled',
        participants: ['Class Teacher', 'Parents/Guardians'],
        location: 'Conference Room A - Administration Building',
        meetingLink: '',
        organizer: user._id,
        createdBy: user._id,
        analytics: {
          attendanceRate: 0,
          engagementScore: 0,
          participantCount: 2
        }
      },
      {
        title: 'Physics Workshop: Newton\'s Laws in Action',
        description: 'Interactive workshop demonstrating Newton\'s three laws of motion through practical experiments and real-world applications.',
        scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        scheduledTime: '13:00',
        duration: 75,
        type: 'training',
        status: 'completed',
        participants: ['Dr. Robert Physics', 'Physics Class 11', 'Guest Speaker'],
        location: 'Physics Laboratory - Room 301',
        meetingLink: 'https://meet.google.com/sni-ekey-jkk',
        organizer: user._id,
        createdBy: user._id,
        analytics: {
          attendanceRate: 94,
          engagementScore: 8.7,
          participantCount: 3,
          actualDuration: 78
        }
      }
    ];

    console.log('Adding sample meetings...');
    await Meeting.deleteMany({ createdBy: user._id }); // Clear existing
    await Meeting.insertMany(sampleMeetings);
    console.log('Sample meetings added successfully!');

    console.log('All sample data added successfully!');
    console.log('You can now test the Documents and Meetings features in the frontend.');
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

addSampleData();