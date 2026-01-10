/**
 * FusekiConnector Class
 * Connector for Apache Jena Fuseki triple store
 * Handles SPARQL queries, updates, and RDF data operations
 * 
 * @class FusekiConnector
 * @version 1.0.0
 */

export class FusekiConnector {
  #baseUrl;
  #dataset;
  #username;
  #password;
  #headers;

  /**
   * Creates a new FusekiConnector instance
   * 
   * @param {Object} config - Configuration object
   * @param {string} config.baseUrl - Base URL of Fuseki server (e.g., 'http://localhost:3030')
   * @param {string} config.dataset - Dataset name
   * @param {string} [config.username] - Username for authentication
   * @param {string} [config.password] - Password for authentication
   */
  constructor({ baseUrl, dataset, username, password }) {
    if (!baseUrl) {
      throw new Error('baseUrl is required');
    }
    if (!dataset) {
      throw new Error('dataset is required');
    }

    this.#baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.#dataset = dataset;
    this.#username = username;
    this.#password = password;

    // Set up headers
    this.#headers = {
      'Content-Type': 'application/sparql-query',
      'Accept': 'application/sparql-results+json'
    };

    // Add basic auth if credentials provided
    if (this.#username && this.#password) {
      const auth = Buffer.from(`${this.#username}:${this.#password}`).toString('base64');
      this.#headers['Authorization'] = `Basic ${auth}`;
    }
  }

  /**
   * Gets the SPARQL query endpoint URL
   * @returns {string} Query endpoint URL
   */
  get queryEndpoint() {
    return `${this.#baseUrl}/${this.#dataset}/query`;
  }

  /**
   * Gets the SPARQL update endpoint URL
   * @returns {string} Update endpoint URL
   */
  get updateEndpoint() {
    return `${this.#baseUrl}/${this.#dataset}/update`;
  }

  /**
   * Gets the data endpoint URL
   * @returns {string} Data endpoint URL
   */
  get dataEndpoint() {
    return `${this.#baseUrl}/${this.#dataset}/data`;
  }

  /**
   * Gets the GSP (Graph Store Protocol) endpoint URL
   * @param {string} [graph] - Optional graph name
   * @returns {string} GSP endpoint URL
   */
  getGspEndpoint(graph) {
    if (graph) {
      return `${this.#baseUrl}/${this.#dataset}/data?graph=${encodeURIComponent(graph)}`;
    }
    return `${this.#baseUrl}/${this.#dataset}/data?default`;
  }

  /**
   * Executes a SPARQL SELECT query
   * 
   * @param {string} query - SPARQL SELECT query
   * @returns {Promise<Object>} Query results
   */
  async query(query) {
    try {
      const response = await fetch(this.queryEndpoint, {
        method: 'POST',
        headers: this.#headers,
        body: query
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Query failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`SPARQL query error: ${error.message}`);
    }
  }

  /**
   * Executes a SPARQL CONSTRUCT query
   * 
   * @param {string} query - SPARQL CONSTRUCT query
   * @param {string} [format='text/turtle'] - Output format
   * @returns {Promise<string>} RDF data in requested format
   */
  async construct(query, format = 'text/turtle') {
    try {
      const response = await fetch(this.queryEndpoint, {
        method: 'POST',
        headers: {
          ...this.#headers,
          'Content-Type': 'application/sparql-query',
          'Accept': format
        },
        body: query
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Construct query failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.text();
    } catch (error) {
      throw new Error(`SPARQL construct error: ${error.message}`);
    }
  }

  /**
   * Executes a SPARQL ASK query
   * 
   * @param {string} query - SPARQL ASK query
   * @returns {Promise<boolean>} Query result
   */
  async ask(query) {
    try {
      const response = await fetch(this.queryEndpoint, {
        method: 'POST',
        headers: this.#headers,
        body: query
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ask query failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      return result.boolean;
    } catch (error) {
      throw new Error(`SPARQL ask error: ${error.message}`);
    }
  }

  /**
   * Executes a SPARQL UPDATE query (INSERT, DELETE, etc.)
   * 
   * @param {string} update - SPARQL UPDATE query
   * @returns {Promise<void>}
   */
  async update(update) {
    try {
      const response = await fetch(this.updateEndpoint, {
        method: 'POST',
        headers: {
          ...this.#headers,
          'Content-Type': 'application/sparql-update'
        },
        body: update
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Update failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      throw new Error(`SPARQL update error: ${error.message}`);
    }
  }

  /**
   * Inserts RDF data using Graph Store Protocol
   * 
   * @param {string} data - RDF data (Turtle, RDF/XML, etc.)
   * @param {string} [contentType='text/turtle'] - Content type of the data
   * @param {string} [graph] - Optional graph name
   * @returns {Promise<void>}
   */
  async insert(data, contentType = 'text/turtle', graph) {
    try {
      const endpoint = this.getGspEndpoint(graph);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...this.#headers,
          'Content-Type': contentType
        },
        body: data
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Insert failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      throw new Error(`Insert error: ${error.message}`);
    }
  }

  /**
   * Saves an object with toTurtle method to Fuseki
   * 
   * @param {Object} object - Object with toTurtle() method
   * @param {string} [graph] - Optional graph name
   * @returns {Promise<void>}
   */
  async save(object, graph) {
    if (!object.toTurtle) {
      throw new Error('Object must have a toTurtle() method');
    }

    const turtle = object.toTurtle(true);
    await this.insert(turtle, 'text/turtle', graph);
  }

  /**
   * Saves multiple objects to Fuseki
   * 
   * @param {Array<Object>} objects - Array of objects with toTurtle() methods
   * @param {string} [graph] - Optional graph name
   * @returns {Promise<void>}
   */
  async saveAll(objects, graph) {
    const turtleParts = objects.map((obj, index) => {
      if (!obj.toTurtle) {
        throw new Error('All objects must have a toTurtle() method');
      }
      return obj.toTurtle(index === 0);
    });

    const combinedTurtle = turtleParts.join('\n\n');
    await this.insert(combinedTurtle, 'text/turtle', graph);
  }

  /**
   * Retrieves all triples from a graph
   * 
   * @param {string} [graph] - Optional graph name
   * @param {string} [format='text/turtle'] - Output format
   * @returns {Promise<string>} RDF data
   */
  async retrieve(graph, format = 'text/turtle') {
    try {
      const endpoint = this.getGspEndpoint(graph);
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          ...this.#headers,
          'Accept': format
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Retrieve failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.text();
    } catch (error) {
      throw new Error(`Retrieve error: ${error.message}`);
    }
  }

  /**
   * Deletes all triples from a graph
   * 
   * @param {string} [graph] - Optional graph name
   * @returns {Promise<void>}
   */
  async clear(graph) {
    try {
      const endpoint = this.getGspEndpoint(graph);
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: this.#headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Clear failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      throw new Error(`Clear error: ${error.message}`);
    }
  }

  /**
   * Finds objects of a specific RDF type
   * 
   * @param {string} rdfType - RDF type URI
   * @returns {Promise<Array>} Array of subject URIs
   */
  async findByType(rdfType) {
    const query = `
      SELECT ?subject
      WHERE {
        ?subject a <${rdfType}> .
      }
    `;

    const results = await this.query(query);
    return results.results.bindings.map(binding => binding.subject.value);
  }

  /**
   * Finds objects matching a SPARQL pattern
   * 
   * @param {string} pattern - SPARQL graph pattern
   * @param {Object} [prefixes={}] - PREFIX declarations
   * @returns {Promise<Object>} Query results
   */
  async findByPattern(pattern, prefixes = {}) {
    let prefixDeclarations = '';
    for (const [prefix, uri] of Object.entries(prefixes)) {
      prefixDeclarations += `PREFIX ${prefix}: <${uri}>\n`;
    }

    const query = `
      ${prefixDeclarations}
      SELECT *
      WHERE {
        ${pattern}
      }
    `;

    return await this.query(query);
  }

  /**
   * Retrieves a Person by URI
   * 
   * @param {string} uri - Person URI
   * @returns {Promise<Object|null>} Person data or null if not found
   */
  async getPerson(uri) {
    const query = `
      PREFIX ex: <http://example.com/ex#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      
      SELECT ?firstName ?lastName ?birthDate
      WHERE {
        <${uri}> a ex:Person ;
                 ex:firstName ?firstName ;
                 ex:lastName ?lastName ;
                 ex:birthDate ?birthDate .
      }
    `;

    const results = await this.query(query);
    
    if (results.results.bindings.length === 0) {
      return null;
    }

    const binding = results.results.bindings[0];
    return {
      uri,
      firstName: binding.firstName.value,
      lastName: binding.lastName.value,
      birthDate: binding.birthDate.value
    };
  }

  /**
   * Retrieves a TransformedPerson by URI
   * 
   * @param {string} uri - Person URI
   * @returns {Promise<Object|null>} TransformedPerson data or null if not found
   */
  async getTransformedPerson(uri) {
    const query = `
      PREFIX Person: <http://example.com/ns/Person#>
      PREFIX Class: <http://example.com/ns/Class#>
      PREFIX ex: <http://example.com/ex#>
      
      SELECT ?firstName ?lastName ?fullName ?age
      WHERE {
        <${uri}> a Class:Person ;
                 ex:firstName ?firstName ;
                 ex:lastName ?lastName ;
                 Person:fullName ?fullName ;
                 Person:age ?age .
      }
    `;

    const results = await this.query(query);
    
    if (results.results.bindings.length === 0) {
      return null;
    }

    const binding = results.results.bindings[0];
    return {
      uri,
      firstName: binding.firstName.value,
      lastName: binding.lastName.value,
      fullName: binding.fullName.value,
      age: parseInt(binding.age.value, 10)
    };
  }

  /**
   * Lists all datasets on the Fuseki server
   * 
   * @returns {Promise<Array<string>>} Array of dataset names
   */
  async listDatasets() {
    try {
      const response = await fetch(`${this.#baseUrl}/$/datasets`, {
        method: 'GET',
        headers: {
          ...this.#headers,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`List datasets failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.datasets.map(ds => ds['ds.name'].replace(/^\//, ''));
    } catch (error) {
      throw new Error(`List datasets error: ${error.message}`);
    }
  }

  /**
   * Checks if the server is accessible
   * 
   * @returns {Promise<boolean>} True if server is accessible
   */
  async ping() {
    try {
      const response = await fetch(`${this.#baseUrl}/$/ping`, {
        method: 'GET',
        headers: this.#headers
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets server statistics
   * 
   * @returns {Promise<Object>} Server statistics
   */
  async getStats() {
    try {
      const response = await fetch(`${this.#baseUrl}/$/stats/${this.#dataset}`, {
        method: 'GET',
        headers: {
          ...this.#headers,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Get stats failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Get stats error: ${error.message}`);
    }
  }

  /**
   * Executes a batch of SPARQL updates as a transaction
   * 
   * @param {Array<string>} updates - Array of SPARQL UPDATE queries
   * @returns {Promise<void>}
   */
  async batchUpdate(updates) {
    const combinedUpdate = updates.join(';\n');
    await this.update(combinedUpdate);
  }

  /**
   * String representation
   * @returns {string} String representation of the connector
   */
  toString() {
    return `FusekiConnector { ${this.#baseUrl}/${this.#dataset} }`;
  }
}

/**
 * Helper function to create a FusekiConnector with default local settings
 * 
 * @param {string} dataset - Dataset name
 * @returns {FusekiConnector} New FusekiConnector instance
 */
export function createLocalConnector(dataset = 'test') {
  return new FusekiConnector({
    baseUrl: 'http://localhost:3030',
    dataset
  });
}
