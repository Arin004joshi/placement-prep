const connectDb = require("../config/db");
const Question = require("../models/Question");
const Subject = require("../models/Subject");
const Subtopic = require("../models/Subtopic");
const Topic = require("../models/Topic");
const { createPromptHash } = require("../utils/normalizePrompt");

const subjects = [
  {
    name: "DBMS",
    description: "Database fundamentals, transactions, indexing, normalization, and SQL reasoning.",
    topics: [
      {
        title: "Database Basics",
        shortTheory: "Core database concepts, DBMS architecture, data models, and schema design foundations.",
        subtopics: [
          { title: "DBMS vs File System", shortTheory: "Why databases provide consistency, querying, concurrency, and recovery beyond files." },
          { title: "Data Models", shortTheory: "Relational, document, key-value, graph, and column-family data models." },
          { title: "Schema and Instance", shortTheory: "The difference between database structure and the current stored data." },
          { title: "Three-Schema Architecture", shortTheory: "External, conceptual, and internal levels of data abstraction." },
          { title: "Data Independence", shortTheory: "Logical and physical independence and why they matter in evolving systems." }
        ]
      },
      {
        title: "Relational Model",
        shortTheory: "Tables, rows, keys, constraints, and relational algebra form the base of SQL databases.",
        subtopics: [
          { title: "Relations, Tuples, and Attributes", shortTheory: "How relational databases represent entities and facts." },
          { title: "Candidate, Primary, and Foreign Keys", shortTheory: "Key types used to identify rows and model relationships." },
          { title: "Integrity Constraints", shortTheory: "Domain, entity, referential, and user-defined constraints." },
          { title: "Relational Algebra", shortTheory: "Selection, projection, join, union, difference, and rename operations." },
          { title: "Joins and Relationship Modeling", shortTheory: "One-to-one, one-to-many, and many-to-many relationships." }
        ]
      },
      {
        title: "SQL",
        shortTheory: "SQL is the practical language for querying, modifying, and controlling relational data.",
        subtopics: [
          { title: "DDL, DML, DCL, and TCL", shortTheory: "Create/alter tables, query/mutate rows, grant permissions, and manage transactions." },
          { title: "Filtering and Aggregation", shortTheory: "WHERE, GROUP BY, HAVING, aggregate functions, and query order." },
          { title: "Joins", shortTheory: "Inner, left, right, full, cross, and self joins." },
          { title: "Subqueries and CTEs", shortTheory: "Nested queries, correlated subqueries, and WITH clauses." },
          { title: "Window Functions", shortTheory: "Ranking, running totals, partitioned analytics, and interview SQL patterns." },
          { title: "Views and Stored Procedures", shortTheory: "Reusable database abstractions and server-side logic." }
        ]
      },
      {
        title: "Normalization",
        shortTheory: "Normalization reduces redundancy and update anomalies through functional dependency analysis.",
        subtopics: [
          { title: "Functional Dependencies", shortTheory: "Attribute dependency rules used to reason about schema quality." },
          { title: "1NF, 2NF, and 3NF", shortTheory: "Normal forms that progressively remove repeating groups and dependencies." },
          { title: "BCNF", shortTheory: "A stricter normal form where every determinant is a candidate key." },
          { title: "Decomposition", shortTheory: "Lossless join and dependency preservation tradeoffs." },
          { title: "Denormalization", shortTheory: "When controlled redundancy improves read performance." }
        ]
      },
      {
        title: "Transactions",
        shortTheory: "Transactions group database operations into reliable units using ACID guarantees.",
        subtopics: [
          {
            title: "ACID Properties",
            shortTheory: "Atomicity, consistency, isolation, and durability define reliable transaction behavior.",
            questions: [
              {
                type: "mcq",
                difficulty: "easy",
                title: "ACID property for all-or-nothing execution",
                prompt: "Which ACID property ensures that a transaction is executed completely or not at all?",
                options: [
                  { key: "A", text: "Atomicity", isCorrect: true },
                  { key: "B", text: "Isolation", isCorrect: false },
                  { key: "C", text: "Durability", isCorrect: false },
                  { key: "D", text: "Consistency", isCorrect: false }
                ],
                expectedAnswer: "Atomicity ensures all operations in a transaction complete or the transaction rolls back.",
                explanation: "Atomicity prevents partial updates from being committed.",
                commonMistakes: ["Confusing atomicity with durability."],
                followUps: [
                  {
                    question: "How is atomicity implemented in most database systems?",
                    expectedAnswer: "Using logs, rollback records, and transaction managers."
                  }
                ],
                tags: ["transactions", "acid"],
                concepts: ["atomicity"]
              }
            ]
          }
        ]
      },
      {
        title: "Concurrency Control",
        shortTheory: "Concurrency control keeps simultaneous transactions correct and isolated.",
        subtopics: [
          { title: "Schedules and Serializability", shortTheory: "Conflict and view serializability for correctness under concurrency." },
          { title: "Recoverable and Cascadeless Schedules", shortTheory: "Schedule properties that affect rollback and recovery safety." },
          { title: "Lock-Based Protocols", shortTheory: "Shared/exclusive locks and two-phase locking." },
          { title: "Deadlocks", shortTheory: "Deadlock prevention, detection, timeout, and wait-die/wound-wait schemes." },
          { title: "MVCC", shortTheory: "Multi-version concurrency control used by modern databases." }
        ]
      },
      {
        title: "Indexing and Query Optimization",
        shortTheory: "Indexes and optimizers make queries fast by reducing scanned data and choosing efficient plans.",
        subtopics: [
          { title: "B-Tree and B+ Tree Indexes", shortTheory: "Balanced tree structures commonly used for range and equality lookups." },
          { title: "Hash Indexes", shortTheory: "Fast equality lookup indexes with limited range-query support." },
          { title: "Clustered vs Non-Clustered Indexes", shortTheory: "How physical row ordering differs from secondary lookup structures." },
          { title: "Composite Indexes", shortTheory: "Multi-column indexes and left-prefix rules." },
          { title: "Query Execution Plans", shortTheory: "How databases estimate cost and choose scans, joins, and index usage." }
        ]
      },
      {
        title: "Storage and Recovery",
        shortTheory: "Databases persist data through pages, logs, checkpoints, and crash recovery protocols.",
        subtopics: [
          { title: "Storage Hierarchy", shortTheory: "Memory, disk, SSD, pages, blocks, and buffer management." },
          { title: "Write-Ahead Logging", shortTheory: "Logging changes before data pages are persisted." },
          { title: "Checkpoints", shortTheory: "Reducing crash recovery work through periodic durable snapshots." },
          { title: "Undo and Redo Recovery", shortTheory: "Rolling back incomplete work and replaying committed work." },
          { title: "RAID Basics", shortTheory: "Redundancy and performance tradeoffs in disk arrays." }
        ]
      },
      {
        title: "NoSQL and Distributed Databases",
        shortTheory: "Modern systems often combine relational and non-relational storage based on access patterns.",
        subtopics: [
          { title: "CAP Theorem", shortTheory: "Consistency, availability, and partition tolerance tradeoffs." },
          { title: "Consistency Models", shortTheory: "Strong, eventual, causal, and read-your-writes consistency." },
          { title: "Sharding and Replication", shortTheory: "Horizontal scaling and high availability patterns." },
          { title: "MongoDB Data Modeling", shortTheory: "Embedding vs referencing, indexes, and document schema design." },
          { title: "Choosing SQL vs NoSQL", shortTheory: "Tradeoffs based on transactions, query shape, scale, and flexibility." }
        ]
      }
    ]
  },
  {
    name: "OOPs",
    description: "Object-oriented principles including encapsulation, inheritance, abstraction, and polymorphism.",
    topics: [
      {
        title: "Core Principles",
        shortTheory: "OOP organizes software around objects that combine state and behavior.",
        subtopics: [
          { title: "Classes and Objects", shortTheory: "Blueprints and instances that model state and behavior." },
          { title: "Encapsulation", shortTheory: "Hiding internal state and exposing controlled behavior through methods." },
          { title: "Abstraction", shortTheory: "Modeling essential behavior while hiding implementation details." },
          { title: "Inheritance", shortTheory: "Reusing and extending behavior through parent-child relationships." },
          {
            title: "Polymorphism",
            shortTheory: "Polymorphism lets the same interface represent different concrete behaviors.",
            questions: [
              {
                type: "descriptive",
                difficulty: "easy",
                title: "Explain polymorphism",
                prompt: "What is polymorphism in object-oriented programming?",
                expectedAnswer: "Polymorphism allows code to work with objects through a common interface while each object provides its own behavior.",
                explanation: "Runtime polymorphism is commonly implemented through method overriding.",
                commonMistakes: ["Only mentioning overloading and ignoring overriding."],
                followUps: [
                  {
                    question: "What is the difference between overloading and overriding?",
                    expectedAnswer: "Overloading varies parameters in the same scope; overriding changes inherited behavior in a subclass."
                  }
                ],
                tags: ["oops", "polymorphism"],
                concepts: ["polymorphism"]
              }
            ]
          }
        ]
      },
      {
        title: "Object-Oriented Design",
        shortTheory: "OOD applies OOP principles to model maintainable, extensible software systems.",
        subtopics: [
          { title: "Composition vs Inheritance", shortTheory: "Choosing object collaboration over rigid class hierarchies when appropriate." },
          { title: "Association, Aggregation, and Composition", shortTheory: "Relationship strengths between objects." },
          { title: "Coupling and Cohesion", shortTheory: "Design quality measures for maintainable modules." },
          { title: "Interfaces and Abstract Classes", shortTheory: "Contracts and partial implementations for flexible design." },
          { title: "UML Class Diagrams", shortTheory: "Visual modeling for classes, relationships, and responsibilities." }
        ]
      },
      {
        title: "SOLID Principles",
        shortTheory: "SOLID principles guide extensible and testable object-oriented design.",
        subtopics: [
          { title: "Single Responsibility Principle", shortTheory: "A class should have one reason to change." },
          { title: "Open/Closed Principle", shortTheory: "Software entities should be open for extension and closed for modification." },
          { title: "Liskov Substitution Principle", shortTheory: "Subtypes should be substitutable for their base types." },
          { title: "Interface Segregation Principle", shortTheory: "Prefer small, client-specific interfaces." },
          { title: "Dependency Inversion Principle", shortTheory: "Depend on abstractions instead of concrete implementations." }
        ]
      },
      {
        title: "Design Patterns",
        shortTheory: "Design patterns are reusable solutions to common object-oriented design problems.",
        subtopics: [
          { title: "Singleton", shortTheory: "Ensuring one shared instance while understanding testability and concurrency concerns." },
          { title: "Factory and Abstract Factory", shortTheory: "Creating objects without tightly coupling callers to concrete classes." },
          { title: "Builder", shortTheory: "Constructing complex objects step by step." },
          { title: "Strategy", shortTheory: "Swapping algorithms behind a common interface." },
          { title: "Observer", shortTheory: "Notifying subscribers when state changes." },
          { title: "Decorator", shortTheory: "Adding behavior dynamically without changing the original object." }
        ]
      },
      {
        title: "Language Mechanics",
        shortTheory: "Interviewers often test how OOP features behave in real languages.",
        subtopics: [
          { title: "Method Overloading", shortTheory: "Same method name with different parameters." },
          { title: "Method Overriding", shortTheory: "Subclass-specific implementation of inherited behavior." },
          { title: "Constructors and Destructors", shortTheory: "Object initialization and cleanup behavior." },
          { title: "Access Modifiers", shortTheory: "Public, private, protected, and package/module-level visibility." },
          { title: "Static Members", shortTheory: "Class-level state and behavior shared across instances." }
        ]
      },
      {
        title: "Exception Handling",
        shortTheory: "Robust OOP code handles failure through clear exception models.",
        subtopics: [
          { title: "Checked vs Unchecked Exceptions", shortTheory: "Compile-time and runtime exception handling models." },
          { title: "Custom Exceptions", shortTheory: "Domain-specific failure representation." },
          { title: "Try-Catch-Finally", shortTheory: "Handling and cleanup control flow." },
          { title: "Exception Safety", shortTheory: "Keeping objects valid when operations fail." }
        ]
      },
      {
        title: "OOP Interview Design Problems",
        shortTheory: "Common machine-coding style problems test modeling, extensibility, and tradeoffs.",
        subtopics: [
          { title: "Parking Lot", shortTheory: "Vehicle, spot, ticket, payment, and allocation modeling." },
          { title: "Elevator System", shortTheory: "Requests, scheduling, direction, and state transitions." },
          { title: "Library Management", shortTheory: "Books, copies, members, reservations, and fines." },
          { title: "Chess", shortTheory: "Pieces, moves, board state, and validation rules." },
          { title: "Splitwise", shortTheory: "Users, groups, expenses, balances, and settlement." }
        ]
      }
    ]
  },
  {
    name: "OS",
    description: "Operating system concepts including processes, memory, synchronization, and scheduling.",
    topics: [
      {
        title: "Process Management",
        shortTheory: "An operating system creates, schedules, and coordinates processes and threads.",
        subtopics: [
          { title: "Process States", shortTheory: "New, ready, running, waiting, terminated, and state transitions." },
          { title: "Process Control Block", shortTheory: "Metadata the OS stores to manage a process." },
          { title: "Context Switching", shortTheory: "Saving and restoring execution state when switching processes." },
          { title: "System Calls", shortTheory: "Controlled entry points from user programs into the kernel." },
          {
            title: "Scheduling",
            shortTheory: "CPU scheduling decides which ready process runs next.",
            questions: [
              {
                type: "mcq",
                difficulty: "easy",
                title: "Preemptive scheduling",
                prompt: "Which scheduling style can interrupt a running process?",
                options: [
                  { key: "A", text: "Non-preemptive scheduling", isCorrect: false },
                  { key: "B", text: "Preemptive scheduling", isCorrect: true },
                  { key: "C", text: "Batch scheduling only", isCorrect: false },
                  { key: "D", text: "Manual scheduling", isCorrect: false }
                ],
                expectedAnswer: "Preemptive scheduling can interrupt a running process and move it back to the ready queue.",
                explanation: "Round Robin is a common preemptive scheduling algorithm.",
                commonMistakes: ["Assuming FCFS is preemptive."],
                followUps: [
                  {
                    question: "What tradeoff does preemption introduce?",
                    expectedAnswer: "It improves responsiveness but increases context-switch overhead."
                  }
                ],
                tags: ["os", "scheduling"],
                concepts: ["preemption"]
              }
            ]
          }
        ]
      },
      {
        title: "Threads and Concurrency",
        shortTheory: "Threads enable concurrent execution inside a process but require careful coordination.",
        subtopics: [
          { title: "Process vs Thread", shortTheory: "Address space, resource ownership, and scheduling differences." },
          { title: "User-Level vs Kernel-Level Threads", shortTheory: "Where thread management is implemented and its tradeoffs." },
          { title: "Multithreading Models", shortTheory: "Many-to-one, one-to-one, and many-to-many models." },
          { title: "Race Conditions", shortTheory: "Incorrect behavior from unsynchronized shared state." },
          { title: "Thread Pools", shortTheory: "Reusing worker threads to control overhead and throughput." }
        ]
      },
      {
        title: "CPU Scheduling",
        shortTheory: "Scheduling algorithms balance throughput, turnaround time, waiting time, fairness, and response time.",
        subtopics: [
          { title: "FCFS", shortTheory: "First-come-first-served scheduling and convoy effect." },
          { title: "SJF and SRTF", shortTheory: "Shortest job first and preemptive shortest remaining time first." },
          { title: "Round Robin", shortTheory: "Time-sliced scheduling for interactive systems." },
          { title: "Priority Scheduling", shortTheory: "Priority-based execution and starvation." },
          { title: "Multilevel Queue Scheduling", shortTheory: "Separate queues for different process classes." }
        ]
      },
      {
        title: "Synchronization",
        shortTheory: "Synchronization protects critical sections and coordinates concurrent work.",
        subtopics: [
          { title: "Critical Section Problem", shortTheory: "Mutual exclusion, progress, and bounded waiting." },
          { title: "Mutexes and Semaphores", shortTheory: "Locking primitives for exclusive access and signaling." },
          { title: "Monitors and Condition Variables", shortTheory: "Higher-level synchronization abstractions." },
          { title: "Producer Consumer", shortTheory: "Classic bounded-buffer coordination problem." },
          { title: "Readers Writers", shortTheory: "Balancing read concurrency with write exclusivity." },
          { title: "Dining Philosophers", shortTheory: "Deadlock and starvation in resource allocation." }
        ]
      },
      {
        title: "Deadlocks",
        shortTheory: "Deadlocks occur when processes wait forever for resources held by each other.",
        subtopics: [
          { title: "Necessary Conditions", shortTheory: "Mutual exclusion, hold and wait, no preemption, and circular wait." },
          { title: "Resource Allocation Graph", shortTheory: "Graph-based deadlock representation and cycle detection." },
          { title: "Deadlock Prevention", shortTheory: "Breaking one of the necessary conditions." },
          { title: "Deadlock Avoidance", shortTheory: "Banker's algorithm and safe states." },
          { title: "Deadlock Detection and Recovery", shortTheory: "Detecting cycles and recovering through termination or preemption." }
        ]
      },
      {
        title: "Memory Management",
        shortTheory: "Memory management maps virtual addresses to physical memory efficiently and safely.",
        subtopics: [
          { title: "Contiguous Allocation", shortTheory: "Fixed and variable partitions with fragmentation." },
          { title: "Paging", shortTheory: "Dividing memory into fixed-size pages and frames." },
          { title: "Segmentation", shortTheory: "Logical memory divisions such as code, stack, and heap." },
          { title: "Virtual Memory", shortTheory: "Using disk-backed address spaces larger than physical RAM." },
          { title: "Page Replacement", shortTheory: "FIFO, LRU, Optimal, and Clock replacement algorithms." },
          { title: "Thrashing", shortTheory: "Excessive paging caused by insufficient working-set memory." }
        ]
      },
      {
        title: "File Systems",
        shortTheory: "File systems organize persistent data through files, directories, metadata, and allocation policies.",
        subtopics: [
          { title: "File Attributes and Operations", shortTheory: "Metadata and common operations such as open, read, write, and close." },
          { title: "Directory Structures", shortTheory: "Single-level, two-level, tree, acyclic graph, and general graph directories." },
          { title: "File Allocation Methods", shortTheory: "Contiguous, linked, and indexed allocation." },
          { title: "Free Space Management", shortTheory: "Bitmaps, linked lists, grouping, and counting." },
          { title: "Journaling", shortTheory: "Maintaining consistency after crashes." }
        ]
      },
      {
        title: "I/O and Storage",
        shortTheory: "Operating systems manage devices, disks, and I/O scheduling for performance and reliability.",
        subtopics: [
          { title: "Device Drivers", shortTheory: "Kernel modules that abstract hardware operations." },
          { title: "Interrupts and DMA", shortTheory: "Efficient device communication mechanisms." },
          { title: "Disk Scheduling", shortTheory: "FCFS, SSTF, SCAN, C-SCAN, LOOK, and C-LOOK." },
          { title: "Buffering and Caching", shortTheory: "Reducing I/O latency and improving throughput." }
        ]
      }
    ]
  },
  {
    name: "MERN Stack",
    description: "MongoDB, Express, React, and Node concepts for full-stack product engineering interviews.",
    topics: [
      {
        title: "JavaScript Foundations",
        shortTheory: "Strong MERN interviews require solid JavaScript language and runtime understanding.",
        subtopics: [
          { title: "Scope and Closures", shortTheory: "Lexical scope, closure capture, and practical use cases." },
          { title: "Hoisting and Temporal Dead Zone", shortTheory: "How var, let, const, and function declarations are initialized." },
          { title: "Promises and Async Await", shortTheory: "Asynchronous control flow, error handling, and chaining." },
          { title: "Event Loop", shortTheory: "Call stack, task queue, microtasks, and rendering timing." },
          { title: "Prototypes and Classes", shortTheory: "Prototype inheritance and class syntax behavior." }
        ]
      },
      {
        title: "Node.js",
        shortTheory: "Node.js powers backend JavaScript with event-driven I/O and modular server design.",
        subtopics: [
          { title: "Node Runtime", shortTheory: "V8, libuv, event loop, and non-blocking I/O." },
          { title: "CommonJS and ES Modules", shortTheory: "Module systems, imports, exports, and interop." },
          { title: "Streams and Buffers", shortTheory: "Processing large data efficiently." },
          { title: "Error Handling", shortTheory: "Operational vs programmer errors and async error propagation." },
          { title: "Environment Configuration", shortTheory: "Managing secrets and environment-specific settings." }
        ]
      },
      {
        title: "Express Middleware",
        shortTheory: "Middleware functions process requests before they reach route handlers.",
        subtopics: [
          { title: "Request Response Lifecycle", shortTheory: "How Express routes, middleware, and handlers process HTTP requests." },
          { title: "Routing", shortTheory: "Route parameters, query strings, nested routers, and route organization." },
          { title: "Error Middleware", shortTheory: "Centralized error handling for async and sync failures." },
          {
            title: "Auth Middleware",
            shortTheory: "Auth middleware validates identity and attaches user context to the request.",
            questions: [
              {
                type: "conceptual",
                difficulty: "easy",
                title: "JWT middleware responsibility",
                prompt: "What should JWT authentication middleware do in an Express application?",
                expectedAnswer: "It should extract the token, verify it, load or validate the user, attach safe user context to req, and reject invalid requests.",
                explanation: "Middleware centralizes route protection and avoids repeating auth checks in every controller.",
                commonMistakes: ["Trusting decoded token data without verification.", "Putting raw secrets in client code."],
                followUps: [
                  {
                    question: "Why should protected routes not trust client-sent user IDs?",
                    expectedAnswer: "Clients can tamper with request data; identity must come from a verified token or session."
                  }
                ],
                tags: ["express", "jwt", "middleware"],
                concepts: ["auth-middleware"]
              }
            ]
          }
        ]
      },
      {
        title: "REST API Design",
        shortTheory: "Production APIs need consistent resources, validation, pagination, and error contracts.",
        subtopics: [
          { title: "Resource Modeling", shortTheory: "Mapping domain entities to clear endpoint structures." },
          { title: "HTTP Methods and Status Codes", shortTheory: "GET, POST, PATCH, DELETE and meaningful response codes." },
          { title: "Pagination, Filtering, and Sorting", shortTheory: "Handling large datasets predictably." },
          { title: "Validation and Sanitization", shortTheory: "Protecting data quality and reducing injection risks." },
          { title: "Rate Limiting", shortTheory: "Protecting sensitive endpoints and API resources." }
        ]
      },
      {
        title: "MongoDB with Mongoose",
        shortTheory: "Mongoose provides schema modeling, validation, middleware, and query helpers for MongoDB.",
        subtopics: [
          { title: "Schema Design", shortTheory: "Fields, validation, defaults, enums, timestamps, and strict mode." },
          { title: "Embedding vs Referencing", shortTheory: "Choosing document relationships based on access patterns." },
          { title: "Indexes", shortTheory: "Unique, compound, text, and query-supporting indexes." },
          { title: "Aggregation Pipelines", shortTheory: "Transforming and summarizing data in MongoDB." },
          { title: "Transactions", shortTheory: "Atomic multi-document operations when consistency requires it." }
        ]
      },
      {
        title: "React Fundamentals",
        shortTheory: "React interviews test component thinking, state flow, rendering, and hooks.",
        subtopics: [
          { title: "Components and Props", shortTheory: "Composing UI through reusable components." },
          { title: "State and Events", shortTheory: "Managing local state and user interactions." },
          { title: "useEffect", shortTheory: "Synchronizing components with external systems." },
          { title: "Controlled Forms", shortTheory: "Form state, validation, and submission patterns." },
          { title: "Conditional Rendering and Lists", shortTheory: "Rendering dynamic UI safely and efficiently." }
        ]
      },
      {
        title: "Advanced React",
        shortTheory: "Advanced React topics focus on performance, architecture, and reusable state patterns.",
        subtopics: [
          { title: "Context API", shortTheory: "Sharing state across component trees without prop drilling." },
          { title: "Custom Hooks", shortTheory: "Extracting reusable stateful logic." },
          { title: "Memoization", shortTheory: "useMemo, useCallback, React.memo, and when not to use them." },
          { title: "Code Splitting and Lazy Loading", shortTheory: "Reducing initial bundle size." },
          { title: "Error Boundaries", shortTheory: "Handling render-time failures gracefully." }
        ]
      },
      {
        title: "Authentication and Authorization",
        shortTheory: "Full-stack apps need secure identity, session, and permission handling.",
        subtopics: [
          { title: "JWT Flow", shortTheory: "Token creation, verification, expiry, and refresh strategy." },
          { title: "Password Hashing", shortTheory: "Using bcrypt or argon2 with salts and cost factors." },
          { title: "Role-Based Access Control", shortTheory: "Protecting routes and actions based on permissions." },
          { title: "Token Storage", shortTheory: "LocalStorage tradeoffs vs HTTP-only secure cookies." },
          { title: "CORS and CSRF", shortTheory: "Cross-origin and cross-site request protections." }
        ]
      },
      {
        title: "Full-Stack Architecture",
        shortTheory: "Interviewers expect practical decisions about structure, deployment, and reliability.",
        subtopics: [
          { title: "Project Structure", shortTheory: "Separating routes, controllers, services, models, and UI layers." },
          { title: "API Error Contracts", shortTheory: "Consistent error shapes for frontend retry and display." },
          { title: "Caching", shortTheory: "Browser, API, Redis, and database-level caching strategies." },
          { title: "Testing Strategy", shortTheory: "Unit, integration, API, and UI testing layers." },
          { title: "Deployment", shortTheory: "Environment variables, build steps, hosting, and monitoring." }
        ]
      }
    ]
  }
];

const seed = async () => {
  await connectDb();

  for (const [subjectIndex, subjectSeed] of subjects.entries()) {
    const subject = await Subject.findOneAndUpdate(
      { slug: subjectSeed.name.toLowerCase().replace(/\s+/g, "-") },
      {
        name: subjectSeed.name,
        description: subjectSeed.description,
        displayOrder: subjectIndex,
        isPublished: true
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    for (const [topicIndex, topicSeed] of subjectSeed.topics.entries()) {
      const topic = await Topic.findOneAndUpdate(
        {
          subjectId: subject._id,
          slug: topicSeed.title.toLowerCase().replace(/\s+/g, "-")
        },
        {
          subjectId: subject._id,
          title: topicSeed.title,
          shortTheory: topicSeed.shortTheory,
          displayOrder: topicIndex,
          isPublished: true
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      for (const [subtopicIndex, subtopicSeed] of topicSeed.subtopics.entries()) {
        const subtopic = await Subtopic.findOneAndUpdate(
          {
            topicId: topic._id,
            slug: subtopicSeed.title.toLowerCase().replace(/\s+/g, "-")
          },
          {
            subjectId: subject._id,
            topicId: topic._id,
            title: subtopicSeed.title,
            shortTheory: subtopicSeed.shortTheory,
            displayOrder: subtopicIndex,
            isPublished: true
          },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        for (const questionSeed of subtopicSeed.questions || []) {
          const questionPayload = {
            ...questionSeed,
            subjectId: subject._id,
            topicId: topic._id,
            subtopicId: subtopic._id,
            normalizedPromptHash: createPromptHash(questionSeed.prompt),
            isPublished: true
          };

          await Question.findOneAndUpdate(
            {
              subtopicId: subtopic._id,
              normalizedPromptHash: questionPayload.normalizedPromptHash
            },
            questionPayload,
            { runValidators: true, upsert: true, setDefaultsOnInsert: true }
          );
        }
      }
    }
  }

  console.log("Seed content loaded");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
