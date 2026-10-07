import { TechnicalQuestion } from '../types';

export const LOCAL_TECHNICAL_QUESTIONS: TechnicalQuestion[] = [
  // --- Web Development & JavaScript ---
  {
    id: 'tech-web-1',
    domain: 'Web Development',
    category: 'JavaScript & Web Fundamentals',
    question: 'Explain the JavaScript Event Loop, Call Stack, Microtask queue, and Macrotask queue with an example.',
    expectedConcepts: ['event loop', 'call stack', 'microtask', 'macrotask', 'promises', 'settimeout', 'callback queue', 'single-threaded'],
    sampleAnswer: 'JavaScript is single-threaded. Synchronous code runs on the Call Stack. Asynchronous callbacks are queued in Microtask (Promises, MutationObserver, queueMicrotask) and Macrotask (setTimeout, setInterval, I/O) queues. The Event Loop prioritizes draining the microtask queue completely after each call stack tick before taking the next macrotask.',
    hint: 'Mention execution priority between setTimeout and Promise.resolve().',
    difficulty: 'Medium'
  },
  {
    id: 'tech-web-2',
    domain: 'Web Development',
    category: 'React Architecture',
    question: 'How does React\'s Virtual DOM reconciliation and the Fiber architecture work to optimize UI updates?',
    expectedConcepts: ['virtual dom', 'diffing algorithm', 'fiber', 'reconciliation', 'render phase', 'commit phase', 'keys', 'concurrency'],
    sampleAnswer: 'React maintains a lightweight in-memory Virtual DOM tree. During state changes, it creates a new VDOM tree and diffs it against the previous tree using heuristic O(n) algorithms (keyed lists, element types). Fiber breaks rendering into interruptible chunks across a priority queue before applying atomic mutations during the commit phase.',
    hint: 'Highlight why keys in lists prevent unnecessary DOM re-creation.',
    difficulty: 'Medium'
  },
  {
    id: 'tech-web-3',
    domain: 'Web Development',
    category: 'Web Performance & Security',
    question: 'What are CORS, CSRF, and XSS, and how do you protect a modern web application against them?',
    expectedConcepts: ['cors', 'csrf', 'xss', 'same-origin policy', 'cookies', 'samesite', 'csrf tokens', 'sanitization', 'content security policy'],
    sampleAnswer: 'CORS is a browser security mechanism based on Same-Origin Policy where servers declare authorized origins via headers. XSS happens when malicious scripts execute in user browsers, mitigated with CSP and sanitized inputs. CSRF tricks authenticated users into unintended actions, prevented with SameSite cookies and anti-CSRF tokens.',
    hint: 'Differentiate between cross-origin resource sharing vs injected script attacks.',
    difficulty: 'Hard'
  },

  // --- Python Developer ---
  {
    id: 'tech-py-1',
    domain: 'Python Developer',
    category: 'Python Internals',
    question: 'What is the Global Interpreter Lock (GIL) in CPython, and how does it impact multi-threaded CPU-bound programs?',
    expectedConcepts: ['gil', 'global interpreter lock', 'cpython', 'multithreading', 'multiprocessing', 'cpu-bound', 'i/o bound', 'race conditions'],
    sampleAnswer: 'The GIL is a mutex in CPython preventing multiple native threads from executing Python bytecodes simultaneously. It simplifies memory management and ref-counting. While threads speed up I/O-bound tasks, CPU-bound tasks do not gain multi-core speedup in threads; multiprocessing or asynchronous workers should be used instead.',
    hint: 'Distinguish between CPU-bound tasks vs I/O-bound tasks in Python.',
    difficulty: 'Medium'
  },
  {
    id: 'tech-py-2',
    domain: 'Python Developer',
    category: 'Advanced Python',
    question: 'Explain how Python decorators work, including closure mechanics and the `functools.wraps` utility.',
    expectedConcepts: ['decorators', 'closure', 'first-class functions', 'higher-order functions', 'functools.wraps', 'metadata', 'arguments'],
    sampleAnswer: 'Decorators are higher-order functions that accept a function and return an extended function closure. They wrap behavior before or after target execution. `functools.wraps` is vital to preserve original function docstrings, name, and parameter metadata.',
    hint: 'Explain what happens to `__name__` without functools.wraps.',
    difficulty: 'Medium'
  },

  // --- Java Developer ---
  {
    id: 'tech-java-1',
    domain: 'Java Developer',
    category: 'Java Core & Collections',
    question: 'How does Java HashMap handle hashing, collisions, bucket indexing, and treeification in Java 8+?',
    expectedConcepts: ['hashmap', 'hashcode', 'equals', 'bucket', 'collision', 'linkedlist', 'red-black tree', 'treeify', 'load factor'],
    sampleAnswer: 'HashMap computes bucket index using `(n - 1) & hash(key)`. Collisions are stored in linked lists. In Java 8, when a bucket exceeds 8 nodes and array capacity is at least 64, the bucket is transformed into a balanced Red-Black Tree, reducing lookup from O(n) to O(log n).',
    hint: 'Mention what happens when hash collisions reach the threshold of 8.',
    difficulty: 'Medium'
  },

  // --- Full Stack & Systems ---
  {
    id: 'tech-fs-1',
    domain: 'Full Stack Developer',
    category: 'Database & Architecture',
    question: 'Compare SQL (Relational) and NoSQL databases. When would you choose one over the other for a scalable system?',
    expectedConcepts: ['acid', 'sql', 'nosql', 'relational', 'scalability', 'horizontal', 'vertical', 'normalization', 'eventual consistency', 'schema'],
    sampleAnswer: 'SQL databases (PostgreSQL, MySQL) enforce strict schemas, relationships, and ACID compliance, ideal for transactional financial records and relational integrity. NoSQL databases (MongoDB, DynamoDB, Cassandra) provide flexible schemas and horizontal sharding, ideal for high-throughput distributed scale with eventual consistency.',
    hint: 'Discuss ACID transactions vs horizontal partitioning.',
    difficulty: 'Medium'
  },
  {
    id: 'tech-fs-2',
    domain: 'Full Stack Developer',
    category: 'API & Authentication',
    question: 'How does stateless JWT-based authentication work, and how do you handle token revocation or refresh flows securely?',
    expectedConcepts: ['jwt', 'access token', 'refresh token', 'stateless', 'signature', 'http-only cookies', 'revocation', 'expiry'],
    sampleAnswer: 'JWTs contain base64 encoded header, payload, and cryptographic signature. The server validates signatures without querying a session store. For security, short-lived access tokens are stored in memory while refresh tokens are stored in secure HttpOnly cookies with server-side revocation blacklists or rotating refresh families.',
    hint: 'Mention why access tokens should be short-lived and where refresh tokens should be stored.',
    difficulty: 'Medium'
  },

  // --- Core CS & Data Science ---
  {
    id: 'tech-cs-1',
    domain: 'General',
    category: 'Computer Science Fundamentals',
    question: 'Explain the fundamental differences between TCP and UDP protocols, and give appropriate use-cases for each.',
    expectedConcepts: ['tcp', 'udp', 'connection-oriented', 'connectionless', 'handshake', 'packet loss', 'retransmission', 'latency', 'streaming'],
    sampleAnswer: 'TCP is connection-oriented with 3-way handshake, guaranteed delivery, flow control, and retransmission, used for HTTP/HTTPS, SSH, and file transfers. UDP is connectionless and lightweight without retransmissions, ideal for low-latency live streaming, online gaming, and DNS lookups where speed outweighs occasional packet loss.',
    hint: 'Mention the 3-way handshake and retransmission mechanism.',
    difficulty: 'Easy'
  },
  {
    id: 'tech-ai-1',
    domain: 'AI/ML',
    category: 'Machine Learning Concepts',
    question: 'What is the Bias-Variance tradeoff, and how do techniques like regularization, pruning, and ensemble methods address it?',
    expectedConcepts: ['bias', 'variance', 'overfitting', 'underfitting', 'regularization', 'l1', 'l2', 'random forest', 'cross-validation'],
    sampleAnswer: 'High bias causes underfitting due to overly simplistic assumptions, while high variance causes overfitting by memorizing training noise. Techniques like L1/L2 regularization penalize large weights, dropout deactivates redundant neurons, and ensemble methods (bagging/boosting) average out variance or incrementally reduce bias.',
    hint: 'Connect high bias to underfitting and high variance to overfitting.',
    difficulty: 'Medium'
  }
];

export function getLocalTechnicalQuestions(domain?: string, count: number = 5): TechnicalQuestion[] {
  let pool = LOCAL_TECHNICAL_QUESTIONS;
  if (domain && domain !== 'General') {
    const domainSpecific = LOCAL_TECHNICAL_QUESTIONS.filter(
      q => q.domain.toLowerCase() === domain.toLowerCase()
    );
    if (domainSpecific.length > 0) {
      // Prioritize domain specific, pad with general
      const general = LOCAL_TECHNICAL_QUESTIONS.filter(q => q.domain === 'General' || q.domain === 'Full Stack Developer');
      pool = [...domainSpecific, ...general];
    }
  }

  // Shuffle and pick count
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
