# Business Mapping Application

This project is a Business Mapping Application that uses Neo4j for data storage, Spring Boot for the backend, and Angular for the frontend. The application allows users to visualize and interact with customer data, sectors, account managers, and projects.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Running Neo4j with Docker](#running-neo4j-with-docker)
3. [Initializing the Neo4j Database](#initializing-the-neo4j-database)
4. [Running the Spring Boot Application](#running-the-spring-boot-application)
5. [Running the Angular Application](#running-the-angular-application)
6. [License](#license)

## Getting Started

### Prerequisites
- Docker
- Java 11+
- Node.js and npm

### Running Neo4j with Docker

1. **Pull the Neo4j Docker image with APOC:**
   ```bash
   docker pull neo4j:latest
   ```

2. **Run the Neo4j container:**
   ```bash
   docker run \
       --name neo4j \
       -p7474:7474 -p7687:7687 \
       -d \
       -e NEO4J_AUTH=neo4j/test \
       -e NEO4JLABS_PLUGINS='["apoc"]' \
       neo4j:latest
   ```

3. **Access the Neo4j Browser:**
   Open your browser and navigate to [http://localhost:7474](http://localhost:7474). Log in with the username `neo4j` and password `test`.

### Initializing the Neo4j Database

1. **Open the Neo4j Browser:**
   Navigate to [http://localhost:7474](http://localhost:7474) and log in.

2. **Run the following script to initialize the database:**
   ```cypher
   // Warmup the database
   CALL apoc.warmup.run();

   // Create Sectors with UUID
   CREATE
     (tech:Sector {name: "Technology", uuid: apoc.create.uuid()}),
     (fin:Sector {name: "Finance", uuid: apoc.create.uuid()}),
     (health:Sector {name: "Healthcare", uuid: apoc.create.uuid()}),
     (edu:Sector {name: "Education", uuid: apoc.create.uuid()}),
     (mfg:Sector {name: "Manufacturing", uuid: apoc.create.uuid()}),

   // Create Account Managers
     (mgr1:AccountManager {name: "John Doe", uuid: apoc.create.uuid()}),
     (mgr2:AccountManager {name: "Jane Smith", uuid: apoc.create.uuid()}),

   // Assign Sectors to Account Managers
     (mgr1)-[:MANAGES]->(tech),
     (mgr1)-[:MANAGES]->(fin),
     (mgr2)-[:MANAGES]->(health),
     (mgr2)-[:MANAGES]->(edu),
     (mgr2)-[:MANAGES]->(mfg),

   // Create Customers with detailed attributes
     (custA:Customer {name: "AlphaCorp", industry: "Technology", revenue: 1000000, numberOfEmployees: 500, location: "Silicon Valley", uuid: apoc.create.uuid()})-[:OPERATES_IN]->(tech),
     (custB:Customer {name: "BetaLimited", industry: "Finance", revenue: 500000, numberOfEmployees: 200, location: "New York", uuid: apoc.create.uuid()})-[:OPERATES_IN]->(fin),
     (custC:Customer {name: "GammaInc", industry: "Healthcare", revenue: 750000, numberOfEmployees: 300, location: "Boston", uuid: apoc.create.uuid()})-[:OPERATES_IN]->(health),
     (custD:Customer {name: "DeltaSolutions", industry: "Manufacturing", revenue: 300000, numberOfEmployees: 150, location: "Brussels", uuid: apoc.create.uuid()})-[:OPERATES_IN]->(mfg),
     (custE:Customer {name: "EpsilonEnterprises", industry: "Education", revenue: 400000, numberOfEmployees: 100, location: "Antwerp", uuid: apoc.create.uuid()})-[:OPERATES_IN]->(edu),
     (custF:Customer {name: "ZetaTech", industry: "Technology", revenue: 1200000, numberOfEmployees: 600, location: "Ghent", uuid: apoc.create.uuid()})-[:OPERATES_IN]->(tech),

   // Create Projects with detailed attributes
     (proj1:Project {name: "Cloud Migration", success: true, year: 2023, startDate: date("2023-01-01"), plannedEndDate: date("2023-06-30"), endDate: date("2023-06-30"), status: "Completed", budget: 500000, actualCost: 450000, scope: "Infrastructure migration to cloud platform", onTime: true, uuid: apoc.create.uuid()})<-[:HAS_PROJECT]-(custA),
     (proj2:Project {name: "Data Analytics", success: true, year: 2024, startDate: date("2023-02-01"), endDate: date("2023-08-30"), status: "Ongoing", budget: 600000, actualCost: 620000, scope: "Implement advanced data analytics capabilities", onTime: false, uuid: apoc.create.uuid()})<-[:HAS_PROJECT]-(custB),
     (proj3:Project {name: "Cybersecurity Upgrade", success: false, year: 2023, startDate: date("2023-03-01"), endDate: date("2023-09-30"), status: "Delayed", budget: 400000, actualCost: 500000, scope: "Upgrade cybersecurity measures across the organization", onTime: false, uuid: apoc.create.uuid()})<-[:HAS_PROJECT]-(custC);
   ```

### Running the Spring Boot Application

1. **Navigate to the src (backend) directory:**
   ```bash
   cd src
   ```

2. **Build the Spring Boot application:**
   ```bash
   ./mvnw clean install
   ```

3. **Run the Spring Boot application:**
   ```bash
   ./mvnw spring-boot:run
   ```

### Running the Angular Application

1. **Navigate to the client (frontend) directory:**
   ```bash
   cd client
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Run the Angular application:**
   ```bash
   ng serve
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:4200
   ```

### License

This project is licensed under the MIT License. See the LICENSE file for details.