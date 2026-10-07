export interface CompanyInterviewQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswerIndex?: number;
  type: 'multiple-choice' | 'textual' | 'coding-concept';
  category: string;
  expectedKeywords?: string[];
  explanation?: string;
}

export interface CompanyAssessment {
  companyId: string;
  companyName: string;
  type: string;
  overview: string;
  passingScore: number;
  durationMinutes: number;
  rounds: {
    roundName: string;
    description: string;
    weightage: string;
    questions: CompanyInterviewQuestion[];
  }[];
}

export const COMPANY_ASSESSMENTS: Record<string, CompanyAssessment> = {
  tcs: {
    companyId: 'tcs',
    companyName: 'TCS',
    type: 'Service-based',
    overview: 'TCS NQT mimics rigorous numerical ability, programming logic, verbal aptitude, and technical core rounds.',
    passingScore: 65,
    durationMinutes: 15,
    rounds: [
      {
        roundName: 'NQT Cognitive & Aptitude',
        description: 'Covers logical reasoning, numerical problem solving, and corporate reading comprehension.',
        weightage: '30%',
        questions: [
          {
            id: 'tcs-q1',
            type: 'multiple-choice',
            category: 'Numerical Ability',
            question: 'A train 180 meters long is running at a speed of 54 km/h. How many seconds will it take to pass a stationary pole?',
            options: ['10 seconds', '12 seconds', '14 seconds', '15 seconds'],
            correctAnswerIndex: 1,
            explanation: 'Speed = 54 * (5/18) = 15 m/s. Time = Distance / Speed = 180 / 15 = 12 seconds.'
          },
          {
            id: 'tcs-q2',
            type: 'multiple-choice',
            category: 'Programming Logic',
            question: 'In C/C++, what is the output of `printf("%d", sizeof(char))` on standard 32/64-bit architectures?',
            options: ['1', '2', '4', 'Depends on compiler word size'],
            correctAnswerIndex: 0,
            explanation: 'In C standard specifications, sizeof(char) is always guaranteed to be 1 byte.'
          },
          {
            id: 'tcs-q3',
            type: 'multiple-choice',
            category: 'Logical Reasoning',
            question: 'Pointing to a photograph, Rohit said, "She is the daughter of my grandfather\'s only son." How is the girl related to Rohit?',
            options: ['Sister', 'Mother', 'Cousin', 'Aunt'],
            correctAnswerIndex: 0,
            explanation: 'Rohit\'s grandfather\'s only son is Rohit\'s father. The daughter of Rohit\'s father is his sister.'
          }
        ]
      },
      {
        roundName: 'Technical & CS Fundamentals',
        description: 'Assesses relational database queries, OOP principles, and data structures.',
        weightage: '40%',
        questions: [
          {
            id: 'tcs-q4',
            type: 'multiple-choice',
            category: 'DBMS',
            question: 'Which normal form is specifically designed to eliminate transitive functional dependency in relational database schemas?',
            options: ['1NF', '2NF', '3NF', 'BCNF'],
            correctAnswerIndex: 2,
            explanation: '3NF removes transitive dependency where a non-prime attribute depends on another non-prime attribute.'
          },
          {
            id: 'tcs-q5',
            type: 'multiple-choice',
            category: 'Data Structures',
            question: 'What is the average time complexity of searching for an element in a balanced Binary Search Tree (AVL / Red-Black Tree)?',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
            correctAnswerIndex: 1,
            explanation: 'In balanced BSTs, height is constrained to O(log n), so search runs in O(log n).'
          }
        ]
      }
    ]
  },
  zoho: {
    companyId: 'zoho',
    companyName: 'Zoho',
    type: 'Product-based',
    overview: 'Zoho focuses deeply on pure algorithmic grit, pattern programming, pointer manipulation, and memory efficiency without external libraries.',
    passingScore: 70,
    durationMinutes: 15,
    rounds: [
      {
        roundName: 'Round 1: Written Programming Logic',
        description: 'Code snippets, pointer arithmetic, recursion tracing, and edge case reasoning.',
        weightage: '40%',
        questions: [
          {
            id: 'zoho-q1',
            type: 'multiple-choice',
            category: 'Syntax & Logic',
            question: 'What will be the result of `10 + "20" - 5` in JavaScript?',
            options: ['1015', '25', 'NaN', '1020 - 5'],
            correctAnswerIndex: 0,
            explanation: '10 + "20" evaluates to string "1020". Then "1020" - 5 uses numeric coercion to calculate 1015.'
          },
          {
            id: 'zoho-q2',
            type: 'multiple-choice',
            category: 'Bit Manipulation',
            question: 'How do you check if a non-zero integer `n` is a power of 2 using bitwise operations in O(1)?',
            options: ['(n & (n - 1)) === 0', '(n | (n - 1)) === 0', '(n ^ (n - 1)) === 0', '(n >> 1) === 0'],
            correctAnswerIndex: 0,
            explanation: 'Powers of 2 have only one set bit. Subtracting 1 flips all bits after that bit. `n & (n - 1)` equals 0.'
          },
          {
            id: 'zoho-q3',
            type: 'multiple-choice',
            category: 'String Manipulation',
            question: 'If you need to reverse a string in-place with O(1) auxiliary space, which technique is optimal?',
            options: ['Two-pointer swap from ends', 'Recursive call stack', 'Hash map indexing', 'Stack push-pop'],
            correctAnswerIndex: 0,
            explanation: 'Two pointers starting at left and right converging towards center swap characters in-place with O(1) memory.'
          }
        ]
      },
      {
        roundName: 'Round 2: Problem Solving & Edge Cases',
        description: 'Matrix traversal, string formatting, and algorithmic problem decomposition.',
        weightage: '60%',
        questions: [
          {
            id: 'zoho-q4',
            type: 'multiple-choice',
            category: 'Algorithms',
            question: 'What is the auxiliary space complexity of finding the longest palindromic substring using dynamic programming vs expand-around-center?',
            options: ['DP is O(n^2), Expand-around-center is O(1)', 'DP is O(1), Expand-around-center is O(n)', 'Both are O(n)', 'Both are O(1)'],
            correctAnswerIndex: 0,
            explanation: 'DP uses an n x n table (O(n^2) space), whereas expanding from each possible center uses O(1) extra space.'
          }
        ]
      }
    ]
  },
  accenture: {
    companyId: 'accenture',
    companyName: 'Accenture',
    type: 'Service-based',
    overview: 'Accenture evaluates cognitive aptitude, technical problem solving, abstract reasoning, and pseudo-code analysis.',
    passingScore: 60,
    durationMinutes: 15,
    rounds: [
      {
        roundName: 'Cognitive & Pseudo-Code Round',
        description: 'Analytical reasoning, code execution trace, and critical thinking.',
        weightage: '50%',
        questions: [
          {
            id: 'acc-q1',
            type: 'multiple-choice',
            category: 'Pseudo-Code',
            question: 'What is the value of `sum` after executing: `sum = 0; for i = 1 to 5: if i % 2 == 0 then sum = sum + i * 2 else sum = sum + i`?',
            options: ['17', '21', '23', '25'],
            correctAnswerIndex: 1,
            explanation: 'i=1 (odd): sum=1. i=2 (even): sum=1+4=5. i=3 (odd): sum=5+3=8. i=4 (even): sum=8+8=16. i=5 (odd): sum=16+5=21.'
          },
          {
            id: 'acc-q2',
            type: 'multiple-choice',
            category: 'Abstract Reasoning',
            question: 'Complete the series: 3, 7, 15, 31, 63, ?',
            options: ['125', '127', '129', '131'],
            correctAnswerIndex: 1,
            explanation: 'Each term is `2 * previous + 1`: 2*63 + 1 = 127.'
          }
        ]
      },
      {
        roundName: 'Cloud & Modern Tech Fundamentals',
        description: 'Microservices, RESTful design, API security, and deployment pipelines.',
        weightage: '50%',
        questions: [
          {
            id: 'acc-q3',
            type: 'multiple-choice',
            category: 'Cloud & Architecture',
            question: 'Which HTTP method should be used for updating part of an existing resource according to REST standards?',
            options: ['PUT', 'PATCH', 'POST', 'UPDATE'],
            correctAnswerIndex: 1,
            explanation: 'PATCH is standard for partial updates, while PUT is for complete replacement of a resource.'
          },
          {
            id: 'acc-q4',
            type: 'multiple-choice',
            category: 'DevOps & Version Control',
            question: 'What is the purpose of `git rebase` compared to `git merge`?',
            options: [
              'Rebase moves or combines commits to create a linear project history',
              'Rebase deletes old branches automatically',
              'Rebase always causes code loss',
              'There is no functional difference'
            ],
            correctAnswerIndex: 0,
            explanation: 'Git rebase reapplies commits on top of another base tip, maintaining a clean linear commit graph.'
          }
        ]
      }
    ]
  },
  google: {
    companyId: 'google',
    companyName: 'Google',
    type: 'Product-based',
    overview: 'Google assesses algorithmic excellence, computational complexity, distributed systems architecture, and scalable design principles.',
    passingScore: 75,
    durationMinutes: 20,
    rounds: [
      {
        roundName: 'Algorithms & Data Structures Round',
        description: 'Advanced graph algorithms, dynamic programming, and amortized complexity analysis.',
        weightage: '50%',
        questions: [
          {
            id: 'goog-q1',
            type: 'multiple-choice',
            category: 'Advanced Algorithms',
            question: 'Which algorithm finds single-source shortest paths in a directed graph with non-negative edge weights in O((V + E) log V) time?',
            options: ['Bellman-Ford', 'Dijkstra with Min-Heap', 'Floyd-Warshall', 'Breadth-First Search'],
            correctAnswerIndex: 1,
            explanation: 'Dijkstra implemented with a priority queue (min-heap) achieves O((V + E) log V).'
          },
          {
            id: 'goog-q2',
            type: 'multiple-choice',
            category: 'System Design',
            question: 'In large-scale distributed caching (e.g. Memcached, Redis clusters), what technique minimizes key remapping when cache servers scale dynamically?',
            options: ['Round-Robin Hashing', 'Consistent Hashing with Virtual Nodes', 'Modulo Sharding', 'Master-Slave Replication'],
            correctAnswerIndex: 1,
            explanation: 'Consistent Hashing places nodes and keys on a virtual ring, ensuring that adding or removing a node only migrates k/N keys.'
          }
        ]
      },
      {
        roundName: 'System Architecture & Engineering Depth',
        description: 'Distributed consensus, CAP theorem, fault tolerance, and concurrency models.',
        weightage: '50%',
        questions: [
          {
            id: 'goog-q3',
            type: 'multiple-choice',
            category: 'Distributed Systems',
            question: 'According to the CAP Theorem, in the presence of a network partition (P), a distributed system MUST choose between:',
            options: ['Consistency and Availability', 'Throughput and Latency', 'Scalability and Durability', 'Security and Performance'],
            correctAnswerIndex: 0,
            explanation: 'When network partitions occur, systems must choose between Consistency (CP) or Availability (AP).'
          },
          {
            id: 'goog-q4',
            type: 'multiple-choice',
            category: 'Concurrency',
            question: 'What is the purpose of an Optimistic Concurrency Control (OCC) mechanism using version numbers in high-throughput databases?',
            options: [
              'Acquire exclusive locks before reading rows',
              'Validate that records were not updated by another transaction between read and write before committing',
              'Block all other transactions permanently',
              'Disable ACID guarantees'
            ],
            correctAnswerIndex: 1,
            explanation: 'OCC avoids locking by checking row version numbers at commit time, aborting or retrying if a conflict is detected.'
          }
        ]
      }
    ]
  }
};

export function getCompanyAssessment(companyId: string): CompanyAssessment | null {
  return COMPANY_ASSESSMENTS[companyId.toLowerCase()] || null;
}
