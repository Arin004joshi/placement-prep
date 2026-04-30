export const interviewRoadmap = [
  {
    _id: "roadmap-dbms",
    name: "DBMS",
    description: "Database fundamentals, transactions, indexing, normalization, and distributed storage.",
    isFallback: true,
    topics: [
      ["Database Basics", ["DBMS vs File System", "Data Models", "Schema and Instance", "Three-Schema Architecture", "Data Independence"]],
      ["Relational Model", ["Relations, Tuples, and Attributes", "Candidate, Primary, and Foreign Keys", "Integrity Constraints", "Relational Algebra", "Joins and Relationship Modeling"]],
      ["SQL", ["DDL, DML, DCL, and TCL", "Filtering and Aggregation", "Joins", "Subqueries and CTEs", "Window Functions", "Views and Stored Procedures"]],
      ["Normalization", ["Functional Dependencies", "1NF, 2NF, and 3NF", "BCNF", "Decomposition", "Denormalization"]],
      ["Transactions", ["ACID Properties", "Transaction States", "Commit and Rollback", "Isolation Levels", "Anomalies: Dirty, Non-Repeatable, Phantom Reads"]],
      ["Concurrency Control", ["Schedules and Serializability", "Recoverable and Cascadeless Schedules", "Lock-Based Protocols", "Deadlocks", "MVCC"]],
      ["Indexing and Query Optimization", ["B-Tree and B+ Tree Indexes", "Hash Indexes", "Clustered vs Non-Clustered Indexes", "Composite Indexes", "Query Execution Plans"]],
      ["Storage and Recovery", ["Storage Hierarchy", "Write-Ahead Logging", "Checkpoints", "Undo and Redo Recovery", "RAID Basics"]],
      ["NoSQL and Distributed Databases", ["CAP Theorem", "Consistency Models", "Sharding and Replication", "MongoDB Data Modeling", "Choosing SQL vs NoSQL"]]
    ]
  },
  {
    _id: "roadmap-oops",
    name: "OOPs",
    description: "Object-oriented principles, SOLID, design patterns, and common machine-coding models.",
    isFallback: true,
    topics: [
      ["Core Principles", ["Classes and Objects", "Encapsulation", "Abstraction", "Inheritance", "Polymorphism"]],
      ["Object-Oriented Design", ["Composition vs Inheritance", "Association, Aggregation, and Composition", "Coupling and Cohesion", "Interfaces and Abstract Classes", "UML Class Diagrams"]],
      ["SOLID Principles", ["Single Responsibility Principle", "Open/Closed Principle", "Liskov Substitution Principle", "Interface Segregation Principle", "Dependency Inversion Principle"]],
      ["Design Patterns", ["Singleton", "Factory and Abstract Factory", "Builder", "Strategy", "Observer", "Decorator"]],
      ["Language Mechanics", ["Method Overloading", "Method Overriding", "Constructors and Destructors", "Access Modifiers", "Static Members"]],
      ["Exception Handling", ["Checked vs Unchecked Exceptions", "Custom Exceptions", "Try-Catch-Finally", "Exception Safety"]],
      ["OOP Interview Design Problems", ["Parking Lot", "Elevator System", "Library Management", "Chess", "Splitwise"]]
    ]
  },
  {
    _id: "roadmap-os",
    name: "OS",
    description: "Processes, threads, scheduling, synchronization, memory, files, and I/O.",
    isFallback: true,
    topics: [
      ["Process Management", ["Process States", "Process Control Block", "Context Switching", "System Calls", "Scheduling"]],
      ["Threads and Concurrency", ["Process vs Thread", "User-Level vs Kernel-Level Threads", "Multithreading Models", "Race Conditions", "Thread Pools"]],
      ["CPU Scheduling", ["FCFS", "SJF and SRTF", "Round Robin", "Priority Scheduling", "Multilevel Queue Scheduling"]],
      ["Synchronization", ["Critical Section Problem", "Mutexes and Semaphores", "Monitors and Condition Variables", "Producer Consumer", "Readers Writers", "Dining Philosophers"]],
      ["Deadlocks", ["Necessary Conditions", "Resource Allocation Graph", "Deadlock Prevention", "Deadlock Avoidance", "Deadlock Detection and Recovery"]],
      ["Memory Management", ["Contiguous Allocation", "Paging", "Segmentation", "Virtual Memory", "Page Replacement", "Thrashing"]],
      ["File Systems", ["File Attributes and Operations", "Directory Structures", "File Allocation Methods", "Free Space Management", "Journaling"]],
      ["I/O and Storage", ["Device Drivers", "Interrupts and DMA", "Disk Scheduling", "Buffering and Caching"]]
    ]
  },
  {
    _id: "roadmap-mern-stack",
    name: "MERN Stack",
    description: "MongoDB, Express, React, Node.js, authentication, API design, and deployment readiness.",
    isFallback: true,
    topics: [
      ["JavaScript Foundations", ["Scope and Closures", "Hoisting and Temporal Dead Zone", "Promises and Async Await", "Event Loop", "Prototypes and Classes"]],
      ["Node.js", ["Node Runtime", "CommonJS and ES Modules", "Streams and Buffers", "Error Handling", "Environment Configuration"]],
      ["Express Middleware", ["Request Response Lifecycle", "Routing", "Error Middleware", "Auth Middleware"]],
      ["REST API Design", ["Resource Modeling", "HTTP Methods and Status Codes", "Pagination, Filtering, and Sorting", "Validation and Sanitization", "Rate Limiting"]],
      ["MongoDB with Mongoose", ["Schema Design", "Embedding vs Referencing", "Indexes", "Aggregation Pipelines", "Transactions"]],
      ["React Fundamentals", ["Components and Props", "State and Events", "useEffect", "Controlled Forms", "Conditional Rendering and Lists"]],
      ["Advanced React", ["Context API", "Custom Hooks", "Memoization", "Code Splitting and Lazy Loading", "Error Boundaries"]],
      ["Authentication and Authorization", ["JWT Flow", "Password Hashing", "Role-Based Access Control", "Token Storage", "CORS and CSRF"]],
      ["Full-Stack Architecture", ["Project Structure", "API Error Contracts", "Caching", "Testing Strategy", "Deployment"]]
    ]
  }
];

export const findRoadmapSubject = (id) => interviewRoadmap.find((subject) => subject._id === id);

export const buildTeachingPrompt = ({ subject, topic, subtopic }) =>
  `Teach me "${subtopic}" under "${topic}" in ${subject} for product-company technical interviews. Explain the core idea, why it matters, all key concepts, important terms, real examples, edge cases, common mistakes, interviewer follow-ups, and 5 practice questions. Keep it concise, beginner-friendly, and interview-depth, ending with a short revision checklist.`;
