import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
// Removed unused Card imports
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Mock data for demonstration
const hrTechnicalQuestions = [
  // ---------------------- HR Questions ----------------------
  {
    text: "Tell me about yourself.",
    category: "HR",
     
    tags: ["Behavioral", "Introduction"]
  },
  {
    text: "Walk me through your resume and relevant experience.",
    category: "HR",
     
    tags: ["Experience", "Background"]
  },
  {
    text: "What are your hobbies?",
    category: "HR",
     
    tags: ["Personal", "Behavioral"]
  },
  {
    text: "What are your strengths and weaknesses?",
    category: "HR",
     
    tags: ["Self-Awareness", "Behavioral"]
  },
  {
    text: "What is the most challenging project you've worked on? How did you handle it?",
    category: "HR",
      
    tags: ["Problem Solving", "Experience"]
  },
  {
    text: "How would you tell your project to a non-technical person?",
    category: "HR",
      
    tags: ["Communication", "Simplification"]
  },
  {
    text: "How do you prioritize tasks when you have multiple deadlines?",
    category: "HR",
      
    tags: ["Time Management", "Organization"]
  },
  {
    text: "What is the most difficult bug you've had to fix? How did you approach debugging it?",
    category: "HR",
      
    tags: ["Problem Solving", "Debugging"]
  },
  {
    text: "Describe a time you had a disagreement with a team member. How did you resolve the conflict?",
    category: "HR",
      
    tags: ["Teamwork", "Conflict Resolution"]
  },
  {
    text: "How do you stay up to date with new technologies and industry trends?",
    category: "HR",
      
    tags: ["Learning", "Growth"]
  },
  {
    text: "What frustrates you most about the development process?",
    category: "HR",
      
    tags: ["Behavioral", "Work Preferences"]
  },
  {
    text: "Where do you see yourself in five years?",
    category: "HR",
     
    tags: ["Career Goals", "Future Plans"]
  },
  {
    text: "What are your thoughts on 'clean code'?",
    category: "HR",
      
    tags: ["Opinion", "Best Practices"]
  },
  {
    text: "Describe your ideal work environment.",
    category: "HR",
     
    tags: ["Culture Fit", "Preferences"]
  },
  {
    text: "What are you passionate about, both inside and outside of work?",
    category: "HR",
     
    tags: ["Personality", "Motivation"]
  },
  {
    text: "Tell me about a time you failed. What did you learn from it?",
    category: "HR",
      
    tags: ["Resilience", "Learning"]
  },
  {
    text: "How do you handle a situation where your manager's instructions are unclear?",
    category: "HR",
      
    tags: ["Problem Solving", "Communication"]
  },

  // ---------------------- Programming Concepts ----------------------
  {
    text: "What is a variable and a data type?",
    category: "Technical",
    //
    tags: ["Basics", "Programming Concepts"]
  },
  {
    text: "What is the difference between a compiled and an interpreted language?",
    category: "Technical",
    
    tags: ["Programming Concepts", "Languages"]
  },
  {
    text: "Explain the difference between call by value and call by reference.",
    category: "Technical",
    
    tags: ["Programming Concepts", "Memory Management"]
  },
  {
    text: "What is the difference between break and continue?",
    category: "Technical",
    
    tags: ["Control Flow", "Programming Concepts"]
  },
  {
    text: "What is a pointer?",
    category: "Technical",
    
    tags: ["Memory", "Programming Concepts"]
  },
  {
    text: "What are conditionals and loops?",
    category: "Technical",
    
    tags: ["Control Flow", "Basics"]
  },
  {
    text: "Explain recursion with an example.",
    category: "Technical",
     
    tags: ["Recursion", "Problem Solving"]
  },
  {
    text: "What is a bug? How do you debug your code?",
    category: "Technical",
     
    tags: ["Debugging", "Problem Solving"]
  },
  {
    text: "What is multithreading?",
    category: "Technical",
     
    tags: ["Concurrency", "Performance"]
  },
  {
    text: "How do you write clean and readable code?",
    category: "Technical",
     
    tags: ["Best Practices", "Coding Standards"]
  },
  {
    text: "What is a library vs. a framework?",
    category: "Technical",
    
    tags: ["Tools", "Programming Concepts"]
  },
  {
    text: "Explain the difference between synchronous and asynchronous programming.",
    category: "Technical",
     
    tags: ["Concurrency", "Programming Concepts"]
  },
  {
    text: "What is concurrency vs. parallelism?",
    category: "Technical",
     
    tags: ["Concurrency", "Performance"]
  },
  {
    text: "What are design patterns? Can you give an example of one you've used?",
    category: "Technical",
     
    tags: ["Architecture", "Best Practices"]
  },
  {
    text: "What is dependency injection and why is it used?",
    category: "Technical",
     
    tags: ["Design Pattern", "Best Practices"]
  },
  {
    text: "How does garbage collection work?",
    category: "Technical",
     
    tags: ["Memory Management", "Programming Concepts"]
  },
  {
    text: "What is a pure function? Why is it important in programming?",
    category: "Technical",
    
    tags: ["Functional Programming", "Best Practices"]
  },
  {
    text: "Explain the difference between static and dynamic typing.",
    category: "Technical",
    
    tags: ["Typing", "Programming Concepts"]
  },
  {
    text: "What is memoization and when is it useful?",
    category: "Technical",
     
    tags: ["Optimization", "Problem Solving"]
  },
  {
    text: "What is a callback function? What are the problems associated with them (e.g., callback hell)?",
    category: "Technical",
     
    tags: ["JavaScript", "Async Programming"]
  },

  // ---------------------- OOP ----------------------
  {
    text: "What is OOPs? What are its four main pillars? Explain each one.",
    category: "Technical",
    
    tags: ["OOP", "Concepts", "Basics"]
  },
  {
    text: "What is a class vs. an object?",
    category: "Technical",
    
    tags: ["OOP", "Basics"]
  },
  {
    text: "Explain polymorphism with a real-life example.",
    category: "Technical",
     
    tags: ["OOP", "Polymorphism"]
  },
  {
    text: "What are the differences between method overloading and method overriding?",
    category: "Technical",
     
    tags: ["OOP", "Polymorphism"]
  },
  {
    text: "What is inheritance? Explain the different types of inheritance.",
    category: "Technical",
     
    tags: ["OOP", "Inheritance"]
  },
  {
    text: "What is an abstract class? How is it different from an interface?",
    category: "Technical",
     
    tags: ["OOP", "Abstraction"]
  },
  {
    text: "What is a constructor?",
    category: "Technical",
    
    tags: ["OOP", "Basics"]
  },
  {
    text: "What is the purpose of the super keyword?",
    category: "Technical",
    
    tags: ["OOP", "Inheritance"]
  },
  {
    text: "What is encapsulation?",
    category: "Technical",
    
    tags: ["OOP", "Encapsulation"]
  },
  {
    text: "What is Garbage Collection?",
    category: "Technical",
     
    tags: ["Memory Management", "OOP"]
  },
  {
    text: "What are access modifiers?",
    category: "Technical",
    
    tags: ["OOP", "Access Control"]
  },
  {
    text: "Explain the difference between composition and inheritance.",
    category: "Technical",
     
    tags: ["OOP", "Design"]
  },
  {
    text: "What is a singleton class? How is it implemented? What are its use cases?",
    category: "Technical",
     
    tags: ["OOP", "Design Pattern"]
  },
  {
    text: "What is the 'is-a' vs. 'has-a' relationship in OOPs?",
    category: "Technical",
    
    tags: ["OOP", "Relationships"]
  },
  {
    text: "What is the purpose of the final or sealed keyword?",
    category: "Technical",
    
    tags: ["OOP", "Keywords"]
  },  // ---------------------- HR Questions ----------------------
  {
    text: "Tell me about yourself.",
    category: "HR",
     
    tags: ["Behavioral", "Introduction"]
  },
  {
    text: "Walk me through your resume and relevant experience.",
    category: "HR",
     
    tags: ["Experience", "Background"]
  },
  {
    text: "What are your hobbies?",
    category: "HR",
     
    tags: ["Personal", "Behavioral"]
  },
  {
    text: "What are your strengths and weaknesses?",
    category: "HR",
     
    tags: ["Self-Awareness", "Behavioral"]
  },
  {
    text: "What is the most challenging project you've worked on? How did you handle it?",
    category: "HR",
      
    tags: ["Problem Solving", "Experience"]
  },
  {
    text: "How would you tell your project to a non-technical person?",
    category: "HR",
      
    tags: ["Communication", "Simplification"]
  },
  {
    text: "How do you prioritize tasks when you have multiple deadlines?",
    category: "HR",
      
    tags: ["Time Management", "Organization"]
  },
  {
    text: "What is the most difficult bug you've had to fix? How did you approach debugging it?",
    category: "HR",
      
    tags: ["Problem Solving", "Debugging"]
  },
  {
    text: "Describe a time you had a disagreement with a team member. How did you resolve the conflict?",
    category: "HR",
      
    tags: ["Teamwork", "Conflict Resolution"]
  },
  {
    text: "How do you stay up to date with new technologies and industry trends?",
    category: "HR",
      
    tags: ["Learning", "Growth"]
  },
  {
    text: "What frustrates you most about the development process?",
    category: "HR",
      
    tags: ["Behavioral", "Work Preferences"]
  },
  {
    text: "Where do you see yourself in five years?",
    category: "HR",
     
    tags: ["Career Goals", "Future Plans"]
  },
  {
    text: "What are your thoughts on 'clean code'?",
    category: "HR",
      
    tags: ["Opinion", "Best Practices"]
  },
  {
    text: "Describe your ideal work environment.",
    category: "HR",
     
    tags: ["Culture Fit", "Preferences"]
  },
  {
    text: "What are you passionate about, both inside and outside of work?",
    category: "HR",
     
    tags: ["Personality", "Motivation"]
  },
  {
    text: "Tell me about a time you failed. What did you learn from it?",
    category: "HR",
      
    tags: ["Resilience", "Learning"]
  },
  {
    text: "How do you handle a situation where your manager's instructions are unclear?",
    category: "HR",
      
    tags: ["Problem Solving", "Communication"]
  },

  // ---------------------- Programming Concepts ----------------------
  {
    text: "What is a variable and a data type?",
    category: "Technical",
    
    tags: ["Basics", "Programming Concepts"]
  },
  {
    text: "What is the difference between a compiled and an interpreted language?",
    category: "Technical",
    
    tags: ["Programming Concepts", "Languages"]
  },
  {
    text: "Explain the difference between call by value and call by reference.",
    category: "Technical",
    
    tags: ["Programming Concepts", "Memory Management"]
  },
  {
    text: "What is the difference between break and continue?",
    category: "Technical",
    
    tags: ["Control Flow", "Programming Concepts"]
  },
  {
    text: "What is a pointer?",
    category: "Technical",
    
    tags: ["Memory", "Programming Concepts"]
  },
  {
    text: "What are conditionals and loops?",
    category: "Technical",
    
    tags: ["Control Flow", "Basics"]
  },
  {
    text: "Explain recursion with an example.",
    category: "Technical",
     
    tags: ["Recursion", "Problem Solving"]
  },
  {
    text: "What is a bug? How do you debug your code?",
    category: "Technical",
     
    tags: ["Debugging", "Problem Solving"]
  },
  {
    text: "What is multithreading?",
    category: "Technical",
     
    tags: ["Concurrency", "Performance"]
  },
  {
    text: "How do you write clean and readable code?",
    category: "Technical",
     
    tags: ["Best Practices", "Coding Standards"]
  },
  {
    text: "What is a library vs. a framework?",
    category: "Technical",
    
    tags: ["Tools", "Programming Concepts"]
  },
  {
    text: "Explain the difference between synchronous and asynchronous programming.",
    category: "Technical",
     
    tags: ["Concurrency", "Programming Concepts"]
  },
  {
    text: "What is concurrency vs. parallelism?",
    category: "Technical",
     
    tags: ["Concurrency", "Performance"]
  },
  {
    text: "What are design patterns? Can you give an example of one you've used?",
    category: "Technical",
     
    tags: ["Architecture", "Best Practices"]
  },
  {
    text: "What is dependency injection and why is it used?",
    category: "Technical",
     
    tags: ["Design Pattern", "Best Practices"]
  },
  {
    text: "How does garbage collection work?",
    category: "Technical",
     
    tags: ["Memory Management", "Programming Concepts"]
  },
  {
    text: "What is a pure function? Why is it important in programming?",
    category: "Technical",
    
    tags: ["Functional Programming", "Best Practices"]
  },
  {
    text: "Explain the difference between static and dynamic typing.",
    category: "Technical",
    
    tags: ["Typing", "Programming Concepts"]
  },
  {
    text: "What is memoization and when is it useful?",
    category: "Technical",
     
    tags: ["Optimization", "Problem Solving"]
  },
  {
    text: "What is a callback function? What are the problems associated with them (e.g., callback hell)?",
    category: "Technical",
     
    tags: ["JavaScript", "Async Programming"]
  },

  // ---------------------- OOP ----------------------
  {
    text: "What is OOPs? What are its four main pillars? Explain each one.",
    category: "Technical",
    
    tags: ["OOP", "Concepts", "Basics"]
  },
  {
    text: "What is a class vs. an object?",
    category: "Technical",
    
    tags: ["OOP", "Basics"]
  },
  {
    text: "Explain polymorphism with a real-life example.",
    category: "Technical",
     
    tags: ["OOP", "Polymorphism"]
  },
  {
    text: "What are the differences between method overloading and method overriding?",
    category: "Technical",
     
    tags: ["OOP", "Polymorphism"]
  },
  {
    text: "What is inheritance? Explain the different types of inheritance.",
    category: "Technical",
     
    tags: ["OOP", "Inheritance"]
  },
  {
    text: "What is an abstract class? How is it different from an interface?",
    category: "Technical",
     
    tags: ["OOP", "Abstraction"]
  },
  {
    text: "What is a constructor?",
    category: "Technical",
    
    tags: ["OOP", "Basics"]
  },
  {
    text: "What is the purpose of the super keyword?",
    category: "Technical",
    
    tags: ["OOP", "Inheritance"]
  },
  {
    text: "What is encapsulation?",
    category: "Technical",
    
    tags: ["OOP", "Encapsulation"]
  },
  {
    text: "What is Garbage Collection?",
    category: "Technical",
     
    tags: ["Memory Management", "OOP"]
  },
  {
    text: "What are access modifiers?",
    category: "Technical",
    
    tags: ["OOP", "Access Control"]
  },
  {
    text: "Explain the difference between composition and inheritance.",
    category: "Technical",
     
    tags: ["OOP", "Design"]
  },
  {
    text: "What is a singleton class? How is it implemented? What are its use cases?",
    category: "Technical",
     
    tags: ["OOP", "Design Pattern"]
  },
  {
    text: "What is the 'is-a' vs. 'has-a' relationship in OOPs?",
    category: "Technical",
    
    tags: ["OOP", "Relationships"]
  },
  {
    text: "What is the purpose of the final or sealed keyword?",
    category: "Technical",
    
    tags: ["OOP", "Keywords"]
  },    // ---------------------- Data Structures & Algorithms (DSA) ----------------------
    {
      text: "What is a data structure?",
      category: "Technical",
      
      tags: ["DSA", "Basics"]
    },
    {
      text: "What are the differences between a linear and non-linear data structure?",
      category: "Technical",
      
      tags: ["DSA", "Concepts"]
    },
    {
      text: "What is the difference between an array and a linked list? What are the pros and cons of each?",
      category: "Technical",
      
      tags: ["DSA", "Arrays", "Linked List"]
    },
    {
      text: "What is a stack? How does it work (LIFO)?",
      category: "Technical",
      
      tags: ["DSA", "Stack"]
    },
    {
      text: "What is a queue? How does it work (FIFO)?",
      category: "Technical",
      
      tags: ["DSA", "Queue"]
    },
    {
      text: "Explain the concept of a hash table or hash map. How are collisions handled?",
      category: "Technical",
       
      tags: ["DSA", "Hashing"]
    },
    {
      text: "Describe common sorting algorithms (e.g., Bubble Sort, Quick Sort, Merge Sort) and their time complexities.",
      category: "Technical",
       
      tags: ["DSA", "Sorting", "Time Complexity"]
    },
    {
      text: "What is binary search? What are its requirements?",
      category: "Technical",
      
      tags: ["DSA", "Searching"]
    },
    {
      text: "What is time complexity and space complexity? Explain Big O notation.",
      category: "Technical",
      
      tags: ["DSA", "Complexity Analysis"]
    },
    {
      text: "How do you find a cycle/loop in a linked list? (Floyd's Cycle-Finding Algorithm).",
      category: "Technical",
       
      tags: ["DSA", "Linked List", "Algorithms"]
    },
    {
      text: "What is a tree data structure? What is a binary search tree?",
      category: "Technical",
      
      tags: ["DSA", "Tree", "BST"]
    },
    {
      text: "Explain the difference between DFS (Depth-First Search) and BFS (Breadth-First Search).",
      category: "Technical",
       
      tags: ["DSA", "Graph", "Algorithms"]
    },
    {
      text: "What is a trie data structure and where is it used?",
      category: "Technical",
       
      tags: ["DSA", "Trie", "String Matching"]
    },
    {
      text: "How would you find the nth largest element in an array?",
      category: "Technical",
       
      tags: ["DSA", "Array", "Problem Solving"]
    },
    {
      text: "What is dynamic programming? Provide an example of a problem that can be solved with it.",
      category: "Technical",
       
      tags: ["DSA", "Dynamic Programming"]
    },
  
    // ---------------------- Database Management Systems (DBMS) ----------------------
    {
      text: "What is a DBMS? What is a database?",
      category: "Technical",
      
      tags: ["DBMS", "Basics"]
    },
    {
      text: "What is the difference between SQL and NoSQL?",
      category: "Technical",
      
      tags: ["DBMS", "SQL", "NoSQL"]
    },
    {
      text: "Explain ACID properties in database transactions.",
      category: "Technical",
       
      tags: ["DBMS", "Transactions", "ACID"]
    },
    {
      text: "What are primary keys and foreign keys?",
      category: "Technical",
      
      tags: ["DBMS", "Keys"]
    },
    {
      text: "Explain the different types of JOINs in SQL.",
      category: "Technical",
       
      tags: ["DBMS", "SQL", "Joins"]
    },
    {
      text: "What is database normalization? Explain the different normal forms.",
      category: "Technical",
       
      tags: ["DBMS", "Normalization"]
    },
    {
      text: "When would you use denormalization?",
      category: "Technical",
       
      tags: ["DBMS", "Denormalization"]
    },
    {
      text: "What is an index in a database? What are its trade-offs?",
      category: "Technical",
       
      tags: ["DBMS", "Indexing"]
    },
    {
      text: "How do you optimize a slow-running SQL query?",
      category: "Technical",
       
      tags: ["DBMS", "SQL Optimization"]
    },
    {
      text: "What is the difference between WHERE and HAVING clauses?",
      category: "Technical",
      
      tags: ["DBMS", "SQL"]
    },
    {
      text: "What is a view in a database?",
      category: "Technical",
      
      tags: ["DBMS", "SQL", "Views"]
    },
    {
      text: "What is a stored procedure?",
      category: "Technical",
       
      tags: ["DBMS", "SQL", "Procedures"]
    },
    {
      text: "What is a trigger in a database?",
      category: "Technical",
       
      tags: ["DBMS", "SQL", "Triggers"]
    },
    {
      text: "How do you prevent SQL injection attacks?",
      category: "Technical",
       
      tags: ["DBMS", "Security"]
    },
  
    // ---------------------- API Design & Testing ----------------------
    {
      text: "What is an API? What is the difference between an API and a web service?",
      category: "Technical",
      
      tags: ["API", "Basics"]
    },
    {
      text: "Explain the REST architectural style. What makes an API 'RESTful'?",
      category: "Technical",
      
      tags: ["API", "REST"]
    },
    {
      text: "What is the difference between GET and POST HTTP methods?",
      category: "Technical",
      
      tags: ["API", "HTTP Methods"]
    },
    {
      text: "Explain the purpose of different HTTP status codes (e.g., 200, 404, 500, 201).",
      category: "Technical",
      
      tags: ["API", "HTTP Codes"]
    },
    {
      text: "How do you handle authentication and authorization in an API?",
      category: "Technical",
       
      tags: ["API", "Security", "Auth"]
    },
    {
      text: "What is API versioning and why is it important?",
      category: "Technical",
       
      tags: ["API", "Versioning"]
    },
    {
      text: "What are some common API testing strategies? (e.g., functional, load, security).",
      category: "Technical",
       
      tags: ["API", "Testing"]
    },
    {
      text: "What are idempotent API methods? Which ones are they?",
      category: "Technical",
       
      tags: ["API", "HTTP Methods"]
    },
  
    // ---------------------- Web Development ----------------------
    {
      text: "What is HTML and CSS?",
      category: "Technical",
      
      tags: ["Web", "HTML", "CSS"]
    },
    {
      text: "Explain the CSS Box Model.",
      category: "Technical",
      
      tags: ["Web", "CSS"]
    },
    {
      text: "What is the difference between == and === in JavaScript?",
      category: "Technical",
      
      tags: ["Web", "JavaScript"]
    },
    {
      text: "Explain JavaScript closures with an example.",
      category: "Technical",
       
      tags: ["Web", "JavaScript", "Closures"]
    },
    {
      text: "What is hoisting in JavaScript?",
      category: "Technical",
      
      tags: ["Web", "JavaScript", "Concepts"]
    },
    {
      text: "How do you handle asynchronous operations in JavaScript? (e.g., using Callbacks, Promises, Async/Await).",
      category: "Technical",
       
      tags: ["Web", "JavaScript", "Async"]
    },
    {
      text: "What is the DOM? How do you traverse and manipulate it?",
      category: "Technical",
      
      tags: ["Web", "DOM"]
    },
    {
      text: "What is AJAX?",
      category: "Technical",
      
      tags: ["Web", "AJAX"]
    },
    {
      text: "What is a single-page application (SPA) vs. a multi-page application (MPA)?",
      category: "Technical",
       
      tags: ["Web", "SPA", "MPA"]
    },
    {
      text: "Explain the difference between session storage, local storage, and cookies.",
      category: "Technical",
      
      tags: ["Web", "Storage"]
    },
    {
      text: "What is the purpose of a package manager like npm or yarn?",
      category: "Technical",
      
      tags: ["Web", "Tools", "Package Manager"]
    },
      // ---------------------- Cloud Computing ----------------------
      {
        text: "What is cloud computing? What are its benefits?",
        category: "Technical",
        
        tags: ["Cloud", "Basics"]
      },
      {
        text: "What are the different types of cloud service models (IaaS, PaaS, SaaS)?",
        category: "Technical",
        
        tags: ["Cloud", "Service Models"]
      },
      {
        text: "What are the different types of cloud deployment models (Public, Private, Hybrid, Community)?",
        category: "Technical",
        
        tags: ["Cloud", "Deployment Models"]
      },
      {
        text: "What is serverless computing?",
        category: "Technical",
         
        tags: ["Cloud", "Serverless"]
      },
      {
        text: "What is auto-scaling in cloud environments?",
        category: "Technical",
         
        tags: ["Cloud", "Scaling"]
      },
      {
        text: "What is containerization? How is it different from virtualization?",
        category: "Technical",
         
        tags: ["Cloud", "Containers", "Virtualization"]
      },
      {
        text: "What are some popular cloud providers and their main services?",
        category: "Technical",
        
        tags: ["Cloud", "AWS", "Azure", "GCP"]
      },
      {
        text: "How do you ensure security in cloud applications?",
        category: "Technical",
         
        tags: ["Cloud", "Security"]
      },
    
      // ---------------------- DevOps ----------------------
      {
        text: "What is DevOps? Why is it important?",
        category: "Technical",
        
        tags: ["DevOps", "Basics"]
      },
      {
        text: "What are CI/CD pipelines?",
        category: "Technical",
        
        tags: ["DevOps", "CI/CD"]
      },
      {
        text: "What is version control? Explain Git basics.",
        category: "Technical",
        
        tags: ["DevOps", "Git", "Version Control"]
      },
      {
        text: "What is the difference between Git and GitHub?",
        category: "Technical",
        
        tags: ["DevOps", "Git", "Tools"]
      },
      {
        text: "What is container orchestration? Explain Kubernetes.",
        category: "Technical",
         
        tags: ["DevOps", "Kubernetes", "Containers"]
      },
      {
        text: "What are monitoring tools in DevOps (e.g., Prometheus, Grafana)?",
        category: "Technical",
         
        tags: ["DevOps", "Monitoring"]
      },
      {
        text: "What is Infrastructure as Code (IaC)?",
        category: "Technical",
         
        tags: ["DevOps", "IaC", "Automation"]
      },
    
      // ---------------------- Operating Systems ----------------------
      {
        text: "What is an operating system? What are its main functions?",
        category: "Technical",
        
        tags: ["OS", "Basics"]
      },
      {
        text: "What is process vs. thread?",
        category: "Technical",
        
        tags: ["OS", "Processes", "Threads"]
      },
      {
        text: "What is a deadlock? How do you prevent it?",
        category: "Technical",
         
        tags: ["OS", "Deadlock"]
      },
      {
        text: "What is virtual memory? How does it work?",
        category: "Technical",
         
        tags: ["OS", "Memory Management"]
      },
      {
        text: "What are different process scheduling algorithms?",
        category: "Technical",
         
        tags: ["OS", "Scheduling"]
      },
      {
        text: "What is context switching?",
        category: "Technical",
        
        tags: ["OS", "Processes"]
      },
      {
        text: "What is a kernel? Explain monolithic vs. microkernel.",
        category: "Technical",
         
        tags: ["OS", "Kernel"]
      },
      {
        text: "What is paging and segmentation?",
        category: "Technical",
         
        tags: ["OS", "Memory Management"]
      },
    
      // ---------------------- Artificial Intelligence / Machine Learning ----------------------
      {
        text: "What is Artificial Intelligence?",
        category: "Technical",
        
        tags: ["AI", "Basics"]
      },
      {
        text: "What is the difference between AI, ML, and Deep Learning?",
        category: "Technical",
        
        tags: ["AI", "ML", "DL"]
      },
      {
        text: "What is supervised vs. unsupervised learning?",
        category: "Technical",
        
        tags: ["ML", "Learning Types"]
      },
      {
        text: "What is reinforcement learning?",
        category: "Technical",
         
        tags: ["ML", "Learning Types"]
      },
      {
        text: "What is overfitting vs. underfitting in machine learning?",
        category: "Technical",
         
        tags: ["ML", "Model Performance"]
      },
      {
        text: "What are precision, recall, and F1-score?",
        category: "Technical",
         
        tags: ["ML", "Evaluation Metrics"]
      },
      {
        text: "What are some commonly used ML algorithms?",
        category: "Technical",
        
        tags: ["ML", "Algorithms"]
      },
      {
        text: "What is Natural Language Processing (NLP)?",
        category: "Technical",
        
        tags: ["AI", "NLP"]
      },
      {
        text: "What are neural networks? What are activation functions?",
        category: "Technical",
         
        tags: ["DL", "Neural Networks"]
      },
      {
        text: "What is gradient descent? Why is it important?",
        category: "Technical",
         
        tags: ["ML", "Optimization"]
      },
    
      // ---------------------- System Design ----------------------
      {
        text: "What is system design? Why is it important in software engineering?",
        category: "Technical",
        
        tags: ["System Design", "Basics"]
      },
      {
        text: "What is scalability? Vertical scaling vs. horizontal scaling?",
        category: "Technical",
        
        tags: ["System Design", "Scalability"]
      },
      {
        text: "What is load balancing? Why is it used?",
        category: "Technical",
         
        tags: ["System Design", "Load Balancing"]
      },
      {
        text: "What is caching? What are some caching strategies?",
        category: "Technical",
         
        tags: ["System Design", "Caching"]
      },
      {
        text: "What is a CDN (Content Delivery Network)?",
        category: "Technical",
         
        tags: ["System Design", "CDN"]
      },
      {
        text: "What is a message queue? Why is it used?",
        category: "Technical",
         
        tags: ["System Design", "Messaging"]
      },
      {
        text: "What is database sharding?",
        category: "Technical",
         
        tags: ["System Design", "Database", "Sharding"]
      },
      {
        text: "How do you design a URL shortener like bit.ly?",
        category: "Technical",
         
        tags: ["System Design", "Case Study"]
      },
      {
        text: "How do you design a chat application like WhatsApp?",
        category: "Technical",
         
        tags: ["System Design", "Case Study"]
      },
      {
        text: "How do you design an e-commerce system like Amazon?",
        category: "Technical",
         
        tags: ["System Design", "Case Study"]
      }    
];



const codingQuestions = [
  {
    title: "Two Sum",
    tags: ["Arrays & Strings"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/two-sum/"
},
{
    title: "Best Time to Buy and Sell Stock",
    tags: ["Arrays & Strings"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"
},
{
    title: "Contains Duplicate",
    tags: ["Arrays & Strings"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/contains-duplicate/"
},
{
    title: "Product of Array Except Self",
    tags: ["Arrays & Strings"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/product-of-array-except-self/"
},
{
    title: "Maximum Subarray",
    tags: ["Arrays & Strings"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/maximum-subarray/"
},
{
    title: "Merge Intervals",
    tags: ["Arrays & Strings"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/merge-intervals/"
},
{
    title: "3Sum",
    tags: ["Arrays & Strings"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/3sum/"
},
{
    title: "Container With Most Water",
    tags: ["Arrays & Strings"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/container-with-most-water/"
},
{
    title: "Trapping Rain Water",
    tags: ["Arrays & Strings"],
    difficulty: "Hard",
    link: "https://leetcode.com/problems/trapping-rain-water/"
},
{
    title: "Set Matrix Zeroes",
    tags: ["Arrays & Strings"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/set-matrix-zeroes/"
},
{
    title: "Rotate Image",
    tags: ["Arrays & Strings"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/rotate-image/"
},
{
    title: "Group Anagrams",
    tags: ["Hashing & Maps"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/group-anagrams/"
},
{
    title: "Valid Anagram",
    tags: ["Hashing & Maps"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/valid-anagram/"
},
{
    title: "Top K Frequent Elements",
    tags: ["Hashing & Maps"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/top-k-frequent-elements/"
},
{
    title: "Longest Consecutive Sequence",
    tags: ["Hashing & Maps"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/longest-consecutive-sequence/"
},
{
    title: "Subarray Sum Equals K",
    tags: ["Hashing & Maps"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/subarray-sum-equals-k/"
},
{
    title: "Binary Search",
    tags: ["Binary Search"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/binary-search/"
},
{
    title: "Find Minimum in Rotated Sorted Array",
    tags: ["Binary Search"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/"
},
{
    title: "Search in Rotated Sorted Array",
    tags: ["Binary Search"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/search-in-rotated-sorted-array/"
},
{
    title: "Time Based Key-Value Store",
    tags: ["Binary Search"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/time-based-key-value-store/"
},
{
    title: "Median of Two Sorted Arrays",
    tags: ["Binary Search"],
    difficulty: "Hard",
    link: "https://leetcode.com/problems/median-of-two-sorted-arrays/"
},
{
    title: "Reverse Linked List",
    tags: ["Linked List"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/reverse-linked-list/"
},
{
    title: "Merge Two Sorted Lists",
    tags: ["Linked List"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/merge-two-sorted-lists/"
},
{
    title: "Linked List Cycle",
    tags: ["Linked List"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/linked-list-cycle/"
},
{
    title: "Remove Nth Node From End of List",
    tags: ["Linked List"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/"
},
{
    title: "Reorder List",
    tags: ["Linked List"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/reorder-list/"
},
{
    title: "Copy List with Random Pointer",
    tags: ["Linked List"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/copy-list-with-random-pointer/"
},
{
    title: "Merge k Sorted Lists",
    tags: ["Linked List"],
    difficulty: "Hard",
    link: "https://leetcode.com/problems/merge-k-sorted-lists/"
},
{
    title: "Valid Parentheses",
    tags: ["Stack"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/valid-parentheses/"
},
{
    title: "Min Stack",
    tags: ["Stack"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/min-stack/"
},
{
    title: "Evaluate Reverse Polish Notation",
    tags: ["Stack"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/evaluate-reverse-polish-notation/"
},
{
    title: "Generate Parentheses",
    tags: ["Stack"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/generate-parentheses/"
},
{
    title: "Daily Temperatures",
    tags: ["Stack"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/daily-temperatures/"
},
{
    title: "Car Fleet",
    tags: ["Stack"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/car-fleet/"
},
{
    title: "Largest Rectangle in Histogram",
    tags: ["Stack"],
    difficulty: "Hard",
    link: "https://leetcode.com/problems/largest-rectangle-in-histogram/"
},
{
    title: "Invert Binary Tree",
    tags: ["Trees"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/invert-binary-tree/"
},
{
    title: "Maximum Depth of Binary Tree",
    tags: ["Trees"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/"
},
{
    title: "Same Tree",
    tags: ["Trees"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/same-tree/"
},
{
    title: "Subtree of Another Tree",
    tags: ["Trees"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/subtree-of-another-tree/"
},
{
    title: "Lowest Common Ancestor of a Binary Search Tree",
    tags: ["Trees"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/"
},
{
    title: "Binary Tree Level Order Traversal",
    tags: ["Trees"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/binary-tree-level-order-traversal/"
},
{
    title: "Validate Binary Search Tree",
    tags: ["Trees"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/validate-binary-search-tree/"
},
{
    title: "Kth Smallest Element in a BST",
    tags: ["Trees"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/"
},
{
    title: "Construct Binary Tree from Preorder and Inorder Traversal",
    tags: ["Trees"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/"
},
{
    title: "Binary Tree Maximum Path Sum",
    tags: ["Trees"],
    difficulty: "Hard",
    link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/"
},
{
    title: "Serialize and Deserialize Binary Tree",
    tags: ["Trees"],
    difficulty: "Hard",
    link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/"
},
{
    title: "Kth Largest Element in a Stream",
    tags: ["Heaps & Priority Queues"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/kth-largest-element-in-a-stream/"
},
{
    title: "Last Stone Weight",
    tags: ["Heaps & Priority Queues"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/last-stone-weight/"
},
{
    title: "K Closest Points to Origin",
    tags: ["Heaps & Priority Queues"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/k-closest-points-to-origin/"
},
{
    title: "Kth Largest Element in an Array",
    tags: ["Heaps & Priority Queues"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/kth-largest-element-in-an-array/"
},
{
    title: "Task Scheduler",
    tags: ["Heaps & Priority Queues"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/task-scheduler/"
},
{
    title: "Find Median from Data Stream",
    tags: ["Heaps & Priority Queues"],
    difficulty: "Hard",
    link: "https://leetcode.com/problems/find-median-from-data-stream/"
},
{
    title: "Climbing Stairs",
    tags: ["DP"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/climbing-stairs/"
},
{
    title: "Coin Change",
    tags: ["DP"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/coin-change/"
},
{
    title: "Longest Increasing Subsequence",
    tags: ["DP"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/longest-increasing-subsequence/"
},
{
    title: "Longest Common Subsequence",
    tags: ["DP"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/longest-common-subsequence/"
},
{
    title: "Word Break",
    tags: ["DP"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/word-break/"
},
{
    title: "Combination Sum IV",
    tags: ["DP"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/combination-sum-iv/"
},
{
    title: "House Robber",
    tags: ["DP"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/house-robber/"
},
{
    title: "House Robber II",
    tags: ["DP"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/house-robber-ii/"
},
{
    title: "Decode Ways",
    tags: ["DP"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/decode-ways/"
},
{
    title: "Unique Paths",
    tags: ["DP"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/unique-paths/"
},
{
    title: "Jump Game",
    tags: ["DP"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/jump-game/"
},
{
    title: "Number of Islands",
    tags: ["Graphs"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/number-of-islands/"
},
{
    title: "Clone Graph",
    tags: ["Graphs"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/clone-graph/"
},
{
    title: "Max Area of Island",
    tags: ["Graphs"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/max-area-of-island/"
},
{
    title: "Pacific Atlantic Water Flow",
    tags: ["Graphs"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/pacific-atlantic-water-flow/"
},
{
    title: "Course Schedule",
    tags: ["Graphs"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/course-schedule/"
},
{
    title: "Number of Connected Components in an Undirected Graph",
    tags: ["Graphs"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/"
},
{
    title: "Graph Valid Tree",
    tags: ["Graphs"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/graph-valid-tree/"
},
{
    title: "Rotting Oranges",
    tags: ["Graphs"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/rotting-oranges/"
},
{
    title: "Word Ladder",
    tags: ["Graphs"],
    difficulty: "Hard",
    link: "https://leetcode.com/problems/word-ladder/"
},
{
    title: "Longest Substring Without Repeating Characters",
    tags: ["Sliding Window"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/"
},
{
    title: "Longest Repeating Character Replacement",
    tags: ["Sliding Window"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/longest-repeating-character-replacement/"
},
{
    title: "Permutation in String",
    tags: ["Sliding Window"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/permutation-in-string/"
},
{
    title: "Find All Anagrams in a String",
    tags: ["Sliding Window"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/find-all-anagrams-in-a-string/"
},
{
    title: "LRU Cache",
    tags: ["System Design"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/lru-cache/"
},
{
    title: "LFU Cache",
    tags: ["System Design"],
    difficulty: "Hard",
    link: "https://leetcode.com/problems/lfu-cache/"
},
{
    title: "Design Twitter",
    tags: ["System Design"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/design-twitter/"
},
{
    title: "Implement Trie (Prefix Tree)",
    tags: ["System Design"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/implement-trie-prefix-tree/"
},
{
    title: "Word Search",
    tags: ["System Design"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/word-search/"
},
{
    title: "Design HashMap",
    tags: ["System Design"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/design-hashmap/"
},
{
    title: "Design Hit Counter",
    tags: ["System Design"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/design-hit-counter/"
},
{
    title: "Design Snake Game",
    tags: ["System Design"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/design-snake-game/"
},
{
    title: "Design Tic-Tac-Toe",
    tags: ["System Design"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/design-tic-tac-toe/"
},
{
    title: "Design Circular Queue",
    tags: ["System Design"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/design-circular-queue/"
},
{
    title: "Alien Dictionary",
    tags: ["Advanced"],
    difficulty: "Hard",
    link: "https://leetcode.com/problems/alien-dictionary/"
},
{
    title: "Regular Expression Matching",
    tags: ["Advanced"],
    difficulty: "Hard",
    link: "https://leetcode.com/problems/regular-expression-matching/"
},
{
    title: "Wildcard Matching",
    tags: ["Advanced"],
    difficulty: "Hard",
    link: "https://leetcode.com/problems/wildcard-matching/"
},
{
    title: "Russian Doll Envelopes",
    tags: ["Advanced"],
    difficulty: "Hard",
    link: "https://leetcode.com/problems/russian-doll-envelopes/"
},
{
    title: "Minimum Window Substring",
    tags: ["Sliding Window"],
    difficulty: "Hard",
    link: "https://leetcode.com/problems/minimum-window-substring/"
},
{
    title: "Word Search II",
    tags: ["Advanced"],
    difficulty: "Hard",
    link: "https://leetcode.com/problems/word-search-ii/"
},
{
    title: "Number of Longest Increasing Subsequence",
    tags: ["DP"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/number-of-longest-increasing-subsequence/"
},
{
    title: "Basic Calculator",
    tags: ["Stack"],
    difficulty: "Hard",
    link: "https://leetcode.com/problems/basic-calculator/"
}  // ...more
];

export default function InterviewPage() {
  const navigate = useNavigate();
  // Category filter
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  
  // Tab 2 filters
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  // No floating button; each section will be scrollable

  // Function to determine category based on tags and content
  const getCategoryFromTags = (question) => {
    const tags = question.tags || [];
    const text = question.text?.toLowerCase() || "";
    
    // First, check if it's explicitly marked as HR
    if (question.category === "HR") return "HR";
    
    // For Technical questions, determine the specific subcategory based on tags and content
    if (question.category === "Technical") {
      // OOP questions
      if (tags.includes("OOP") || text.includes("oop") || text.includes("object-oriented") || 
          text.includes("class") || text.includes("inheritance") || text.includes("polymorphism") || 
          text.includes("encapsulation") || text.includes("abstraction")) return "OOP";
      
      // DSA questions
      if (tags.includes("DSA") || tags.includes("Array") || tags.includes("Linked List") || 
          tags.includes("Stack") || tags.includes("Queue") || tags.includes("Tree") || 
          tags.includes("Graph") || tags.includes("Hash") || tags.includes("Sorting") || 
          tags.includes("Searching") || text.includes("data structure") || text.includes("algorithm")) return "DSA";
      
      // DBMS questions
      if (tags.includes("DBMS") || tags.includes("SQL") || tags.includes("Database") || 
          text.includes("database") || text.includes("sql") || text.includes("table") || 
          text.includes("query") || text.includes("index")) return "DBMS";
      
      // API questions
      if (tags.includes("API") || tags.includes("REST") || tags.includes("HTTP") || 
          text.includes("api") || text.includes("rest") || text.includes("endpoint")) return "API";
      
      // Web Development questions
      if (tags.includes("Web") || tags.includes("HTML") || tags.includes("CSS") || 
          tags.includes("JavaScript") || tags.includes("DOM") || tags.includes("AJAX") || 
          text.includes("html") || text.includes("css") || text.includes("javascript") || 
          text.includes("web") || text.includes("frontend") || text.includes("backend")) return "Web";
      
      // Cloud questions
      if (tags.includes("Cloud") || tags.includes("AWS") || tags.includes("Azure") || 
          tags.includes("GCP") || text.includes("cloud") || text.includes("aws") || 
          text.includes("azure") || text.includes("serverless")) return "Cloud";
      
      // DevOps questions
      if (tags.includes("DevOps") || tags.includes("CI/CD") || tags.includes("Git") || 
          tags.includes("Docker") || tags.includes("Kubernetes") || text.includes("devops") || 
          text.includes("kubernetes") || text.includes("docker") || text.includes("pipeline")) return "DevOps";
      
      // Operating Systems questions
      if (tags.includes("OS") || tags.includes("Process") || tags.includes("Thread") || 
          tags.includes("Memory") || text.includes("operating system") || text.includes("process") || 
          text.includes("thread") || text.includes("memory") || text.includes("kernel")) return "OS";
      
      // AI/ML questions
      if (tags.includes("AI") || tags.includes("ML") || tags.includes("NLP") || 
          tags.includes("Neural") || text.includes("machine learning") || text.includes("artificial intelligence") || 
          text.includes("neural network") || text.includes("deep learning")) return "AI/ML";
      
      // System Design questions
      if (tags.includes("System Design") || tags.includes("Scalability") || tags.includes("Architecture") || 
          text.includes("system design") || text.includes("scalability") || text.includes("load balancing") || 
          text.includes("microservices") || text.includes("distributed")) return "System Design";
      
      // Programming Concepts (default for general programming questions)
      if (tags.includes("Programming Concepts") || tags.includes("Basics") || tags.includes("Concepts") || 
          tags.includes("Debugging") || tags.includes("Best Practices") || tags.includes("Concurrency") || 
          text.includes("programming") || text.includes("code") || text.includes("function") ||
          text.includes("variable") || text.includes("data type") || text.includes("compiled") ||
          text.includes("interpreted") || text.includes("pointer") || text.includes("recursion") ||
          text.includes("multithreading") || text.includes("library") || text.includes("framework")) return "Programming Concepts";
      
      // Default fallback for Technical questions
      return "Programming Concepts";
    }
    
    // Default fallback
    return "Programming Concepts";
  };

  // Filtered data
  const filteredHRTech = hrTechnicalQuestions.filter(q => {
    // Simple category match for HR questions
    if (selectedCategory === "HR") {
      return q.category === "HR";
    }
    
    // For technical categories, use the detection function
    if (selectedCategory !== "all" && selectedCategory !== "HR") {
      const actualCategory = getCategoryFromTags(q);
      return actualCategory === selectedCategory;
    }
    
    // Show all questions when "all" is selected
    return true;
  });
  const filteredCoding = codingQuestions.filter(q => {
    const diffMatch = difficultyFilter === "all" || q.difficulty === difficultyFilter;
    return diffMatch;
  });





  return (
    <div className="min-h-screen relative flex flex-col bg-gradient-to-br from-[#1a1f3a] via-[#2d3561] to-[#0f172a] text-foreground overflow-x-hidden">
      <Header />
      
      {/* Animated homepage-style background overlays */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419]/60 via-transparent to-[#1a1f3a]/80 opacity-90"></div>
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#36b5d3]/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-[#14788f]/10 blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-[#36b5d3]/15 blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-24 h-24 rounded-full bg-[#14788f]/15 blur-lg animate-pulse" style={{ animationDelay: '2s' }}></div>
        {/* Floating dots */}
        <div className="absolute top-20 left-20 w-3 h-3 bg-[#36b5d3]/40 rounded-full animate-ping shadow-lg shadow-[#36b5d3]/20"></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-[#14788f]/50 rounded-full animate-ping shadow-lg shadow-[#14788f]/20" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-32 w-2.5 h-2.5 bg-[#36b5d3]/40 rounded-full animate-ping shadow-lg shadow-[#36b5d3]/20" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-[#14788f]/45 rounded-full animate-ping shadow-lg shadow-[#14788f]/20" style={{ animationDelay: '3s' }}></div>
      </div>
      
      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto pt-10 pb-10 px-4 max-w-7xl relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-glow">
            Interview Questions & Coding Prep
          </h2>
          <p className="text-lg text-[#dee0e1]/80 max-w-2xl mx-auto font-light mb-8">
            Practice real interview questions and filter by type to prepare for your interviews!
          </p>
        </motion.div>
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-0 relative">
          {/* Vertical Divider for desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-cyan-400/10 via-slate-400/20 to-purple-400/10 z-10" style={{transform: 'translateX(-50%)'}}></div>
          {/* Left: HR/Technical/Domain-based Questions */}
          <div className="flex-1 min-w-0 px-0 lg:pr-8 flex flex-col">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-cyan-300 mb-2 tracking-tight">Interview Questions by Category</h3>
              <p className="text-sm text-slate-200/80 mb-4">
                Browse and practice real interview questions organized by category.
                {selectedCategory === "all" && (
                  <span className="ml-2 text-cyan-400">
                    Show {hrTechnicalQuestions.length} question{hrTechnicalQuestions.length !== 1 ? 's' : ''} from all categories
                  </span>
                )}
                {selectedCategory !== "all" && filteredHRTech.length > 0 && (
                  <span className="ml-2 text-cyan-400">
                    Showing {filteredHRTech.length} question{filteredHRTech.length !== 1 ? 's' : ''} in {selectedCategory}
                  </span>
                )}
              </p>
              
              <div className="flex gap-2 flex-wrap mb-6 relative z-50">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 bg-slate-800/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 z-[100] max-h-96 overflow-y-auto">
                    <SelectItem value="all" className="text-slate-200 hover:bg-slate-700">All Categories</SelectItem>
                    <SelectItem value="HR" className="text-slate-200 hover:bg-slate-700">HR</SelectItem>
                    <SelectItem value="Programming Concepts" className="text-slate-200 hover:bg-slate-700">Programming Concepts</SelectItem>
                    <SelectItem value="OOP" className="text-slate-200 hover:bg-slate-700">OOP</SelectItem>
                    <SelectItem value="DSA" className="text-slate-200 hover:bg-slate-700">DSA</SelectItem>
                    <SelectItem value="DBMS" className="text-slate-200 hover:bg-slate-700">DBMS</SelectItem>
                    <SelectItem value="API" className="text-slate-200 hover:bg-slate-700">API</SelectItem>
                    <SelectItem value="Web" className="text-slate-200 hover:bg-slate-700">Web</SelectItem>
                    <SelectItem value="Cloud" className="text-slate-200 hover:bg-slate-700">Cloud</SelectItem>
                    <SelectItem value="DevOps" className="text-slate-200 hover:bg-slate-700">DevOps</SelectItem>
                    <SelectItem value="OS" className="text-slate-200 hover:bg-slate-700">OS</SelectItem>
                    <SelectItem value="AI/ML" className="text-slate-200 hover:bg-slate-700">AI/ML</SelectItem>
                    <SelectItem value="System Design" className="text-slate-200 hover:bg-slate-700">System Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Question List - scrollable container */}
            <div className="max-h-[70vh] overflow-y-auto pr-2 scroll-smooth custom-thin-scrollbar">
            <motion.div
              key={selectedCategory} // Force re-render when category changes
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05, delayChildren: 0.1 },
                },
              }}
            >
              {filteredHRTech.map((q) => {
                const actualCategory = getCategoryFromTags(q);
                return (
                  <motion.div
                    key={`${actualCategory}-${q.text}`}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.25 }}
                    className="bg-white/10 backdrop-blur-xl border border-cyan-400/10 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="border-cyan-400/30 text-cyan-300 text-xs">
                        {actualCategory}
                      </Badge>
                    </div>
                    <div className="text-base md:text-lg font-medium leading-relaxed text-slate-100">
                      {q.text}
                    </div>
                    {q.tags && q.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {q.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {q.tags.length > 3 && (
                          <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded">
                            +{q.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
              {filteredHRTech.length === 0 && (
                <div className="text-center text-slate-400 py-12">
                  <p className="text-lg mb-2">No questions found for "{selectedCategory}"</p>
                  <p className="text-sm">Try selecting a different category</p>
                </div>
              )}
            </motion.div>
            </div>
          </div>
          {/* Right: Coding Questions */}
          <div className="flex-1 min-w-0 px-0 lg:pl-8 flex flex-col mt-12 lg:mt-0">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-purple-300 mb-2 tracking-tight">Frequently Asked Coding Questions</h3>
              <p className="text-sm text-slate-200/80 mb-4">Explore and practice coding questions commonly asked in interviews. Filter by difficulty or company.</p>
              <div className="flex gap-2 flex-wrap mb-4">
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-36 bg-slate-800/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 z-[100] max-h-96 overflow-y-auto">
                    <SelectItem value="all" className="text-slate-200 hover:bg-slate-700">All</SelectItem>
                    <SelectItem value="Easy" className="text-slate-200 hover:bg-slate-700">Easy</SelectItem>
                    <SelectItem value="Medium" className="text-slate-200 hover:bg-slate-700">Medium</SelectItem>
                    <SelectItem value="Hard" className="text-slate-200 hover:bg-slate-700">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Coding Questions Cards - scrollable container */}
            <div className="max-h-[70vh] overflow-y-auto pr-2 scroll-smooth custom-thin-scrollbar">
            <motion.div
              key={difficultyFilter} // Force re-render when difficulty changes
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05, delayChildren: 0.1 },
                },
              }}
            >
              {filteredCoding.map((q) => (
                <motion.div
                  key={`${q.title}-${q.difficulty}`}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.25 }}
                  className="bg-white/10 backdrop-blur-xl border border-purple-400/10 rounded-lg px-4 py-3 hover:bg-purple-400/10 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-base md:text-lg font-medium text-purple-200 group-hover:text-purple-100 transition-colors">
                      {q.title}
                    </h4>
                    <div className="flex items-center gap-2 ml-4">
                      {(() => {
                        let variant: 'secondary' | 'default' | 'destructive' = 'default';
                        if (q.difficulty === 'Easy') variant = 'secondary';
                        else if (q.difficulty === 'Hard') variant = 'destructive';
                        return <Badge variant={variant} className="text-xs px-2 py-1">{q.difficulty}</Badge>;
                      })()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {q.tags.map((tag) => (
                      <Badge 
                        key={`${q.title}-${tag}`} 
                        variant="outline" 
                        className="border-purple-400/30 text-purple-200 group-hover:border-purple-400/60 group-hover:text-purple-100 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-end">
                    <a 
                      href={q.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/30 hover:border-purple-400/50 text-purple-200 hover:text-purple-100 rounded-md text-sm font-medium transition-all duration-200 group-hover:shadow-lg group-hover:shadow-purple-500/20"
                    >
                      Practice Now
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </motion.div>
              ))}
              
              {filteredCoding.length === 0 && (
                <div className="text-center text-slate-400 py-12">
                  <p className="text-lg mb-2">No coding questions found for "{difficultyFilter}"</p>
                  <p className="text-sm">Try selecting a different difficulty level</p>
                </div>
              )}
            </motion.div>
            </div>
          </div>
        </div>
      </div>
      {/* Global CTA below both sections */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex justify-center">
          <Button
            variant="hero"
            size="lg"
            className="relative group overflow-hidden shadow-2xl px-12 py-6 text-xl md:text-2xl rounded-2xl tracking-wide ring-1 ring-white/20 hover:ring-white/30 hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.55)]"
            onClick={() => navigate('/competency-test')}
          >
            <span className="relative z-10 font-semibold drop-shadow-sm">Test Your Confidence!</span>
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.25),transparent)] group-hover:translate-x-full transition-transform duration-700"
            />
          </Button>
        </div>
      </div>
      <Footer />
      {/* Custom style for select dropdown options */}
      <style>{`
        select.custom-select, select.custom-select option {
          background-color: #1a223a;
          color: #e0f2fe;
        }
        select.custom-select:focus, select.custom-select option:checked {
          background-color: #164e63;
          color: #38bdf8;
        }
        /* Thin, subtle scrollbar for the scrollable sections */
        .custom-thin-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
        }
        .custom-thin-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-thin-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-thin-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.35);
          border-radius: 9999px;
        }
        .custom-thin-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(148, 163, 184, 0.55);
        }
      `}</style>
    </div>
  );
}