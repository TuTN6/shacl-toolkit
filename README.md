# SHACL-Based Person Data Management System

A comprehensive JavaScript implementation for managing Person data with SHACL 1.2 transformation and validation, including Apache Jena Fuseki triple store integration.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Usage Examples](#usage-examples)
- [Fuseki Integration](#fuseki-integration)
- [Testing](#testing)
- [SHACL Schema](#shacl-schema)

## 🌟 Overview

This system provides a complete solution for:

- Managing Person entities in source and target RDF formats
- Transforming data between namespaces (ex: → Person:/Class:)
- Calculating derived properties (fullName, age)
- Validating against SHACL 1.2 constraints
- Connecting to Apache Jena Fuseki for persistent storage
- Executing SPARQL queries and updates

## ✨ Features

### Core Classes

- **Person**: Source model (ex: namespace)
  - Properties: firstName, lastName, birthDate
  - Derived: fullName, age calculation
  - Validation against SHACL constraints

- **TransformedPerson**: Target model (Person:/Class: namespaces)
  - Properties: firstName, lastName, fullName, age
  - Automatic fullName consistency validation
  - Age range validation (0-150)

- **DataModel**: Global registry and manager
  - Class registration and instance tracking
  - Transformation orchestration
  - Batch operations
  - Import/export (JSON, Turtle)

- **FusekiConnector**: Triple store integration
  - SPARQL query/update/construct/ask
  - Graph Store Protocol support
  - Batch operations
  - Connection pooling

### Key Features

- ✅ Contemporary ECMAScript (ES2022+)
- ✅ Private class fields
- ✅ Comprehensive getters/setters
- ✅ JSDoc documentation
- ✅ Full test suite
- ✅ RDF serialization (Turtle, JSON-LD)
- ✅ SHACL 1.2 validation
- ✅ Fuseki/SPARQL integration

## 📦 Installation

```bash
# Clone or download the project
git clone <repository-url>
cd person-data-management

# Install dependencies (Node.js 18+ required)
npm install

# For Fuseki integration, ensure Fuseki is running:
# Download from: https://jena.apache.org/download/
fuseki-server --mem /test
```

## 🚀 Quick Start

### Basic Usage

```javascript
import { Person } from './person.js';
import { TransformedPerson } from './transformed-person.js';

// Create a person
const person = new Person({
  firstName: 'Jane',
  lastName: 'Doe',
  birthDate: '2000-01-01'
});

console.log(person.fullName);  // "Jane Doe"
console.log(person.getAge());  // 26 (as of 2026-01-10)

// Transform to target format
const transformed = TransformedPerson.fromPerson(person);
console.log(transformed.toTurtle());
```

### With DataModel

```javascript
import { DataModel } from './data-model.js';

// Create and track instances
DataModel.create('Person', {
  firstName: 'John',
  lastName: 'Smith',
  birthDate: '1985-06-15'
});

// Transform all instances
const people = DataModel.getInstances('Person');
people.forEach(person => {
  DataModel.transform(person, 'TransformedPerson');
});

// Export to Turtle
const turtle = DataModel.exportToTurtle();
console.log(turtle);
```

### With Fuseki

```javascript
import { createLocalConnector } from './fuseki-connector.js';
import { Person } from './person.js';

const connector = createLocalConnector('test');

// Save to triple store
const person = new Person({
  firstName: 'Alice',
  lastName: 'Johnson',
  birthDate: '1992-03-22'
});

await connector.save(person);

// Query back
const retrieved = await connector.getPerson(person.uri);
console.log(retrieved);
```

## 🏗️ Architecture

### Class Hierarchy

```
Person (Source Model)
  ├─ Private fields: #uri, #firstName, #lastName, #birthDate
  ├─ Getters: uri, firstName, lastName, birthDate, fullName
  ├─ Methods: getAge(), validate(), toTurtle(), toJSON()
  └─ Static: fromJSON(), fromTurtle(), fromJsonLd()

TransformedPerson (Target Model)
  ├─ Private fields: #uri, #firstName, #lastName, #fullName, #age
  ├─ Getters/Setters: firstName, lastName, fullName, age
  ├─ Methods: validate(), toTurtle(), toJSON()
  └─ Static: fromPerson(), fromJSON(), fromTurtle()

DataModel (Manager)
  ├─ Static registry of classes
  ├─ Instance tracking per class
  ├─ Transformation pipeline
  ├─ Validation orchestration
  └─ Import/export operations

FusekiConnector (Integration)
  ├─ SPARQL endpoint management
  ├─ Query/Update/Construct/Ask
  ├─ Graph Store Protocol
  └─ Batch operations
```

### Transformation Pipeline

```
Source Data (ex: namespace)
  ↓
Person.fromJSON() / Person.fromTurtle()
  ↓
Person instance
  ↓
TransformedPerson.fromPerson()
  ↓
TransformedPerson instance (Person:/Class: namespaces)
  ↓
validate() → toTurtle() / toJSON()
  ↓
FusekiConnector.save()
  ↓
Fuseki Triple Store
```

## 📚 API Documentation

### Person Class

#### Constructor

```javascript
new Person({
  uri?: string,           // Optional, auto-generated if not provided
  firstName: string,      // Required, non-empty
  lastName: string,       // Required, non-empty
  birthDate: Date|string  // Required, must be in the past
})
```

#### Properties

- `uri` (getter): Person URI
- `localName` (getter): Local name from URI
- `firstName` (getter/setter): First name
- `lastName` (getter/setter): Last name
- `birthDate` (getter/setter): Birth date
- `birthDateISO` (getter): Birth date in ISO format (YYYY-MM-DD)
- `fullName` (getter): Derived full name

#### Methods

- `getAge(referenceDate?: Date): number` - Calculate age
- `validate(): {valid: boolean, errors: string[]}` - Validate data
- `toTurtle(includePrefix?: boolean): string` - Export to Turtle
- `toJSON(): Object` - Export to JSON
- `toJsonLd(): Object` - Export to JSON-LD
- `toString(): string` - String representation

#### Static Methods

- `fromJSON(obj: Object): Person`
- `fromTurtle(turtle: string): Person`
- `fromJsonLd(jsonLd: Object): Person`

### TransformedPerson Class

#### Constructor

```javascript
new TransformedPerson({
  uri?: string,        // Optional, auto-generated if not provided
  firstName: string,   // Required, non-empty
  lastName: string,    // Required, non-empty
  fullName: string,    // Required, must match firstName + lastName
  age: number          // Required, 0-150
})
```

#### Properties

- `uri`, `localName`, `firstName`, `lastName`, `fullName`, `age` (getters/setters)

#### Methods

- `validate(): {valid: boolean, errors: string[]}`
- `toTurtle(includePrefix?: boolean): string`
- `toJSON(): Object`
- `toJsonLd(): Object`

#### Static Methods

- `fromPerson(person: Person, referenceDate?: Date): TransformedPerson`
- `fromJSON(obj: Object): TransformedPerson`
- `fromTurtle(turtle: string): TransformedPerson`

### DataModel Class

All methods are static:

#### Registration

```javascript
DataModel.registerClass(
  name: string,
  classConstructor: Function,
  options: {
    rdfType: string,
    namespace: string,
    transformer?: Function,
    validator?: Function
  }
)
```

#### Instance Management

```javascript
DataModel.create(className: string, data: Object): Object
DataModel.getInstances(className: string): Array
DataModel.clearInstances(className: string): void
DataModel.clearAll(): void
```

#### Transformation & Validation

```javascript
DataModel.transform(instance: Object, targetClassName: string, options?: Object): Object
DataModel.validateInstance(className: string, instance: Object): {valid, errors}
DataModel.validateAll(className: string): Array
```

#### Querying

```javascript
DataModel.find(className: string, predicate: Function): Array
DataModel.findOne(className: string, predicate: Function): Object|null
DataModel.findByUri(className: string, uri: string): Object|null
```

#### Import/Export

```javascript
DataModel.exportToJSON(className?: string): Object
DataModel.exportToTurtle(className?: string): string
DataModel.importFromJSON(className: string, data: Array): Array
```

#### Statistics

```javascript
DataModel.getStatistics(): Object
DataModel.getClassMetadata(className: string): Object
```

### FusekiConnector Class

#### Constructor

```javascript
new FusekiConnector({
  baseUrl: string,      // e.g., 'http://localhost:3030'
  dataset: string,      // Dataset name
  username?: string,    // Optional authentication
  password?: string
})

// Or use helper:
createLocalConnector(dataset?: string): FusekiConnector
```

#### Properties

- `queryEndpoint` (getter): SPARQL query endpoint URL
- `updateEndpoint` (getter): SPARQL update endpoint URL
- `dataEndpoint` (getter): Data endpoint URL

#### SPARQL Operations

```javascript
async query(sparql: string): Promise<Object>
async construct(sparql: string, format?: string): Promise<string>
async ask(sparql: string): Promise<boolean>
async update(sparql: string): Promise<void>
```

#### Data Operations

```javascript
async insert(data: string, contentType?: string, graph?: string): Promise<void>
async save(object: Object, graph?: string): Promise<void>
async saveAll(objects: Array, graph?: string): Promise<void>
async retrieve(graph?: string, format?: string): Promise<string>
async clear(graph?: string): Promise<void>
```

#### Utility Methods

```javascript
async findByType(rdfType: string): Promise<Array<string>>
async findByPattern(pattern: string, prefixes?: Object): Promise<Object>
async getPerson(uri: string): Promise<Object|null>
async getTransformedPerson(uri: string): Promise<Object|null>
async ping(): Promise<boolean>
async getStats(): Promise<Object>
async listDatasets(): Promise<Array<string>>
```

## 💡 Usage Examples

### Example 1: Age Calculation with Birthday Logic

```javascript
import { Person } from './person.js';

const person = new Person({
  firstName: 'Jane',
  lastName: 'Doe',
  birthDate: '2000-01-01'
});

// Calculate age on different dates
const age2026 = person.getAge(new Date('2026-01-10')); // 26
const age2025 = person.getAge(new Date('2025-12-31')); // 25 (birthday not reached)
```

### Example 2: Batch Transformation

```javascript
import { DataModel } from './data-model.js';

DataModel.clearAll();

// Create multiple people
const peopleData = [
  { firstName: 'Alice', lastName: 'Johnson', birthDate: '1992-03-22' },
  { firstName: 'Bob', lastName: 'Williams', birthDate: '1978-11-30' },
  { firstName: 'Carol', lastName: 'Brown', birthDate: '2005-07-04' }
];

peopleData.forEach(data => DataModel.create('Person', data));

// Transform all
const referenceDate = new Date('2026-01-10');
DataModel.getInstances('Person').forEach(person => {
  DataModel.transform(person, 'TransformedPerson', { referenceDate });
});

// Validate all
const validations = DataModel.validateAll('TransformedPerson');
console.log('All valid:', validations.every(v => v.validation.valid));
```

### Example 3: RDF Export

```javascript
import { DataModel } from './data-model.js';

// Export all instances to Turtle
const turtle = DataModel.exportToTurtle();
console.log(turtle);

// Export specific class to JSON
const json = DataModel.exportToJSON('Person');
console.log(JSON.stringify(json, null, 2));
```

### Example 4: SPARQL Queries

```javascript
import { createLocalConnector } from './fuseki-connector.js';

const connector = createLocalConnector('test');

// SELECT query
const query = `
  PREFIX ex: <http://example.com/ex#>
  SELECT ?person ?name
  WHERE {
    ?person a ex:Person ;
            ex:firstName ?name .
  }
`;

const results = await connector.query(query);
console.log(results.results.bindings);

// CONSTRUCT query
const construct = `
  PREFIX ex: <http://example.com/ex#>
  CONSTRUCT { ?s ?p ?o }
  WHERE { ?s a ex:Person ; ?p ?o }
`;

const rdf = await connector.construct(construct);
console.log(rdf);

// ASK query
const ask = `
  PREFIX ex: <http://example.com/ex#>
  ASK { ex:JaneDoe a ex:Person }
`;

const exists = await connector.ask(ask);
console.log('Exists:', exists);
```

### Example 5: Graph Store Protocol

```javascript
import { createLocalConnector } from './fuseki-connector.js';
import { Person } from './person.js';

const connector = createLocalConnector('test');
const graphUri = 'http://example.com/graph/people';

// Save to named graph
const person = new Person({
  firstName: 'Graph',
  lastName: 'Test',
  birthDate: '1995-05-15'
});

await connector.save(person, graphUri);

// Retrieve from named graph
const data = await connector.retrieve(graphUri);
console.log(data);

// Clear named graph
await connector.clear(graphUri);
```

## 🔌 Fuseki Integration

### Starting Fuseki

```bash
# Download Fuseki from Apache Jena website
# https://jena.apache.org/download/

# Start with in-memory dataset
fuseki-server --mem /test

# Or start with persistent dataset
fuseki-server --loc=./data /test

# Fuseki UI available at: http://localhost:3030
```

### Configuration

The default configuration connects to:

- **Base URL**: `http://localhost:3030`
- **Dataset**: `test`

To use a different configuration:

```javascript
import { FusekiConnector } from './fuseki-connector.js';

const connector = new FusekiConnector({
  baseUrl: 'http://my-server:3030',
  dataset: 'my-dataset',
  username: 'admin',  // Optional
  password: 'secret'  // Optional
});
```

### Complete Workflow with Fuseki

```javascript
import { DataModel } from './data-model.js';
import { createLocalConnector } from './fuseki-connector.js';

// 1. Create data
DataModel.clearAll();
DataModel.create('Person', {
  firstName: 'Workflow',
  lastName: 'Example',
  birthDate: '1990-01-01'
});

// 2. Transform
DataModel.getInstances('Person').forEach(person => {
  DataModel.transform(person, 'TransformedPerson');
});

// 3. Save to Fuseki
const connector = createLocalConnector('test');
await connector.clear();  // Clear existing data

const people = DataModel.getInstances('Person');
await connector.saveAll(people);

// 4. Query from Fuseki
const uris = await connector.findByType('http://example.com/ex#Person');
console.log('Found', uris.length, 'people in triple store');

// 5. Retrieve and reconstruct
for (const uri of uris) {
  const data = await connector.getPerson(uri);
  const person = Person.fromJSON({ ...data, uri });
  console.log(person.toString());
}
```

## 🧪 Testing

### Running Tests

```bash
# Run the complete test suite
node test-suite.js

# Run demo examples
node index.js
```

### Test Coverage

The test suite includes:

- ✅ Person class creation and validation
- ✅ Age calculation with birthday logic
- ✅ TransformedPerson creation and validation
- ✅ Transformation from Person to TransformedPerson
- ✅ DataModel registration and management
- ✅ Instance querying and filtering
- ✅ Import/export (JSON, Turtle, JSON-LD)
- ✅ FusekiConnector configuration
- ✅ Error handling and validation
- ✅ Integration workflows

### Sample Test Output

```
🧪 Starting Test Suite

============================================================
✅ Person: Create with valid data
✅ Person: Calculate age correctly
✅ Person: Export to Turtle
✅ TransformedPerson: Transform from Person
✅ DataModel: Create Person instance
✅ FusekiConnector: Create instance
... [60+ tests]
============================================================

📊 Test Results:
   Passed: 65
   Failed: 0
   Total:  65

✅ All tests passed!
```

## 📄 SHACL Schema

The system is based on a comprehensive SHACL 1.2 schema that includes:

### Shapes

- `ex:PersonTransformationShape` - Transforms source to target
- `ex:TargetPersonShape` - Validates transformed data

### Rules

1. Transform subject URI (ex: → Person:)
2. Copy firstName property
3. Copy lastName property
4. Generate fullName from firstName + lastName
5. Calculate age from birthDate

### Node Expressions

- Full name concatenation
- Age calculation with birthday logic
- Namespace transformation

### Constraints

- Property existence and cardinality
- Datatype validation
- Pattern matching
- Range validation
- Custom constraint components

See `person-transformation-shacl.ttl` for the complete schema.

## 🔧 Requirements

- Node.js 18+ (for ES modules and private fields)
- Apache Jena Fuseki 4.x+ (for triple store operations)

## 📝 License

MIT License - See LICENSE file for details

## 👥 Contributing

Contributions welcome! Please submit pull requests or open issues.

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**SHACL Version**: 1.2  
**Fuseki Version**: 4.x+
