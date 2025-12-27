/**
 * Course Data - Learn & Grow EdTech Platform
 * Detailed bilingual course information
 */

export interface Course {
  id: string;
  slug: string;
  category: string;
  duration: string;
  ageRange: string;
  level: string;
  icon: string;
  color: string;
  en: {
    title: string;
    tagline: string;
    overview: string;
    fullDescription: string;
    whoIsThisFor: string[];
    whatYouWillLearn: string[];
    features: string[];
    careerBenefits: string[];
    syllabus: {
      week: number;
      title: string;
      topics: string[];
    }[];
  };
  bn: {
    title: string;
    tagline: string;
    overview: string;
    fullDescription: string;
    whoIsThisFor: string[];
    whatYouWillLearn: string[];
    features: string[];
    careerBenefits: string[];
    syllabus: {
      week: number;
      title: string;
      topics: string[];
    }[];
  };
}

export const courses: Course[] = [
  {
    id: "robotics-arduino",
    slug: "robotics-with-arduino",
    category: "Robotics",
    duration: "8 weeks",
    ageRange: "10-16 years",
    level: "Beginner to Intermediate",
    icon: "🤖",
    color: "from-blue-500 to-cyan-500",
    en: {
      title: "Robotics with Arduino",
      tagline: "Build Real Robots & Learn Electronics",
      overview:
        "Master the fundamentals of robotics and electronics by building actual robots using Arduino. Students will learn circuit design, programming, and bring robots to life through hands-on projects.",
      fullDescription:
        "This comprehensive 8-week course transforms students into robot builders. Learn how to program Arduino boards, understand sensors, motors, and create interactive robotic projects. From blinking LEDs to autonomous robots, students will gain practical engineering skills.",
      whoIsThisFor: [
        "Students aged 10-16 interested in robotics",
        "Beginners with no prior coding experience",
        "Students who love building things",
        "Future engineers and makers",
      ],
      whatYouWillLearn: [
        "Arduino programming fundamentals (C/C++)",
        "Circuit design and electronics basics",
        "Sensor integration (ultrasonic, IR, temperature)",
        "Motor control and movement",
        "Build 5+ robotics projects",
        "Problem-solving through debugging",
        "Engineering design thinking",
      ],
      features: [
        "Live instructor-led sessions (2x per week)",
        "Arduino Uno kit delivered to your home",
        "Step-by-step project guides",
        "Weekly quizzes and assignments",
        "Final showcase project",
        "Digital certificate upon completion",
        "Lifetime access to course materials",
      ],
      careerBenefits: [
        "Foundation for robotics engineering careers",
        "Skills for IoT and embedded systems",
        "Problem-solving abilities valued in all STEM fields",
        "Portfolio projects for university applications",
        "Competitive edge in robotics competitions",
      ],
      syllabus: [
        {
          week: 1,
          title: "Introduction to Arduino & Electronics",
          topics: [
            "What is Arduino and how it works",
            "Setting up Arduino IDE",
            "First program: Blinking LED",
            "Understanding circuits and components",
          ],
        },
        {
          week: 2,
          title: "Digital Inputs & Outputs",
          topics: [
            "Using buttons and switches",
            "Traffic light system project",
            "Digital vs analog signals",
            "Building a reaction game",
          ],
        },
        {
          week: 3,
          title: "Sensors & Data",
          topics: [
            "Ultrasonic distance sensor",
            "Temperature and humidity sensing",
            "Reading sensor data",
            "Smart alarm system project",
          ],
        },
        {
          week: 4,
          title: "Motors & Movement",
          topics: [
            "DC motors and motor drivers",
            "Servo motors for precision",
            "Building a motorized vehicle",
            "Programming movement patterns",
          ],
        },
        {
          week: 5,
          title: "Line Following Robot",
          topics: [
            "IR sensors for line detection",
            "PID control basics",
            "Building the chassis",
            "Programming line following logic",
          ],
        },
        {
          week: 6,
          title: "Obstacle Avoidance",
          topics: [
            "Ultrasonic sensor integration",
            "Autonomous navigation",
            "Decision-making algorithms",
            "Building an exploring robot",
          ],
        },
        {
          week: 7,
          title: "Advanced Projects",
          topics: [
            "Bluetooth control via smartphone",
            "LCD display integration",
            "Multi-sensor systems",
            "Custom robot design",
          ],
        },
        {
          week: 8,
          title: "Final Project & Showcase",
          topics: [
            "Design your own robot",
            "Integration of multiple components",
            "Presentation skills",
            "Project demonstration and certification",
          ],
        },
      ],
    },
    bn: {
      title: "Arduino দিয়ে রোবটিক্স",
      tagline: "আসল রোবট তৈরি করুন ও ইলেকট্রনিক্স শিখুন",
      overview:
        "Arduino ব্যবহার করে আসল রোবট তৈরির মাধ্যমে রোবটিক্স এবং ইলেকট্রনিক্সের মূল বিষয়গুলো আয়ত্ত করুন। শিক্ষার্থীরা সার্কিট ডিজাইন, প্রোগ্রামিং শিখবে এবং হাতে-কলমে প্রজেক্টের মাধ্যমে রোবটকে জীবন্ত করে তুলবে।",
      fullDescription:
        "এই সম্পূর্ণ ৮ সপ্তাহের কোর্স শিক্ষার্থীদের রোবট নির্মাতায় রূপান্তরিত করে। Arduino বোর্ড প্রোগ্রাম করতে, সেন্সর, মোটর বুঝতে এবং ইন্টারেক্টিভ রোবটিক প্রজেক্ট তৈরি করতে শিখুন। LED জ্বালানো থেকে শুরু করে স্বয়ংক্রিয় রোবট পর্যন্ত, শিক্ষার্থীরা ব্যবহারিক ইঞ্জিনিয়ারিং দক্ষতা অর্জন করবে।",
      whoIsThisFor: [
        "রোবটিক্সে আগ্রহী ১০-১৬ বছর বয়সী শিক্ষার্থী",
        "কোডিং এর পূর্ব অভিজ্ঞতা ছাড়াই শুরু করতে পারবে",
        "যারা জিনিস বানাতে ভালোবাসে",
        "ভবিষ্যৎ ইঞ্জিনিয়ার এবং মেকার",
      ],
      whatYouWillLearn: [
        "Arduino প্রোগ্রামিং এর মূলনীতি (C/C++)",
        "সার্কিট ডিজাইন ও ইলেকট্রনিক্সের বেসিক",
        "সেন্সর ইন্টিগ্রেশন (আল্ট্রাসনিক, IR, তাপমাত্রা)",
        "মোটর নিয়ন্ত্রণ ও চলাচল",
        "৫+ রোবটিক্স প্রজেক্ট তৈরি করুন",
        "ডিবাগিং এর মাধ্যমে সমস্যা সমাধান",
        "ইঞ্জিনিয়ারিং ডিজাইন চিন্তাভাবনা",
      ],
      features: [
        "লাইভ ইন্সট্রাক্টর-নেতৃত্বাধীন সেশন (সপ্তাহে ২বার)",
        "Arduino Uno কিট বাসায় ডেলিভারি",
        "ধাপে ধাপে প্রজেক্ট গাইড",
        "সাপ্তাহিক কুইজ এবং অ্যাসাইনমেন্ট",
        "ফাইনাল শোকেস প্রজেক্ট",
        "সম্পন্নের পর ডিজিটাল সার্টিফিকেট",
        "কোর্স ম্যাটেরিয়ালে লাইফটাইম অ্যাক্সেস",
      ],
      careerBenefits: [
        "রোবটিক্স ইঞ্জিনিয়ারিং ক্যারিয়ারের ভিত্তি",
        "IoT এবং এম্বেডেড সিস্টেমের দক্ষতা",
        "সব STEM ক্ষেত্রে মূল্যবান সমস্যা সমাধান ক্ষমতা",
        "বিশ্ববিদ্যালয় আবেদনের জন্য পোর্টফোলিও প্রজেক্ট",
        "রোবটিক্স প্রতিযোগিতায় প্রতিযোগিতামূলক সুবিধা",
      ],
      syllabus: [
        {
          week: 1,
          title: "Arduino ও ইলেকট্রনিক্সের পরিচিতি",
          topics: [
            "Arduino কী এবং এটি কীভাবে কাজ করে",
            "Arduino IDE সেটআপ করা",
            "প্রথম প্রোগ্রাম: LED জ্বালানো",
            "সার্কিট ও কম্পোনেন্ট বোঝা",
          ],
        },
        {
          week: 2,
          title: "ডিজিটাল ইনপুট ও আউটপুট",
          topics: [
            "বাটন এবং সুইচ ব্যবহার",
            "ট্রাফিক লাইট সিস্টেম প্রজেক্ট",
            "ডিজিটাল বনাম অ্যানালগ সিগন্যাল",
            "রিঅ্যাকশন গেম তৈরি করা",
          ],
        },
        {
          week: 3,
          title: "সেন্সর ও ডেটা",
          topics: [
            "আল্ট্রাসনিক দূরত্ব সেন্সর",
            "তাপমাত্রা ও আর্দ্রতা সেন্সিং",
            "সেন্সর ডেটা পড়া",
            "স্মার্ট অ্যালার্ম সিস্টেম প্রজেক্ট",
          ],
        },
        {
          week: 4,
          title: "মোটর ও গতি",
          topics: [
            "DC মোটর এবং মোটর ড্রাইভার",
            "নির্ভুলতার জন্য সার্ভো মোটর",
            "মোটর চালিত গাড়ি তৈরি",
            "চলাচলের প্যাটার্ন প্রোগ্রামিং",
          ],
        },
        {
          week: 5,
          title: "লাইন ফলোয়িং রোবট",
          topics: [
            "লাইন শনাক্তকরণের জন্য IR সেন্সর",
            "PID নিয়ন্ত্রণের বেসিক",
            "চেসিস তৈরি করা",
            "লাইন ফলোয়িং লজিক প্রোগ্রামিং",
          ],
        },
        {
          week: 6,
          title: "বাধা এড়ানো",
          topics: [
            "আল্ট্রাসনিক সেন্সর ইন্টিগ্রেশন",
            "স্বয়ংক্রিয় নেভিগেশন",
            "সিদ্ধান্ত গ্রহণের অ্যালগরিদম",
            "অন্বেষণকারী রোবট তৈরি",
          ],
        },
        {
          week: 7,
          title: "উন্নত প্রজেক্ট",
          topics: [
            "স্মার্টফোনের মাধ্যমে ব্লুটুথ নিয়ন্ত্রণ",
            "LCD ডিসপ্লে ইন্টিগ্রেশন",
            "মাল্টি-সেন্সর সিস্টেম",
            "কাস্টম রোবট ডিজাইন",
          ],
        },
        {
          week: 8,
          title: "ফাইনাল প্রজেক্ট ও শোকেস",
          topics: [
            "নিজের রোবট ডিজাইন করুন",
            "একাধিক কম্পোনেন্টের ইন্টিগ্রেশন",
            "উপস্থাপনা দক্ষতা",
            "প্রজেক্ট প্রদর্শন ও সার্টিফিকেশন",
          ],
        },
      ],
    },
  },
  {
    id: "python-ai",
    slug: "coding-with-python-and-ai",
    category: "Programming",
    duration: "10 weeks",
    ageRange: "12-18 years",
    level: "Beginner to Advanced",
    icon: "🐍",
    color: "from-green-500 to-emerald-500",
    en: {
      title: "Coding with Python & AI",
      tagline: "Master Python & Build AI Applications",
      overview:
        "Learn Python programming from scratch and dive into Artificial Intelligence. Create chatbots, image recognizers, and intelligent applications using real AI tools and libraries.",
      fullDescription:
        "This 10-week intensive course takes students from Python basics to building real AI applications. Students will master programming fundamentals, data structures, and then explore machine learning concepts by creating practical AI projects.",
      whoIsThisFor: [
        "Students aged 12-18 interested in programming",
        "Complete beginners to coding",
        "Students curious about AI and machine learning",
        "Future software developers and data scientists",
      ],
      whatYouWillLearn: [
        "Python programming fundamentals",
        "Object-oriented programming concepts",
        "Working with data and files",
        "Introduction to AI and machine learning",
        "Using libraries like TensorFlow and scikit-learn",
        "Build chatbots and AI applications",
        "Real-world problem solving with code",
      ],
      features: [
        "Live coding sessions (2x per week)",
        "Interactive coding challenges",
        "10+ hands-on projects",
        "Weekly coding assignments",
        "AI toolkit and resources",
        "Industry-recognized certificate",
        "Portfolio of AI projects",
      ],
      careerBenefits: [
        "Foundation for software development careers",
        "Skills for AI/ML engineering roles",
        "Data science and analytics capabilities",
        "Competitive programming readiness",
        "University computer science preparation",
      ],
      syllabus: [
        {
          week: 1,
          title: "Python Basics",
          topics: [
            "Variables and data types",
            "Input/output",
            "Basic operations",
            "Your first Python program",
          ],
        },
        {
          week: 2,
          title: "Control Flow",
          topics: [
            "If-else statements",
            "Loops (for, while)",
            "Logical operators",
            "Interactive programs",
          ],
        },
        {
          week: 3,
          title: "Functions & Modules",
          topics: [
            "Defining functions",
            "Parameters and return values",
            "Importing modules",
            "Code organization",
          ],
        },
        {
          week: 4,
          title: "Data Structures",
          topics: [
            "Lists and tuples",
            "Dictionaries and sets",
            "String manipulation",
            "Data processing",
          ],
        },
        {
          week: 5,
          title: "Object-Oriented Programming",
          topics: [
            "Classes and objects",
            "Inheritance",
            "Encapsulation",
            "Building reusable code",
          ],
        },
        {
          week: 6,
          title: "Working with Files & APIs",
          topics: [
            "Reading/writing files",
            "JSON data",
            "API integration",
            "Web scraping basics",
          ],
        },
        {
          week: 7,
          title: "Introduction to AI",
          topics: [
            "What is AI and ML?",
            "Types of learning",
            "Data preparation",
            "First AI model",
          ],
        },
        {
          week: 8,
          title: "Machine Learning Basics",
          topics: [
            "Supervised learning",
            "Classification problems",
            "Using scikit-learn",
            "Model training and testing",
          ],
        },
        {
          week: 9,
          title: "AI Projects",
          topics: [
            "Building a chatbot",
            "Image classification",
            "Sentiment analysis",
            "Recommendation systems",
          ],
        },
        {
          week: 10,
          title: "Capstone Project",
          topics: [
            "Design your AI application",
            "Implementation",
            "Testing and refinement",
            "Final presentation",
          ],
        },
      ],
    },
    bn: {
      title: "Python ও AI দিয়ে কোডিং",
      tagline: "Python আয়ত্ত করুন ও AI অ্যাপ্লিকেশন তৈরি করুন",
      overview:
        "শূন্য থেকে Python প্রোগ্রামিং শিখুন এবং আর্টিফিশিয়াল ইন্টেলিজেন্সে ডুব দিন। আসল AI টুল ও লাইব্রেরি ব্যবহার করে চ্যাটবট, ইমেজ রিকগনাইজার এবং বুদ্ধিমান অ্যাপ্লিকেশন তৈরি করুন।",
      fullDescription:
        "এই ১০ সপ্তাহের ইনটেনসিভ কোর্স শিক্ষার্থীদের Python বেসিক থেকে শুরু করে আসল AI অ্যাপ্লিকেশন তৈরি পর্যন্ত নিয়ে যায়। শিক্ষার্থীরা প্রোগ্রামিং ফান্ডামেন্টাল, ডেটা স্ট্রাকচার আয়ত্ত করবে এবং তারপর ব্যবহারিক AI প্রজেক্ট তৈরির মাধ্যমে মেশিন লার্নিং ধারণা অন্বেষণ করবে।",
      whoIsThisFor: [
        "প্রোগ্রামিংয়ে আগ্রহী ১২-১৮ বছর বয়সী শিক্ষার্থী",
        "কোডিংয়ে সম্পূর্ণ নতুন",
        "AI এবং মেশিন লার্নিং সম্পর্কে কৌতূহলী শিক্ষার্থী",
        "ভবিষ্যৎ সফটওয়্যার ডেভেলপার এবং ডেটা সাইন্টিস্ট",
      ],
      whatYouWillLearn: [
        "Python প্রোগ্রামিং এর মূলনীতি",
        "অবজেক্ট-ওরিয়েন্টেড প্রোগ্রামিং কনসেপ্ট",
        "ডেটা ও ফাইলের সাথে কাজ করা",
        "AI এবং মেশিন লার্নিং এর পরিচিতি",
        "TensorFlow এবং scikit-learn লাইব্রেরি ব্যবহার",
        "চ্যাটবট এবং AI অ্যাপ্লিকেশন তৈরি",
        "কোড দিয়ে বাস্তব-বিশ্বের সমস্যা সমাধান",
      ],
      features: [
        "লাইভ কোডিং সেশন (সপ্তাহে ২বার)",
        "ইন্টারেক্টিভ কোডিং চ্যালেঞ্জ",
        "১০+ হাতে-কলমে প্রজেক্ট",
        "সাপ্তাহিক কোডিং অ্যাসাইনমেন্ট",
        "AI টুলকিট এবং রিসোর্স",
        "ইন্ডাস্ট্রি-স্বীকৃত সার্টিফিকেট",
        "AI প্রজেক্টের পোর্টফোলিও",
      ],
      careerBenefits: [
        "সফটওয়্যার ডেভেলপমেন্ট ক্যারিয়ারের ভিত্তি",
        "AI/ML ইঞ্জিনিয়ারিং রোলের দক্ষতা",
        "ডেটা সাইন্স ও অ্যানালিটিক্স সক্ষমতা",
        "প্রতিযোগিতামূলক প্রোগ্রামিং প্রস্তুতি",
        "বিশ্ববিদ্যালয়ে কম্পিউটার সাইন্সের প্রস্তুতি",
      ],
      syllabus: [
        {
          week: 1,
          title: "Python বেসিক",
          topics: [
            "ভেরিয়েবল এবং ডেটা টাইপ",
            "ইনপুট/আউটপুট",
            "বেসিক অপারেশন",
            "আপনার প্রথম Python প্রোগ্রাম",
          ],
        },
        {
          week: 2,
          title: "কন্ট্রোল ফ্লো",
          topics: [
            "If-else স্টেটমেন্ট",
            "লুপ (for, while)",
            "লজিক্যাল অপারেটর",
            "ইন্টারেক্টিভ প্রোগ্রাম",
          ],
        },
        {
          week: 3,
          title: "ফাংশন ও মডিউল",
          topics: [
            "ফাংশন ডিফাইন করা",
            "প্যারামিটার ও রিটার্ন ভ্যালু",
            "মডিউল ইম্পোর্ট করা",
            "কোড সংগঠন",
          ],
        },
        {
          week: 4,
          title: "ডেটা স্ট্রাকচার",
          topics: [
            "লিস্ট এবং টাপল",
            "ডিকশনারি ও সেট",
            "স্ট্রিং ম্যানিপুলেশন",
            "ডেটা প্রসেসিং",
          ],
        },
        {
          week: 5,
          title: "অবজেক্ট-ওরিয়েন্টেড প্রোগ্রামিং",
          topics: [
            "ক্লাস এবং অবজেক্ট",
            "ইনহেরিটেন্স",
            "এনক্যাপসুলেশন",
            "পুনরায় ব্যবহারযোগ্য কোড তৈরি",
          ],
        },
        {
          week: 6,
          title: "ফাইল ও API এর সাথে কাজ",
          topics: [
            "ফাইল রিড/রাইট করা",
            "JSON ডেটা",
            "API ইন্টিগ্রেশন",
            "ওয়েব স্ক্র্যাপিং বেসিক",
          ],
        },
        {
          week: 7,
          title: "AI এর পরিচিতি",
          topics: [
            "AI এবং ML কী?",
            "লার্নিং এর প্রকারভেদ",
            "ডেটা প্রস্তুতি",
            "প্রথম AI মডেল",
          ],
        },
        {
          week: 8,
          title: "মেশিন লার্নিং বেসিক",
          topics: [
            "সুপারভাইজড লার্নিং",
            "ক্ল্যাসিফিকেশন সমস্যা",
            "scikit-learn ব্যবহার",
            "মডেল ট্রেনিং ও টেস্টিং",
          ],
        },
        {
          week: 9,
          title: "AI প্রজেক্ট",
          topics: [
            "চ্যাটবট তৈরি করা",
            "ইমেজ ক্ল্যাসিফিকেশন",
            "সেন্টিমেন্ট অ্যানালাইসিস",
            "রিকমেন্ডেশন সিস্টেম",
          ],
        },
        {
          week: 10,
          title: "ক্যাপস্টোন প্রজেক্ট",
          topics: [
            "আপনার AI অ্যাপ্লিকেশন ডিজাইন করুন",
            "ইমপ্লিমেন্টেশন",
            "টেস্টিং ও রিফাইনমেন্ট",
            "ফাইনাল উপস্থাপনা",
          ],
        },
      ],
    },
  },
  {
    id: "math-coders",
    slug: "math-for-coders",
    category: "Mathematics",
    duration: "6 weeks",
    ageRange: "10-15 years",
    level: "Beginner",
    icon: "🔢",
    color: "from-purple-500 to-pink-500",
    en: {
      title: "Math for Coders",
      tagline: "Make Math Fun Through Coding",
      overview:
        "Discover how math powers all technology. Learn mathematical concepts through interactive coding projects. From geometry to algorithms, make math exciting and practical.",
      fullDescription:
        "This unique 6-week course transforms math from abstract concepts into exciting coding projects. Students visualize mathematical principles, create geometric art, and understand how math drives games, animations, and technology.",
      whoIsThisFor: [
        "Students aged 10-15 who find traditional math boring",
        "Learners who want to see math in action",
        "Students preparing for coding competitions",
        "Visual learners who love interactive content",
      ],
      whatYouWillLearn: [
        "Mathematical thinking through code",
        "Geometry and trigonometry concepts",
        "Algorithms and logic",
        "Pattern recognition",
        "Create mathematical art and games",
        "Problem-solving strategies",
        "Practical math applications",
      ],
      features: [
        "Visual and interactive lessons",
        "Math through games and animations",
        "Weekly challenge problems",
        "Project-based learning",
        "Digital certificate",
        "Fun math games to take home",
      ],
      careerBenefits: [
        "Strong foundation for competitive programming",
        "Better understanding of algorithms",
        "Improved logical thinking",
        "Confidence in math-related subjects",
        "Preparation for higher math courses",
      ],
      syllabus: [
        {
          week: 1,
          title: "Numbers & Patterns",
          topics: [
            "Number systems",
            "Sequences and patterns",
            "Creating pattern art",
            "Math puzzles",
          ],
        },
        {
          week: 2,
          title: "Geometry Through Code",
          topics: [
            "Shapes and coordinates",
            "Drawing with code",
            "Turtle graphics",
            "Geometric art",
          ],
        },
        {
          week: 3,
          title: "Angles & Animation",
          topics: [
            "Understanding angles",
            "Rotation and movement",
            "Animated shapes",
            "Simple physics",
          ],
        },
        {
          week: 4,
          title: "Logic & Algorithms",
          topics: [
            "Boolean logic",
            "Sorting algorithms",
            "Search algorithms",
            "Optimization",
          ],
        },
        {
          week: 5,
          title: "Probability & Randomness",
          topics: [
            "Random numbers",
            "Probability in games",
            "Simulations",
            "Dice and card games",
          ],
        },
        {
          week: 6,
          title: "Math Game Project",
          topics: [
            "Design a math game",
            "Combine all concepts",
            "User interface",
            "Share and present",
          ],
        },
      ],
    },
    bn: {
      title: "কোডারদের জন্য গণিত",
      tagline: "কোডিংয়ের মাধ্যমে গণিত মজাদার করুন",
      overview:
        "আবিষ্কার করুন কীভাবে গণিত সব প্রযুক্তিকে চালিত করে। ইন্টারেক্টিভ কোডিং প্রজেক্টের মাধ্যমে গাণিতিক ধারণা শিখুন। জ্যামিতি থেকে অ্যালগরিদম পর্যন্ত, গণিতকে উত্তেজনাপূর্ণ এবং ব্যবহারিক করে তুলুন।",
      fullDescription:
        "এই অনন্য ৬ সপ্তাহের কোর্স গণিতকে বিমূর্ত ধারণা থেকে উত্তেজনাপূর্ণ কোডিং প্রজেক্টে রূপান্তরিত করে। শিক্ষার্থীরা গাণিতিক নীতিগুলো দৃশ্যমান করে, জ্যামিতিক শিল্প তৈরি করে এবং বুঝতে পারে কীভাবে গণিত গেম, অ্যানিমেশন এবং প্রযুক্তি চালিত করে।",
      whoIsThisFor: [
        "১০-১৫ বছর বয়সী শিক্ষার্থী যারা ঐতিহ্যগত গণিত বিরক্তিকর মনে করে",
        "যারা গণিতকে কর্মরত দেখতে চায়",
        "কোডিং প্রতিযোগিতার জন্য প্রস্তুতি নিচ্ছে",
        "ভিজুয়াল লার্নার যারা ইন্টারেক্টিভ কন্টেন্ট পছন্দ করে",
      ],
      whatYouWillLearn: [
        "কোডের মাধ্যমে গাণিতিক চিন্তাভাবনা",
        "জ্যামিতি ও ত্রিকোণমিতি ধারণা",
        "অ্যালগরিদম এবং লজিক",
        "প্যাটার্ন রিকগনিশন",
        "গাণিতিক শিল্প ও গেম তৈরি করুন",
        "সমস্যা সমাধানের কৌশল",
        "ব্যবহারিক গণিত প্রয়োগ",
      ],
      features: [
        "ভিজুয়াল এবং ইন্টারেক্টিভ পাঠ",
        "গেম ও অ্যানিমেশনের মাধ্যমে গণিত",
        "সাপ্তাহিক চ্যালেঞ্জ সমস্যা",
        "প্রজেক্ট-ভিত্তিক শিক্ষা",
        "ডিজিটাল সার্টিফিকেট",
        "বাসায় নিয়ে যাওয়ার জন্য মজার গণিত গেম",
      ],
      careerBenefits: [
        "প্রতিযোগিতামূলক প্রোগ্রামিংয়ের শক্তিশালী ভিত্তি",
        "অ্যালগরিদমের ভালো বোঝাপড়া",
        "উন্নত লজিক্যাল চিন্তাভাবনা",
        "গণিত-সম্পর্কিত বিষয়ে আত্মবিশ্বাস",
        "উচ্চতর গণিত কোর্সের প্রস্তুতি",
      ],
      syllabus: [
        {
          week: 1,
          title: "সংখ্যা ও প্যাটার্ন",
          topics: [
            "সংখ্যা পদ্ধতি",
            "ক্রম এবং প্যাটার্ন",
            "প্যাটার্ন আর্ট তৈরি",
            "গণিত পাজল",
          ],
        },
        {
          week: 2,
          title: "কোডের মাধ্যমে জ্যামিতি",
          topics: [
            "আকার এবং স্থানাঙ্ক",
            "কোড দিয়ে আঁকা",
            "টার্টল গ্রাফিক্স",
            "জ্যামিতিক শিল্প",
          ],
        },
        {
          week: 3,
          title: "কোণ ও অ্যানিমেশন",
          topics: [
            "কোণ বোঝা",
            "ঘূর্ণন ও চলাচল",
            "অ্যানিমেটেড আকার",
            "সহজ পদার্থবিদ্যা",
          ],
        },
        {
          week: 4,
          title: "লজিক ও অ্যালগরিদম",
          topics: [
            "বুলিয়ান লজিক",
            "সর্টিং অ্যালগরিদম",
            "সার্চ অ্যালগরিদম",
            "অপটিমাইজেশন",
          ],
        },
        {
          week: 5,
          title: "সম্ভাবনা ও র্যান্ডমনেস",
          topics: [
            "র্যান্ডম নম্বর",
            "গেমে সম্ভাবনা",
            "সিমুলেশন",
            "পাশা এবং তাস খেলা",
          ],
        },
        {
          week: 6,
          title: "গণিত গেম প্রজেক্ট",
          topics: [
            "একটি গণিত গেম ডিজাইন করুন",
            "সব ধারণা একত্রিত করুন",
            "ইউজার ইন্টারফেস",
            "শেয়ার এবং উপস্থাপন",
          ],
        },
      ],
    },
  },
  {
    id: "science-lab",
    slug: "science-lab-at-home",
    category: "Science",
    duration: "4 weeks",
    ageRange: "8-14 years",
    level: "Beginner",
    icon: "🔬",
    color: "from-orange-500 to-red-500",
    en: {
      title: "Science Lab at Home",
      tagline: "Hands-On Science Experiments",
      overview:
        "Turn your home into a science lab! Conduct exciting experiments, learn scientific methods, and discover the science behind everyday phenomena. Perfect introduction to STEM for young minds.",
      fullDescription:
        "This 4-week intensive course brings science to life through hands-on experiments students can do at home. From basic chemistry to physics principles, students will explore, experiment, and develop scientific thinking.",
      whoIsThisFor: [
        "Curious students aged 8-14",
        "Young scientists who love experiments",
        "Students who learn best through doing",
        "Parents looking for engaging at-home activities",
      ],
      whatYouWillLearn: [
        "Scientific method and inquiry",
        "Basic chemistry and reactions",
        "Physics principles (motion, energy, light)",
        "Biology basics and life science",
        "Recording observations and data",
        "Critical thinking and analysis",
        "Safe experiment practices",
      ],
      features: [
        "Experiment kit delivered to home",
        "Live experiment sessions",
        "Step-by-step video guides",
        "Parent involvement activities",
        "Digital experiment journal",
        "Certificate of completion",
        "Safe, household materials",
      ],
      careerBenefits: [
        "Foundation for scientific careers",
        "Develops curiosity and wonder",
        "Better understanding of school science",
        "Improved observation skills",
        "Confidence in experimental work",
      ],
      syllabus: [
        {
          week: 1,
          title: "Chemistry Magic",
          topics: [
            "Acids and bases",
            "Chemical reactions",
            "Making slime (polymers)",
            "Color-changing experiments",
          ],
        },
        {
          week: 2,
          title: "Physics Fun",
          topics: [
            "Forces and motion",
            "Simple machines",
            "Light and mirrors",
            "Sound waves",
          ],
        },
        {
          week: 3,
          title: "Biology Basics",
          topics: [
            "Plant growth",
            "Microorganisms",
            "Human body systems",
            "Ecosystems",
          ],
        },
        {
          week: 4,
          title: "Final Science Fair",
          topics: [
            "Design your experiment",
            "Scientific presentation",
            "Document findings",
            "Share discoveries",
          ],
        },
      ],
    },
    bn: {
      title: "বাড়িতে সাইন্স ল্যাব",
      tagline: "হাতে-কলমে বিজ্ঞান পরীক্ষা",
      overview:
        "আপনার বাড়িকে একটি সাইন্স ল্যাবে পরিণত করুন! উত্তেজনাপূর্ণ পরীক্ষা-নিরীক্ষা করুন, বৈজ্ঞানিক পদ্ধতি শিখুন এবং দৈনন্দিন ঘটনার পিছনের বিজ্ঞান আবিষ্কার করুন। তরুণ মনের জন্য STEM এর নিখুঁত পরিচিতি।",
      fullDescription:
        "এই ৪ সপ্তাহের ইনটেনসিভ কোর্স শিক্ষার্থীরা বাড়িতে করতে পারে এমন হাতে-কলমে পরীক্ষার মাধ্যমে বিজ্ঞানকে জীবন্ত করে তোলে। বেসিক রসায়ন থেকে পদার্থবিদ্যার নীতি পর্যন্ত, শিক্ষার্থীরা অন্বেষণ করবে, পরীক্ষা করবে এবং বৈজ্ঞানিক চিন্তাভাবনা বিকশিত করবে।",
      whoIsThisFor: [
        "কৌতূহলী ৮-১৪ বছর বয়সী শিক্ষার্থী",
        "তরুণ বিজ্ঞানী যারা পরীক্ষা-নিরীক্ষা পছন্দ করে",
        "যারা কাজ করে সবচেয়ে ভালো শেখে",
        "বাড়িতে আকর্ষণীয় কার্যক্রম খুঁজছেন এমন অভিভাবক",
      ],
      whatYouWillLearn: [
        "বৈজ্ঞানিক পদ্ধতি ও অনুসন্ধান",
        "বেসিক রসায়ন এবং বিক্রিয়া",
        "পদার্থবিদ্যার নীতি (গতি, শক্তি, আলো)",
        "জীববিদ্যা বেসিক এবং জীবন বিজ্ঞান",
        "পর্যবেক্ষণ এবং ডেটা রেকর্ড করা",
        "সমালোচনামূলক চিন্তাভাবনা ও বিশ্লেষণ",
        "নিরাপদ পরীক্ষা পদ্ধতি",
      ],
      features: [
        "পরীক্ষা কিট বাসায় ডেলিভারি",
        "লাইভ পরীক্ষা সেশন",
        "ধাপে ধাপে ভিডিও গাইড",
        "অভিভাবক সম্পৃক্ততা কার্যক্রম",
        "ডিজিটাল পরীক্ষা জার্নাল",
        "সম্পন্নের সার্টিফিকেট",
        "নিরাপদ, গৃহস্থালি উপকরণ",
      ],
      careerBenefits: [
        "বৈজ্ঞানিক ক্যারিয়ারের ভিত্তি",
        "কৌতূহল ও বিস্ময় বিকশিত করে",
        "স্কুলের বিজ্ঞানের ভালো বোঝাপড়া",
        "উন্নত পর্যবেক্ষণ দক্ষতা",
        "পরীক্ষামূলক কাজে আত্মবিশ্বাস",
      ],
      syllabus: [
        {
          week: 1,
          title: "রসায়ন ম্যাজিক",
          topics: [
            "অ্যাসিড এবং বেস",
            "রাসায়নিক বিক্রিয়া",
            "স্লাইম তৈরি (পলিমার)",
            "রঙ পরিবর্তনের পরীক্ষা",
          ],
        },
        {
          week: 2,
          title: "পদার্থবিদ্যা মজা",
          topics: ["বল এবং গতি", "সরল যন্ত্র", "আলো এবং আয়না", "শব্দ তরঙ্গ"],
        },
        {
          week: 3,
          title: "জীববিদ্যা বেসিক",
          topics: [
            "উদ্ভিদ বৃদ্ধি",
            "অণুজীব",
            "মানব দেহের সিস্টেম",
            "ইকোসিস্টেম",
          ],
        },
        {
          week: 4,
          title: "ফাইনাল সাইন্স ফেয়ার",
          topics: [
            "আপনার পরীক্ষা ডিজাইন করুন",
            "বৈজ্ঞানিক উপস্থাপনা",
            "ফলাফল ডকুমেন্ট করুন",
            "আবিষ্কার শেয়ার করুন",
          ],
        },
      ],
    },
  },
];

export default courses;
