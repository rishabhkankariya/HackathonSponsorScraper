export class QueryExpander {
  private static cities = [
    // Maharashtra
    'Mumbai', 'Pune', 'Nagpur', 
    // All India
    'Bangalore', 'Hyderabad', 'Delhi NCR', 'Chennai', 'Ahmedabad', 'Jaipur',
    // Global
    'San Francisco', 'London', 'Berlin', 'Singapore', 'New York'
  ];

  private static keywords = [
    'hackathon sponsors',
    'major college hackathon partners',
    'AI hackathon sponsors list',
    'Web3 hackathon community partners',
    'Devpost hackathon sponsors',
    'Devfolio hackathon partners'
  ];

  static generateQueries(): string[] {
    const queries: string[] = [];
    
    for (const city of this.cities) {
      for (const keyword of this.keywords) {
        queries.push(`${keyword} in ${city} Maharashtra`);
      }
    }
    
    // Add some general ones
    queries.push('list of hackathon sponsors India');
    queries.push('top college hackathon partners Maharashtra');
    
    return queries;
  }
}
