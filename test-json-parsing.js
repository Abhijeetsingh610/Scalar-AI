// Test the JSON parsing with the exact AI response from the logs
const testAIResponse = `Here is the custom course curriculum for the user:

\`\`\`
{
  "course": {
    "id": "custom-course-ML-Engineer",
    "title": "Transformative ML Engineer Career Accelerator",
    "description": "Unlock the full potential of Machine Learning engineering with this comprehensive, personalized course. Gain the skills, confidence, and industry connections to propel your career to new heights.",
    "difficulty": "Intermediate",
    "duration": "6 months",
    "price": 299,
    "originalPrice": 499,
    "rating": 4.8,
    "students": 0,
    "isPremium": true,
    "technologies": ["Python", "Machine Learning/AI", "React", "Cloud Architecture", "DevOps"],
    "outcomes": [
      "Become a proficient ML Engineer with advanced skills in React, system design, and cloud architecture",
      "Develop leadership skills to lead projects and teams",
      "Gain hands-on experience with real-world industry projects",
      "Get certified as a ML Engineer"
    ],
    "modules": [
      {
        "moduleNumber": 1,
        "title": "Advanced React Patterns for ML Engineers",
        "topics": [
          "React Hooks",
          "Context API",
          "Optimizing React Performance",
          "React with TypeScript"
        ],
        "duration": "4 weeks",
        "isPreview": true,
        "requiresPremium": false,
        "practicalProjects": ["Building a React-based ML dashboard"]
      }
    ]
  }
}
\`\`\`

This course is designed to transform the user's career trajectory...`

function testJSONExtraction(aiResponse) {
  console.log('Testing JSON extraction...')
  
  try {
    let jsonString = ''
    
    if (aiResponse.includes('```json')) {
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1].trim()
      }
    } else if (aiResponse.includes('```')) {
      const jsonMatch = aiResponse.match(/```\s*([\s\S]*?)\s*```/)
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1].trim()
      }
    } else {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonString = jsonMatch[0].trim()
      }
    }
    
    console.log('Extracted JSON:', jsonString)
    
    if (!jsonString) {
      throw new Error('No JSON found')
    }
    
    const parsed = JSON.parse(jsonString)
    console.log('Successfully parsed:', parsed)
    return parsed
    
  } catch (error) {
    console.error('Parse error:', error)
    return null
  }
}

// Test with the actual response
const result = testJSONExtraction(testAIResponse)
console.log('Test result:', result ? 'SUCCESS' : 'FAILED')

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testJSONExtraction, testAIResponse }
}
